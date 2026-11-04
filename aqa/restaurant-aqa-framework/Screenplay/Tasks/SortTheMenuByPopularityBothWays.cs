using Restaurant_Aqa_Framework.Api;
using Restaurant_Aqa_Framework.Api.Dtos.Dishes;

namespace Restaurant_Aqa_Framework.Screenplay.Tasks;

/// <summary>Sorts the whole menu by popularity in both directions and remembers the "most popular
/// first" list, so a later step can compare it with the "least popular first" one that stays the
/// scenario's last response. The popularity counts behind the ordering are not exposed on the
/// dishes themselves, so scenarios assert what a guest can observe: both directions succeed and
/// return the same dishes.</summary>
public sealed class SortTheMenuByPopularityBothWays : ITask
{
    /// <summary>Where the actor remembers the "most popular first" dish list.</summary>
    public const string MostPopularFirstMemory = "menuMostPopularFirst";

    public async Task PerformAsAsync(Actor actor)
    {
        var api = new DishesApi(actor.UsingTheApi());
        var leastPopularFirst = await api.GetDishesAsync(sortBy: DishSortOrder.PopularityAscending);
        var mostPopularFirst = await api.GetDishesAsync(sortBy: DishSortOrder.PopularityDescending);

        actor.Remember(MostPopularFirstMemory, await mostPopularFirst.ReadAsAsync<List<DishListResponse>>());
        await actor.TheLastResponse().CaptureAsync(leastPopularFirst);
    }
}
