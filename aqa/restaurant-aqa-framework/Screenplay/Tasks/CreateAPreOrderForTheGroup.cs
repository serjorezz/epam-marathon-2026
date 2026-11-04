using Restaurant_Aqa_Framework.Api;
using Restaurant_Aqa_Framework.Api.Dtos.Dishes;
using Restaurant_Aqa_Framework.Api.Dtos.Orders;
using Restaurant_Aqa_Framework.Api.Dtos.Reservations;

namespace Restaurant_Aqa_Framework.Screenplay.Tasks;

/// <summary>The owner creates a pre-order for the group reservation (required before a group submit
/// can succeed — the backend refuses with "Active pre-order for reservation not found." otherwise).
/// One line item with the remembered dish at <paramref name="dishIndex"/> is enough; consolidation
/// overwrites the composition on submit.</summary>
public sealed class CreateAPreOrderForTheGroup(int dishIndex = 0, int quantity = 1) : ITask
{
    public async Task PerformAsAsync(Actor actor)
    {
        var reservation = actor.Recall<ReservationResponse>(SetUpAGroupReservation.ReservationKey);
        var dish = actor.Recall<DishListResponse[]>(SetUpAGroupReservation.DishesKey)[dishIndex];
        var response = await new OrdersApi(actor.UsingTheApi()).CreateOrderAsync(
            new CreateOrderRequest(reservation.Id, [new OrderItemRequest(dish.Id, quantity)]),
            actor.Recall<string>(SetUpAGroupReservation.OwnerTokenKey));
        await actor.TheLastResponse().CaptureAsync(response);
    }
}
