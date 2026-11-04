using Restaurant_Aqa_Framework.Api.Dtos.Dishes;
using Restaurant_Aqa_Framework.Api.Dtos.GroupReservations;
using Restaurant_Aqa_Framework.Api.Dtos.GuestSessions;
using Restaurant_Aqa_Framework.Api.Dtos.Orders;
using Restaurant_Aqa_Framework.Screenplay;
using Restaurant_Aqa_Framework.Screenplay.Questions;
using Restaurant_Aqa_Framework.Screenplay.Tasks;

namespace Restaurant_Aqa_Framework.StepDefinitions;

/// <summary>Step glue for the Direction 1 (group pre-order) features — API stage. All state passes
/// through actor memory; every assertion reads fresh state or the captured last response.</summary>
[Binding]
public sealed class GroupPreOrderStepDefinitions(Actor actor) : StepDefinitionBase(actor)
{
    // ---- arrange ----

    [Given("an owner has set up a group reservation")]
    public Task GivenAnOwnerHasSetUpAGroupReservation() => Actor.AttemptsToAsync(new SetUpAGroupReservation());

    [Given("a guest called {word} has joined the group")]
    [Given("a guest called {word} has joined the owner's group")]
    public Task GivenAGuestHasJoined(string name) => Actor.AttemptsToAsync(new JoinTheGroupAsGuest(name));

    [Given("a guest called {word} has joined Mallory's group")]
    public Task GivenAGuestHasJoinedSecondGroup(string name) =>
        Actor.AttemptsToAsync(new JoinTheGroupAsGuest(name, SetUpASecondGroupReservation.SecondGroupIdKey));

    [Given("another customer called {word} exists")]
    public Task GivenAnotherCustomerExists(string name) => Actor.AttemptsToAsync(new RegisterAnotherCustomer(name));

    [Given("another customer called {word} has a group reservation of their own")]
    public async Task GivenAnotherCustomerHasAGroup(string name) =>
        await Actor.AttemptsToAsync(new RegisterAnotherCustomer(name), new SetUpASecondGroupReservation(name));

    [Given("{word} adds {int} portions of menu dish {int} to her cart")]
    [Given("{word} adds {int} portions of menu dish {int} to his cart")]
    [Given("{word} adds {int} portion of menu dish {int} to her cart")]
    [Given("{word} adds {int} portion of menu dish {int} to his cart")]
    public Task GivenAGuestAdds(string name, int quantity, int dishNumber) =>
        Actor.AttemptsToAsync(new AddDishToTheGuestCart(name, dishNumber - 1, quantity));

    [When("{word} removes menu dish {int} from her cart")]
    [When("{word} removes menu dish {int} from his cart")]
    public Task WhenAGuestRemovesDish(string name, int dishNumber) =>
        Actor.AttemptsToAsync(new RemoveDishFromTheGuestCart(name, dishNumber - 1));

    [Given("{word} confirms her cart")]
    [Given("{word} confirms his cart")]
    public Task GivenAGuestConfirms(string name) => Actor.AttemptsToAsync(new SubmitTheGuestCart(name));

    [Given("the owner has prepared a pre-order for the group")]
    public Task GivenTheOwnerPreparedAPreOrder() => Actor.AttemptsToAsync(new CreateAPreOrderForTheGroup());

    [Given("the owner has submitted the group pre-order")]
    public Task GivenTheOwnerSubmitted() => Actor.AttemptsToAsync(new SubmitTheGroupPreOrder());

    // ---- acting ----

    [When("the owner checks the group pre-order")]
    public async Task WhenTheOwnerChecks() =>
        Actor.Remember("groupView", await Actor.AsksForAsync(new TheGroupParticipants()));

    // The name tells us the persona: a remembered guest session means it's a guest, otherwise a
    // registered second customer.
    [When("{word} tries to check the group pre-order")]
    public Task WhenSomeoneChecks(string name)
    {
        var isGuest = IsRemembered<CreateGuestSessionResponse>(JoinTheGroupAsGuest.KeyFor(name));
        return Actor.AttemptsToAsync(new TryToCheckTheGroupPreOrder(
            isGuest ? GroupPreOrderViewer.Guest : GroupPreOrderViewer.AnotherCustomer, name));
    }

    [When("the waiter tries to check the group pre-order")]
    public Task WhenTheWaiterChecks() =>
        Actor.AttemptsToAsync(new TryToCheckTheGroupPreOrder(GroupPreOrderViewer.Waiter));

    [When("an anonymous visitor tries to check the group pre-order")]
    public Task WhenAnonymousChecks() =>
        Actor.AttemptsToAsync(new TryToCheckTheGroupPreOrder(GroupPreOrderViewer.Anonymous));

    [When("the owner checks a group pre-order that does not exist")]
    public async Task WhenTheOwnerChecksAMissingGroup()
    {
        var response = await new Api.GroupReservationsApi(Actor.UsingTheApi()).GetSessionsAsync(
            "no-such-group", Recall<string>(SetUpAGroupReservation.OwnerTokenKey));
        await Actor.TheLastResponse().CaptureAsync(response);
    }

    [When("the owner submits the group pre-order")]
    [When("the owner submits the group pre-order again")]
    public Task WhenTheOwnerSubmits() => Actor.AttemptsToAsync(new SubmitTheGroupPreOrder());

    [When("the owner submits the group pre-order of a reservation that does not exist")]
    public Task WhenTheOwnerSubmitsMissingReservation() =>
        Actor.AttemptsToAsync(new SubmitTheGroupPreOrder(reservationIdOverride: "no-such-reservation"));

    [When("the owner submits a group pre-order that does not exist")]
    public Task WhenTheOwnerSubmitsMissingGroup() =>
        Actor.AttemptsToAsync(new SubmitTheGroupPreOrder(groupIdOverride: "no-such-group"));

    [When("{word} submits the group pre-order")]
    public Task WhenSomeoneElseSubmits(string name) =>
        Actor.AttemptsToAsync(new SubmitTheGroupPreOrder(onBehalfOf: name));

    [When("the owner removes {word} from the group")]
    public Task WhenTheOwnerRemoves(string name) => Actor.AttemptsToAsync(new RemoveTheGroupParticipant(name));

    [When("the owner removes a participant who does not exist")]
    public Task WhenTheOwnerRemovesANonexistentParticipant() =>
        Actor.AttemptsToAsync(new RemoveTheGroupParticipant("", nonExistent: true));

    [When("{word} removes {word} from the group")]
    public Task WhenSomeoneElseRemoves(string who, string name) =>
        Actor.AttemptsToAsync(new RemoveTheGroupParticipant(name, onBehalfOf: who));

    [When("the waiter checks the reservation's pre-order")]
    public async Task WhenTheWaiterChecksTheOrder()
    {
        var waiter = await Actor.AsksForAsync(new TheWaiterSession());
        Actor.Remember("waiterOrderView", await Actor.AsksForAsync(new TheOrderForTheGroup(waiter.IdToken)));
    }

    // ---- assertions on the participant list ----

    [Then("the group pre-order shows {int} participants")]
    [Then("the group pre-order shows {int} participant")]
    public async Task ThenShowsParticipants(int count)
    {
        var view = await Actor.AsksForAsync(new TheGroupParticipants());
        await Assert.That(view.Participants.Count).IsEqualTo(count)
            .Because($"participants: {string.Join(", ", view.Participants.Select(p => $"{p.Name}({p.Type}, submitted={p.IsSubmitted})"))}");
    }

    [Then("the group pre-order shows no participants")]
    public async Task ThenShowsNoParticipants() =>
        await Assert.That((await Actor.AsksForAsync(new TheGroupParticipants())).Participants).IsEmpty();

    [Then("the participant called {word} is no longer listed")]
    public async Task ThenNotListed(string name)
    {
        var view = await Actor.AsksForAsync(new TheGroupParticipants());
        await Assert.That(view.Participants.Select(p => p.Name)).DoesNotContain(name);
    }

    [Then("the participant called {word} has no dishes")]
    public async Task ThenHasNoDishes(string name)
    {
        var participant = await ParticipantCalled(name);
        await Assert.That(participant.Items).IsEmpty();
        await Assert.That(participant.Total).IsEqualTo(0m);
    }

    [Then("the participant called {word} is marked as still choosing")]
    public async Task ThenStillChoosing(string name)
    {
        var participant = await ParticipantCalled(name);
        await Assert.That(participant.IsSubmitted).IsFalse();
    }

    [Then("the participant called {word} has {int} dishes with the quantities they ordered")]
    [Then("the participant called {word} has {int} dish with the quantity they ordered")]
    public async Task ThenDishesWithQuantities(string name, int dishCount)
    {
        var participant = await ParticipantCalled(name);
        var expected = AddDishToTheGuestCart.CartOf(Actor, name);
        await Assert.That(participant.Items.Select(i => i.Dish.Id).OrderBy(id => id))
            .IsEquivalentTo(expected.Keys.OrderBy(id => id));
        foreach (var item in participant.Items)
            await Assert.That(item.Quantity).IsEqualTo(expected[item.Dish.Id]);
        await Assert.That(participant.Items.Select(i => i.Dish.Id).Distinct().Count()).IsEqualTo(dishCount);
    }

    [Then("each participant total matches the value of their cart")]
    public async Task ThenParticipantTotalsMatchCarts()
    {
        var view = await Actor.AsksForAsync(new TheGroupParticipants());
        var dishes = Recall<DishListResponse[]>(SetUpAGroupReservation.DishesKey);
        decimal PriceOf(string dishId) => dishes.First(d => d.Id == dishId).Price;

        foreach (var participant in view.Participants)
        {
            var expected = AddDishToTheGuestCart.CartOf(Actor, participant.Name);
            await Assert.That(participant.Total)
                .IsEqualTo(expected.Sum(pair => pair.Value * PriceOf(pair.Key)))
                .Because($"participant {participant.Name} should be charged for exactly their cart");
        }
    }

    [Then("the grand total equals the sum of the participant totals")]
    [Then("the grand total equals the sum of the remaining participant totals")]
    public async Task ThenGrandTotalIsSum()
    {
        var view = await Actor.AsksForAsync(new TheGroupParticipants());
        await Assert.That(view.Total).IsEqualTo(view.Participants.Sum(p => p.Total));
    }

    [Then("the grand total is {int}")]
    public async Task ThenGrandTotalIs(int total) =>
        await Assert.That((await Actor.AsksForAsync(new TheGroupParticipants())).Total).IsEqualTo((decimal)total);

    // ---- assertions on the submission ----

    [Then("the consolidated pre-order shows {int} portions of menu dish {int}")]
    public async Task ThenConsolidatedShows(int quantity, int dishNumber)
    {
        var dish = Recall<DishListResponse[]>(SetUpAGroupReservation.DishesKey)[dishNumber - 1];
        var consolidated = await Actor.AsksForAsync(new TheConsolidatedPreOrder());
        await Assert.That(consolidated.Where(c => c.DishId == dish.Id).Select(c => c.Quantity).Sum())
            .IsEqualTo(quantity);
    }

    [Then("menu dish {int} is not part of the consolidated pre-order")]
    public async Task ThenNotConsolidated(int dishNumber)
    {
        var dish = Recall<DishListResponse[]>(SetUpAGroupReservation.DishesKey)[dishNumber - 1];
        var consolidated = await Actor.AsksForAsync(new TheConsolidatedPreOrder());
        await Assert.That(consolidated.Select(c => c.DishId)).DoesNotContain(dish.Id);
    }

    [Then("the group pre-order is marked as sent to the restaurant")]
    public async Task ThenMarkedAsSent() =>
        await Assert.That((await Actor.AsksForAsync(new TheGroupStatus())).Status).IsEqualTo("Submitted");

    [Then("the reservation's pre-order is submitted to the restaurant with the consolidated composition")]
    public async Task ThenOrderMatchesConsolidation()
    {
        var order = await OwnerOrder();
        await Assert.That(order.Status).IsEqualTo(OrderStatus.SubmittedByCustomer);
        var consolidated = await Actor.AsksForAsync(new TheConsolidatedPreOrder());
        await Assert.That(order.OrderItems.Select(i => (i.Dish.Id, i.Quantity)).OrderBy(x => x.Id))
            .IsEquivalentTo(consolidated.Select(c => (c.DishId, c.Quantity)).OrderBy(x => x.DishId));
    }

    [Then("the waiter sees {int} portions of menu dish {int}")]
    [Then("the waiter sees the reservation's pre-order with {int} portions of menu dish {int}")]
    public async Task ThenWaiterSees(int quantity, int dishNumber)
    {
        var dish = Recall<DishListResponse[]>(SetUpAGroupReservation.DishesKey)[dishNumber - 1];
        var waiter = await Actor.AsksForAsync(new TheWaiterSession());
        var order = await Actor.AsksForAsync(new TheOrderForTheGroup(waiter.IdToken));
        await Assert.That(order.OrderItems.Where(i => i.Dish.Id == dish.Id).Select(i => i.Quantity).Sum())
            .IsEqualTo(quantity);
    }

    [Then("menu dish {int} is not part of the reservation's pre-order")]
    public async Task ThenNotInOrder(int dishNumber)
    {
        var dish = Recall<DishListResponse[]>(SetUpAGroupReservation.DishesKey)[dishNumber - 1];
        var order = await OwnerOrder();
        await Assert.That(order.OrderItems.Select(i => i.Dish.Id)).DoesNotContain(dish.Id);
    }

    [Then("the submission succeeds with the same consolidated composition")]
    public async Task ThenSubmissionReSucceeded()
    {
        var outcome = await Actor.AsksForAsync(new TheOutcome());
        await Assert.That(outcome.Succeeded).IsTrue().Because($"body: {outcome.Body}");
        await ThenOrderMatchesConsolidation();
    }

    // ---- refusals ----

    [Then("the submission is refused with {string}")]
    public async Task ThenSubmissionRefused(string message) => await RefusedWith(message);

    [Then("the removal is refused with {string}")]
    public async Task ThenRemovalRefused(string message) => await RefusedWith(message);

    [Then("the request is refused as unauthorized")]
    public async Task ThenUnauthorized() =>
        await Assert.That((await Actor.AsksForAsync(new TheOutcome())).Status).IsEqualTo(401);

    [Then("the request is refused as forbidden")]
    public async Task ThenForbidden() =>
        await Assert.That((await Actor.AsksForAsync(new TheOutcome())).Status).IsEqualTo(403);

    [Then("the request is refused as not found")]
    public async Task ThenNotFound() =>
        await Assert.That((await Actor.AsksForAsync(new TheOutcome())).Status).IsEqualTo(404);

    // ---- helpers ----

    private bool IsRemembered<T>(string key) where T : notnull
    {
        try
        {
            Actor.Recall<T>(key);
            return true;
        }
        catch (Exception)
        {
            return false;
        }
    }

    private async Task<GroupParticipantDto> ParticipantCalled(string name)
    {
        var view = await Actor.AsksForAsync(new TheGroupParticipants());
        return view.Participants.Single(p => p.Name == name);
    }

    private async Task<GetOrderResponse> OwnerOrder()
    {
        var ownerToken = Recall<string>(SetUpAGroupReservation.OwnerTokenKey);
        return await Actor.AsksForAsync(new TheOrderForTheGroup(ownerToken));
    }

    private async Task RefusedWith(string message)
    {
        var outcome = await Actor.AsksForAsync(new TheOutcome());
        await Assert.That(outcome.Status).IsNotEqualTo(200);
        await Assert.That(outcome.ErrorMessage.ToLowerInvariant()).Contains(message.ToLowerInvariant());
    }
}
