using Restaurant_Aqa_Framework.Api;
using Restaurant_Aqa_Framework.Api.Dtos.Auth;
using Restaurant_Aqa_Framework.Api.Dtos.GroupReservations;
using Restaurant_Aqa_Framework.Api.Dtos.Reservations;
using Restaurant_Aqa_Framework.Api.Seeding;

namespace Restaurant_Aqa_Framework.Screenplay.Tasks;

/// <summary>Books a second, independent group reservation for the customer remembered under
/// "other:{name}" — on a private location/table of their own — and remembers its group id under
/// "secondGroupId". Used to prove participants cannot be mixed across groups.</summary>
public sealed class SetUpASecondGroupReservation(string ownerName) : ITask
{
    public const string SecondGroupIdKey = "secondGroupId";

    public async Task PerformAsAsync(Actor actor)
    {
        var token = actor.Recall<string>(RegisterAnotherCustomer.TokenKeyFor(ownerName));
        var api = actor.UsingTheApi();
        var venue = await SetUpAGroupReservation.PrivateVenue.SetUpAsync(actor);
        var start = SetUpAGroupReservation.RandomStart();
        var reservations = new ReservationsApi(api);
        var reservationResponse = await reservations.CreateReservationAsync(
            new CreateReservationRequest(venue.TableId, start, start.AddHours(1.5), 3), token);
        var reservation = reservationResponse.Ok
            ? await reservationResponse.ReadAsAsync<ReservationResponse>()
            : throw new InvalidOperationException(
                $"Second group reservation failed with {reservationResponse.Status}: {await reservationResponse.ReadErrorMessageAsync()}");
        actor.Recall<CleanupScope>().TrackDelete($"second-group-reservation:{reservation.Id}",
            () => reservations.CancelReservationAsync(reservation.Id, token));

        var groups = new GroupReservationsApi(api);
        var invite = await (await groups.GetInviteTokenAsync(reservation.Id, token)).ReadAsAsync<InviteTokenResponse>();
        var info = await (await groups.GetByInviteTokenAsync(invite.Token)).ReadAsAsync<GroupInviteResponse>();
        actor.Remember(SecondGroupIdKey, info.GroupReservationId);
    }
}
