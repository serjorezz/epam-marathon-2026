using Restaurant_Aqa_Framework.Api;

namespace Restaurant_Aqa_Framework.Screenplay.Tasks;

/// <summary>Searches the menu by name and remembers the exact term, so a later step can check that
/// every dish shown actually matches it.</summary>
public sealed class SearchTheMenuByName(string term) : ITask
{
    /// <summary>Where the actor remembers the term this task searched for.</summary>
    public const string TermMemory = "menuSearchTerm";

    public async Task PerformAsAsync(Actor actor)
    {
        actor.Remember(TermMemory, term);
        await actor.TheLastResponse().CaptureAsync(
            await new DishesApi(actor.UsingTheApi()).GetDishesAsync(name: term));
    }
}
