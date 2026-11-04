using Restaurant_Aqa_Framework.Api.Dtos.Dishes;
using Restaurant_Aqa_Framework.Screenplay;
using Restaurant_Aqa_Framework.Screenplay.Questions;
using Restaurant_Aqa_Framework.Screenplay.Tasks;
using Restaurant_Aqa_Framework.Support;
using Restaurant_Aqa_Framework.Api.Seeding;

namespace Restaurant_Aqa_Framework.StepDefinitions;

/// <summary>What guests see on the menu: browsing, sorting, searching and opening a dish. The dish "the kitchen
/// has added" is a Screenplay task and is remembered, so any step in any class can refer to "that dish".</summary>
[Binding]
public sealed class MenuCatalogStepDefinitions(Actor actor) : StepDefinitionBase(actor)
{
    [Given("the restaurant has a location")]
    public Task GivenRestaurantHasALocation() => Actor.AttemptsToAsync(new ChooseAnExistingLocation());

    [Given("the kitchen has added a {dish_type} dish")]
    public Task GivenKitchenHasAddedADish(DishType type) => Actor.AttemptsToAsync(new AddDish(type));

    [When("a guest browses {dish_type} dishes")]
    public Task WhenGuestBrowsesDishes(DishType type) => Actor.AttemptsToAsync(new BrowseTheMenu(category: type));

    [When("a guest sorts the menu by {sort_order}")]
    public Task WhenGuestSortsTheMenu(DishSortOrder order) => Actor.AttemptsToAsync(new BrowseTheMenu(sortedBy: order));

    [When("a guest browses {dish_type} dishes sorted by {sort_order}")]
    public Task WhenGuestBrowsesDishesSorted(DishType type, DishSortOrder order) =>
        Actor.AttemptsToAsync(new BrowseTheMenu(category: type, sortedBy: order));

    [When("a guest searches the menu for that dish by name")]
    public Task WhenGuestSearchesForThatDish() =>
        Actor.AttemptsToAsync(new BrowseTheMenu(nameContains: Recall<DishResponse>().Name));

    /// <summary>Uses the dish's trailing name token as the search term, so the term is a realistic
    /// fragment a guest would type rather than the full generated name.</summary>
    [When("a guest searches the menu for part of that dish's name")]
    public Task WhenGuestSearchesForPartOfThatDish()
    {
        var dishName = Recall<DishResponse>().Name;
        return Actor.AttemptsToAsync(new SearchTheMenuByName(dishName.Split(' ')[^1]));
    }

    [When("a guest searches the menu for a dish that nobody serves")]
    public Task WhenGuestSearchesForADishThatNobodyServes() =>
        Actor.AttemptsToAsync(new SearchTheMenuByName($"{SampleDataFactory.Prefix}No-Such-Dish-{Guid.NewGuid():N}"));

    [When("a guest sorts the menu by popularity in both directions")]
    public Task WhenGuestSortsByPopularityInBothDirections() =>
        Actor.AttemptsToAsync(new SortTheMenuByPopularityBothWays());

    [When("a guest opens that dish")]
    public Task WhenGuestOpensThatDish() => Actor.AttemptsToAsync(new OpenTheDish());

    [When("a guest opens a {item} that does not exist")]
    public Task WhenGuestOpensMissingItem(string item) => Actor.AttemptsToAsync(new OpenSomethingThatDoesNotExist(item));

    [Then("all the dishes shown are {dish_type} dishes")]
    public async Task ThenAllDishesAreOfType(DishType type)
    {
        var dishes = await Actor.AsksForAsync(new TheDishesShown());
        await Assert.That(dishes.Where(d => d.DishType != type.ToLabel()).Select(d => d.Name).ToList()).IsEmpty();
    }

    [Then("the dishes are listed {price_order}")]
    public async Task ThenDishesAreListedByPrice(SortDirection direction)
    {
        var prices = (await Actor.AsksForAsync(new TheDishesShown())).Select(d => d.Price).ToList();
        var expected = direction == SortDirection.Ascending ? prices.Order().ToList() : prices.OrderDescending().ToList();

        await Assert.That(prices.SequenceEqual(expected)).IsTrue().Because($"prices were [{string.Join(", ", prices)}]");
    }

    [Then("that dish appears in the results")]
    public async Task ThenThatDishAppearsInResults() =>
        await Assert.That((await Actor.AsksForAsync(new TheDishesShown())).Select(d => d.Id)).Contains(Recall<DishResponse>().Id);

    [Then("that dish does not appear in the results")]
    public async Task ThenThatDishDoesNotAppearInResults() =>
        await Assert.That((await Actor.AsksForAsync(new TheDishesShown())).Select(d => d.Id)).DoesNotContain(Recall<DishResponse>().Id);

    /// <summary>Every dish on the page must actually match the term the guest searched for — the rule a
    /// filter lives and dies by. The term is the one <see cref="SearchTheMenuByName"/> remembered.</summary>
    [Then("all the dishes shown match the search")]
    public async Task ThenAllDishesMatchTheSearch()
    {
        var term = Recall<string>(SearchTheMenuByName.TermMemory);
        var mismatches = (await Actor.AsksForAsync(new TheDishesShown()))
            .Where(dish => !dish.Name.Contains(term, StringComparison.OrdinalIgnoreCase))
            .Select(dish => dish.Name)
            .ToList();

        await Assert.That(mismatches).IsEmpty();
    }

    [Then("no dishes are shown")]
    public async Task ThenNoDishesAreShown() =>
        await Assert.That(await Actor.AsksForAsync(new TheDishesShown())).IsEmpty();

    /// <summary>The popularity counts behind the ordering are not exposed on the dishes themselves, so the
    /// observable guarantee is that both directions sort the whole catalog — same dishes, none lost or added.
    /// The "least popular first" list is the scenario's last response; "most popular first" is remembered.</summary>
    [Then("both directions show the same dishes")]
    public async Task ThenBothDirectionsShowTheSameDishes()
    {
        var leastPopularFirst = (await Actor.AsksForAsync(new TheDishesShown())).Select(d => d.Id).ToList();
        var mostPopularFirst = Recall<List<DishListResponse>>(SortTheMenuByPopularityBothWays.MostPopularFirstMemory)
            .Select(d => d.Id)
            .ToList();

        await Assert.That(leastPopularFirst.Count).IsEqualTo(mostPopularFirst.Count).Because(
            $"least popular first: [{string.Join(", ", leastPopularFirst)}]; most popular first: [{string.Join(", ", mostPopularFirst)}]");
        await Assert.That(leastPopularFirst.Except(mostPopularFirst)).IsEmpty().Because(
            "the two popularity directions returned different dishes");
    }

    [Then("the dish is shown with:")]
    public async Task ThenDishIsShownWith(Fields expected)
    {
        foreach (var key in expected.Keys.ToList())
            if (expected[key] == "(sample dish name)")
                expected[key] = Recall<DishResponse>().Name;

        await Assert.That(expected.Mismatches(await Actor.AsksForAsync(new TheResponseJson()))).IsEmpty();
    }

    [When("a guest views the menu")]
    public Task WhenGuestViewsTheMenu() => Actor.AttemptsToAsync(new OpenTheMenuPage());

    [Then("that dish is visible on the menu")]
    public async Task ThenThatDishIsVisibleOnTheMenu() =>
        await Assert.That(await Actor.AsksForAsync(new TheDishOnTheMenu(Recall<DishResponse>().Name))).IsTrue();
}
