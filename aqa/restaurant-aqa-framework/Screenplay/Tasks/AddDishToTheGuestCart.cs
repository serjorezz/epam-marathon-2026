using Restaurant_Aqa_Framework.Api;
using Restaurant_Aqa_Framework.Api.Dtos.Dishes;
using Restaurant_Aqa_Framework.Api.Dtos.GuestSessions;

namespace Restaurant_Aqa_Framework.Screenplay.Tasks;

/// <summary>Adds <paramref name="quantity"/> of the remembered dish at <paramref name="dishIndex"/>
/// (0-based; the feature file numbers dishes from 1) to the named guest's cart. Tracks the cart
/// contents per guest under "cart:{name}" (dishId -> quantity) for later assertions.</summary>
public sealed class AddDishToTheGuestCart(string guestName, int dishIndex, int quantity) : ITask
{
    public static string CartKeyFor(string guestName) => $"cart:{guestName}";

    public async Task PerformAsAsync(Actor actor)
    {
        var guest = actor.Recall<CreateGuestSessionResponse>(JoinTheGroupAsGuest.KeyFor(guestName));
        var dish = actor.Recall<DishListResponse[]>(SetUpAGroupReservation.DishesKey)[dishIndex];
        var response = await new GuestSessionsApi(actor.UsingTheApi()).AddDishAsync(
            guest.SessionId, new AddGuestSessionDishRequest(dish.Id, quantity), guest.SessionToken);
        await actor.TheLastResponse().CaptureAsync(response);
        if (!response.Ok)
            return;

        var cart = CartOf(actor, guestName);
        cart[dish.Id] = cart.TryGetValue(dish.Id, out var current) ? current + quantity : quantity;
        actor.Remember(CartKeyFor(guestName), cart);
    }

    internal static Dictionary<string, int> CartOf(Actor actor, string guestName)
    {
        try
        {
            return actor.Recall<Dictionary<string, int>>(CartKeyFor(guestName));
        }
        catch (Exception)
        {
            return new Dictionary<string, int>();
        }
    }
}
