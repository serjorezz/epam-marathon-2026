using Restaurant_Aqa_Framework.Api;
using Restaurant_Aqa_Framework.Api.Dtos.GroupReservations;
using Restaurant_Aqa_Framework.Api.Dtos.Reservations;

namespace Restaurant_Aqa_Framework.Screenplay.Tasks;

/// <summary>The owner (or, for negative scenarios, another customer) consolidates all submitted guest
/// carts into the reservation's pre-order. Remembers the consolidated composition
/// (SubmittedDishDto[]) under "groupConsolidated" on success. The group/reservation id overrides
/// exist for the not-found scenarios.</summary>
public sealed class SubmitTheGroupPreOrder(
    string? onBehalfOf = null, string? groupIdOverride = null, string? reservationIdOverride = null) : ITask
{
    public const string ConsolidatedKey = "groupConsolidated";

    public async Task PerformAsAsync(Actor actor)
    {
        var groupId = groupIdOverride ?? actor.Recall<string>(SetUpAGroupReservation.GroupIdKey);
        var reservationId = reservationIdOverride
            ?? actor.Recall<ReservationResponse>(SetUpAGroupReservation.ReservationKey).Id;
        var token = onBehalfOf is null
            ? actor.Recall<string>(SetUpAGroupReservation.OwnerTokenKey)
            : actor.Recall<string>(RegisterAnotherCustomer.TokenKeyFor(onBehalfOf));
        var response = await new GroupReservationsApi(actor.UsingTheApi()).SubmitAsync(
            groupId, new SubmitGroupPreOrderRequest(reservationId), token);
        await actor.TheLastResponse().CaptureAsync(response);
        if (response.Ok)
            actor.Remember(ConsolidatedKey, actor.TheLastResponse().Json<SubmittedDishDto[]>());
    }
}
