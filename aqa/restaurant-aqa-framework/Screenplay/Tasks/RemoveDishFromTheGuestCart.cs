using Restaurant_Aqa_Framework.Api;
using Restaurant_Aqa_Framework.Api.Dtos.Dishes;
using Restaurant_Aqa_Framework.Api.Dtos.GuestSessions;

namespace Restaurant_Aqa_Framework.Screenplay.Tasks;

/// <summary>Removes <paramref name="quantity"/> portions of the remembered dish at
/// <paramref name="dishIndex"/> from the named guest's cart and updates the tracked "cart:{name}"
/// contents. The backend decrements by quantity and drops the line at zero — and requires the
/// quantity field even for removals ("DishId is required and Quantity must be greater than zero.").</summary>
public sealed class RemoveDishFromTheGuestCart(string guestName, int dishIndex, int quantity = 1) : ITask
{
    public async Task PerformAsAsync(Actor actor)
    {
        var guest = actor.Recall<CreateGuestSessionResponse>(JoinTheGroupAsGuest.KeyFor(guestName));
        var dish = actor.Recall<DishListResponse[]>(SetUpAGroupReservation.DishesKey)[dishIndex];
        var response = await new GuestSessionsApi(actor.UsingTheApi()).RemoveDishAsync(
            guest.SessionId, new RemoveGuestSessionDishRequest(dish.Id, quantity), guest.SessionToken);
        await actor.TheLastResponse().CaptureAsync(response);
        if (response.Ok)
        {
            var cart = AddDishToTheGuestCart.CartOf(actor, guestName);
            var remaining = cart.TryGetValue(dish.Id, out var current) ? current - quantity : 0;
            if (remaining > 0) cart[dish.Id] = remaining;
            else cart.Remove(dish.Id);
            actor.Remember(AddDishToTheGuestCart.CartKeyFor(guestName), cart);
        }
    }
}
