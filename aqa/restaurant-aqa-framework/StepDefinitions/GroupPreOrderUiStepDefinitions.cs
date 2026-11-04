using Restaurant_Aqa_Framework.Api.Dtos.Auth;
using Restaurant_Aqa_Framework.Screenplay;
using Restaurant_Aqa_Framework.Screenplay.Questions;
using Restaurant_Aqa_Framework.Screenplay.Tasks;

namespace Restaurant_Aqa_Framework.StepDefinitions;

/// <summary>Step glue for the Direction 1 (group pre-order) features — UI stage. Data preparation
/// still goes through the API (allowed by the pyramid); the browser drives what the owner/guest
/// sees and does.</summary>
[Binding]
public sealed class GroupPreOrderUiStepDefinitions(Actor actor) : StepDefinitionBase(actor)
{
    [Given("the owner is signed in on the storefront")]
    public Task GivenTheOwnerIsSignedIn()
    {
        var owner = Recall<RegisterRequest>(SetUpAGroupReservation.OwnerKey);
        return Actor.AttemptsToAsync(new SignInThroughTheLoginForm(owner.Email, owner.Password));
    }

    [When("the owner opens the group pre-order page")]
    public Task WhenTheOwnerOpensThePage() => Actor.AttemptsToAsync(new OpenTheGroupOrderPage());

    [When("the owner submits the pre-order on the page")]
    public Task WhenTheOwnerSubmitsOnThePage() => Actor.AttemptsToAsync(new SubmitTheGroupPreOrderOnThePage());

    [When("the owner removes {word} from the group on the page")]
    public Task WhenTheOwnerRemovesOnThePage(string name) =>
        Actor.AttemptsToAsync(new RemoveTheGroupParticipantOnThePage(name));

    [When("a guest called {word} opens the invite link")]
    public Task WhenAGuestOpensTheInviteLink(string name) =>
        Actor.AttemptsToAsync(new JoinTheGroupThroughThePage(name));

    [When("{word} adds the first menu dish to her cart")]
    [When("{word} adds the first menu dish to his cart")]
    public Task WhenTheGuestAddsTheFirstDish(string name) =>
        Actor.AttemptsToAsync(new AddTheFirstDishToTheGuestCartOnThePage());

    [When("{word} confirms her pre-order")]
    [When("{word} confirms his pre-order")]
    public Task WhenTheGuestConfirms(string name) => Actor.AttemptsToAsync(new SubmitTheGuestCartOnThePage());

    [Then("the page lists {int} participants")]
    [Then("the page lists {int} participant")]
    public async Task ThenThePageLists(int count)
    {
        var shown = await Actor.AsksForAsync(new TheParticipantsShownOnThePage());
        await Assert.That(shown.Count).IsEqualTo(count);
    }

    [Then("the page shows the participant called {word} as still choosing")]
    public async Task ThenThePageShowsStillChoosing(string name)
    {
        var shown = await Actor.AsksForAsync(new TheParticipantsShownOnThePage());
        var participant = shown.Single(p => p.Name == name);
        await Assert.That(participant.Status).IsEqualTo("Still choosing");
    }

    // The page's grand-total row reflects the CONSOLIDATED order (0 while collecting), so the
    // comparable figure is the sum of the per-participant subtotals shown on the cards.
    [Then("the page's participant subtotals add up to the service grand total")]
    public async Task ThenThePageMatchesTheServiceTotal()
    {
        var service = await Actor.AsksForAsync(new TheGroupParticipants());
        var shown = await Actor.AsksForAsync(new TheParticipantsShownOnThePage());
        await Assert.That(Math.Round(shown.Sum(p => p.Total), 2)).IsEqualTo(Math.Round(service.Total, 2))
            .Because("the page renders subtotals as currency rounded to two decimals");
    }

    [Then("the page no longer shows the participant called {word}")]
    public async Task ThenThePageNoLongerShows(string name) =>
        await Eventually(async () =>
            !(await Actor.AsksForAsync(new TheParticipantsShownOnThePage())).Any(p => p.Name == name),
            $"the page should stop listing {name}");

    [Then("the page shows the group as sent to the restaurant")]
    public async Task ThenThePageShowsSent() =>
        await Eventually(async () =>
            await Actor.AsksForAsync(new TheGroupStatusShownOnThePage()) == "Sent to Restaurant",
            "the page should show the group as sent to the restaurant");

    // The page refetches on a poll interval, so UI read-backs may need a moment to converge.
    private static async Task Eventually(Func<Task<bool>> condition, string because)
    {
        var deadline = DateTime.UtcNow.AddSeconds(30);
        while (DateTime.UtcNow < deadline)
        {
            if (await condition())
                return;
            await Task.Delay(500);
        }

        await Assert.That(await condition()).IsTrue().Because(because);
    }

    [Then("{word} sees that her pre-order was submitted")]
    [Then("{word} sees that his pre-order was submitted")]
    public async Task ThenTheGuestSeesConfirmation(string name) =>
        await Assert.That(await Actor.AsksForAsync(new TheGuestPreOrderConfirmation())).IsTrue();

    [Then("the owner sees {word}'s cart among the participants")]
    public async Task ThenTheOwnerSeesTheGuestCart(string name)
    {
        var view = await Actor.AsksForAsync(new TheGroupParticipants());
        var participant = view.Participants.Single(p => p.Name == name);
        await Assert.That(participant.Items.Count).IsGreaterThan(0);
    }
}
