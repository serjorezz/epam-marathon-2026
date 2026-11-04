using Microsoft.Playwright;
using Restaurant_Aqa_Framework.Api;
using Restaurant_Aqa_Framework.Api.Dtos.Auth;
using Restaurant_Aqa_Framework.Api.Dtos.Dishes;
using Restaurant_Aqa_Framework.Api.Dtos.GroupReservations;
using Restaurant_Aqa_Framework.Api.Dtos.Locations;
using Restaurant_Aqa_Framework.Api.Dtos.Reservations;
using Restaurant_Aqa_Framework.Api.Dtos.Tables;
using Restaurant_Aqa_Framework.Api.Dtos.Waiters;
using Restaurant_Aqa_Framework.Api.Seeding;
using Restaurant_Aqa_Framework.Screenplay.Questions;

namespace Restaurant_Aqa_Framework.Screenplay.Tasks;

/// <summary>The shared arrange for Direction 1 scenarios. Everything is private to the scenario:
/// a fresh owner customer, a freshly created location with a table and two menu dishes, and the
/// group reservation on that table. Seeded tables are NOT used — cancelling a reservation leaves
/// a Cancelled row that still blocks re-booking (the backend's overlap check ignores status, a
/// known defect), so sharing seeded tables would poison them for hours. Private entities are really
/// deleted on cleanup (location force-delete cascades the table), leaving nothing behind.
/// Remembers: "groupOwner" (RegisterRequest), "groupOwnerToken", "groupReservation"
/// (ReservationResponse), "groupId", "groupInviteToken" and "groupDishes" (DishListResponse[2]).</summary>
/// <param name="guestCount">5 — the backend rejects a join once joinedGuests + 1 >= GuestCount, so a
/// reservation of N guests accepts at most N - 2 guest sessions (the owner session and an off-by-one
/// consume the rest); 3 scenario guests need 5.</param>
public sealed class SetUpAGroupReservation(int guestCount = 5) : ITask
{
    public const string OwnerKey = "groupOwner";
    public const string OwnerTokenKey = "groupOwnerToken";
    public const string ReservationKey = "groupReservation";
    public const string GroupIdKey = "groupId";
    public const string DishesKey = "groupDishes";
    public const string InviteTokenKey = "groupInviteToken";

    public async Task PerformAsAsync(Actor actor)
    {
        var api = actor.UsingTheApi();
        var auth = new AuthApi(api);

        var owner = SampleDataFactory.RegisterRequest();
        actor.Remember(OwnerKey, owner);
        await actor.TheLastResponse().CaptureAsync(await auth.RegisterAsync(owner));
        var signIn = await auth.SignInAsync(new SignInRequest(owner.Email, owner.Password));
        var ownerToken = signIn.Ok
            ? (await signIn.ReadAsAsync<SignInResponse>()).IdToken
            : throw new InvalidOperationException($"Group owner sign-in failed: {await signIn.ReadErrorMessageAsync()}");
        actor.Remember(OwnerTokenKey, ownerToken);

        var venue = await PrivateVenue.SetUpAsync(actor);
        var start = RandomStart();
        var reservationResponse = await new ReservationsApi(api).CreateReservationAsync(
            new CreateReservationRequest(venue.TableId, start, start.AddHours(1.5), guestCount),
            ownerToken);
        await actor.TheLastResponse().CaptureAsync(reservationResponse);
        var reservation = reservationResponse.Ok
            ? await reservationResponse.ReadAsAsync<ReservationResponse>()
            : throw new InvalidOperationException(
                $"Group reservation booking failed with {reservationResponse.Status}: {await reservationResponse.ReadErrorMessageAsync()}");
        actor.Remember(ReservationKey, reservation);
        actor.Recall<CleanupScope>().TrackDelete($"group-reservation:{reservation.Id}",
            () => new ReservationsApi(actor.UsingTheApi()).CancelReservationAsync(reservation.Id, ownerToken));

        var groups = new GroupReservationsApi(api);
        var inviteResponse = await groups.GetInviteTokenAsync(reservation.Id, ownerToken);
        await actor.TheLastResponse().CaptureAsync(inviteResponse);
        var invite = inviteResponse.Ok
            ? await inviteResponse.ReadAsAsync<InviteTokenResponse>()
            : throw new InvalidOperationException(
                $"Invite token fetch failed with {inviteResponse.Status}: {await inviteResponse.ReadErrorMessageAsync()}");
        var info = await (await groups.GetByInviteTokenAsync(invite.Token)).ReadAsAsync<GroupInviteResponse>();
        actor.Remember(GroupIdKey, info.GroupReservationId);
        actor.Remember(InviteTokenKey, invite.Token);

        // The venue's own menu — guest carts only accept dishes served at the group's location.
        var menu = await (await new LocationsApi(api).GetDishesForLocationAsync(venue.LocationId))
            .ReadAsAsync<DishListResponse[]>();
        actor.Remember(DishesKey, menu.Take(2).ToArray());
    }

    internal static DateTime RandomStart() =>
        DateTime.UtcNow.AddHours(3 + Random.Shared.Next(0, 12)).AddMinutes(Random.Shared.Next(0, 59));

    /// <summary>Location + table + two menu dishes, all tracked for removal, plus a dedicated
    /// waiter user registered and assigned to the location (a location with no waiter cannot accept
    /// bookings). The venue waiter is NOT the group owner: POST /waiters also adds the user to the
    /// Cognito Waiter group, which would corrupt the owner's customer persona. Shared by the main
    /// arrange and SetUpASecondGroupReservation.</summary>
    internal sealed record PrivateVenue(string LocationId, string TableId)
    {
        public static async Task<PrivateVenue> SetUpAsync(Actor actor)
        {
            var api = actor.UsingTheApi();
            var waiter = await actor.AsksForAsync(new TheWaiterSession());

            var venueWaiter = SampleDataFactory.RegisterRequest();
            await new AuthApi(api).RegisterAsync(venueWaiter);

            var locations = new LocationsApi(api);
            var location = await (await locations.CreateLocationAsync(SampleDataFactory.CreateLocationRequest()))
                .ReadAsAsync<LocationResponse>();

            var table = await (await new TablesApi(api).CreateTableAsync(
                    SampleDataFactory.CreateTableRequest(location.Id, 6)))
                .ReadAsAsync<TableResponse>();

            var dishesApi = new DishesApi(api);
            foreach (var dishType in new[] { DishType.MainCourse, DishType.Dessert })
            {
                var dish = await (await dishesApi.CreateDishAsync(
                        SampleDataFactory.CreateDishRequest([location.Id], dishType), waiter.IdToken))
                    .ReadAsAsync<DishResponse>();
                actor.Recall<CleanupScope>().TrackDelete($"group-dish:{dish.Id}",
                    () => dishesApi.DeleteDishAsync(dish.Id, force: true, bearerToken: waiter.IdToken));
            }

            var waiters = new WaitersApi(api);
            var assignment = new UpdateWaiterListRequest(venueWaiter.Email, location.Id);
            var assignmentResponse = await waiters.AddToWaitersListAsync(assignment, waiter.IdToken);
            if (!assignmentResponse.Ok)
                throw new InvalidOperationException(
                    $"Registering the venue waiter failed with {assignmentResponse.Status}: {await assignmentResponse.ReadErrorMessageAsync()}");
            actor.Recall<CleanupScope>().TrackDelete($"group-waiter:{venueWaiter.Email}",
                () => waiters.RemoveFromWaitersListAsync(assignment, waiter.IdToken));

            actor.Recall<CleanupScope>().TrackDelete($"group-location:{location.Id}",
                () => locations.DeleteLocationAsync(location.Id, force: true, bearerToken: waiter.IdToken));

            return new PrivateVenue(location.Id, table.Id);
        }
    }
}
