using Restaurant_Aqa_Framework.Api.Dtos.Locations;
using Restaurant_Aqa_Framework.Api.Dtos.Reservations;
using Restaurant_Aqa_Framework.Api.Dtos.Tables;
using Restaurant_Aqa_Framework.Screenplay;
using Restaurant_Aqa_Framework.Screenplay.Questions;
using Restaurant_Aqa_Framework.Screenplay.Tasks;

namespace Restaurant_Aqa_Framework.StepDefinitions;

[Binding]
public sealed class ReservationStepDefinitions(Actor actor) : StepDefinitionBase(actor)
{
    private const string OtherCustomerLabel = "otherCustomer";

    [Given("a customer who is signed in")]
    public Task GivenACustomerWhoIsSignedIn() =>
        Actor.AttemptsToAsync(new SetUpCustomer());

    [Given("another customer who is signed in")]
    public Task GivenAnotherCustomerWhoIsSignedIn() =>
        Actor.AttemptsToAsync(new SetUpCustomer(label: OtherCustomerLabel));

    [Given("a table that seats {int} guests")]
    public Task GivenATableThatSeatsGuests(int seats) =>
        Actor.AttemptsToAsync(new AddTable(seats: seats));

    [Given("the customer has booked the table for tomorrow evening")]
    public Task GivenCustomerHasBookedForTomorrowEvening()
    {
        var tomorrowEvening = DateTime.UtcNow.Date.AddDays(1).AddHours(19);
        return Actor.AttemptsToAsync(new BookTable(
            startTime: tomorrowEvening,
            endTime: tomorrowEvening.AddHours(2),
            guestCount: 2));
    }

    [When("the customer books the table for {int} guests")]
    public Task WhenCustomerBooksForGuests(int guests)
    {
        var startTime = DateTime.UtcNow.AddHours(2);
        return Actor.AttemptsToAsync(new BookTable(
            startTime: startTime,
            endTime: startTime.AddHours(2),
            guestCount: guests));
    }

    [When("the customer books the table to start in {int} minutes")]
    public Task WhenCustomerBooksToStartInMinutes(int minutes)
    {
        var startTime = DateTime.UtcNow.AddMinutes(minutes);
        return Actor.AttemptsToAsync(new BookTable(
            startTime: startTime,
            endTime: startTime.AddHours(1),
            guestCount: 2));
    }

    [When("the customer books the table with end time before start time")]
    public Task WhenCustomerBooksWithEndTimeBeforeStartTime()
    {
        var startTime = DateTime.UtcNow.AddHours(2);
        return Actor.AttemptsToAsync(new BookTable(
            startTime: startTime,
            endTime: startTime.AddMinutes(-30),
            guestCount: 2));
    }

    [When("another customer books the same table for the same time")]
    public async Task WhenAnotherCustomerBooksSameTableSameTime()
    {
        await Actor.AttemptsToAsync(new SetUpCustomer(label: OtherCustomerLabel));
        var otherSession = Recall<CustomerSession>(OtherCustomerLabel);
        var existing = Recall<ReservationResponse>();

        await Actor.AttemptsToAsync(new BookTable(
            startTime: existing.StartTime,
            endTime: existing.EndTime,
            guestCount: existing.GuestCount,
            tableId: existing.TableId,
            customerToken: otherSession.Token));
    }

    [When("another customer books the same table for an adjacent time")]
    public async Task WhenAnotherCustomerBooksSameTableAdjacentTime()
    {
        await Actor.AttemptsToAsync(new SetUpCustomer(label: OtherCustomerLabel));
        var otherSession = Recall<CustomerSession>(OtherCustomerLabel);
        var existing = Recall<ReservationResponse>();

        // Overlap buffer is 15 minutes, so adjacent starts at EndTime + 16 minutes
        var adjacentStart = existing.EndTime.AddMinutes(16);
        await Actor.AttemptsToAsync(new BookTable(
            startTime: adjacentStart,
            endTime: adjacentStart.AddHours(1),
            guestCount: existing.GuestCount,
            tableId: existing.TableId,
            customerToken: otherSession.Token));
    }

    [When("the customer edits the booking to {int} guests")]
    public Task WhenCustomerEditsBookingToGuests(int guests)
    {
        var existing = Recall<ReservationResponse>();
        return Actor.AttemptsToAsync(new EditReservation(
            startTime: existing.StartTime,
            endTime: existing.EndTime,
            guestCount: guests));
    }

    [When("the customer edits the booking to start in {int} minutes")]
    public Task WhenCustomerEditsBookingToStartInMinutes(int minutes)
    {
        var existing = Recall<ReservationResponse>();
        var newStart = DateTime.UtcNow.AddMinutes(minutes);
        return Actor.AttemptsToAsync(new EditReservation(
            startTime: newStart,
            endTime: newStart.AddHours(1),
            guestCount: existing.GuestCount));
    }

    [When("another customer tries to edit the booking")]
    public async Task WhenAnotherCustomerTriesToEditBooking()
    {
        await Actor.AttemptsToAsync(new SetUpCustomer(label: OtherCustomerLabel));
        var otherSession = Recall<CustomerSession>(OtherCustomerLabel);
        var existing = Recall<ReservationResponse>();

        await Actor.AttemptsToAsync(new EditReservation(
            startTime: existing.StartTime.AddHours(1),
            endTime: existing.EndTime.AddHours(1),
            guestCount: existing.GuestCount,
            reservationId: existing.Id,
            customerToken: otherSession.Token));
    }

    [When("an unauthenticated customer tries to book the table")]
    public Task WhenUnauthenticatedCustomerTriesToBook()
    {
        var startTime = DateTime.UtcNow.AddHours(2);
        return Actor.AttemptsToAsync(new BookTable(
            startTime: startTime,
            endTime: startTime.AddHours(1),
            guestCount: 2,
            isAnonymous: true));
    }

    [When("an unauthenticated customer tries to edit the booking")]
    public Task WhenUnauthenticatedCustomerTriesToEdit()
    {
        var existing = Recall<ReservationResponse>();
        return Actor.AttemptsToAsync(new EditReservation(
            startTime: existing.StartTime.AddHours(1),
            endTime: existing.EndTime.AddHours(1),
            guestCount: existing.GuestCount,
            isAnonymous: true));
    }

    [When("the customer cancels the booking")]
    public Task WhenCustomerCancelsBooking() =>
        Actor.AttemptsToAsync(new CancelReservation());

    [When("the customer cancels the booking again")]
    public Task WhenCustomerCancelsBookingAgain() =>
        Actor.AttemptsToAsync(new CancelReservation());

    [When("another customer tries to cancel the booking")]
    public async Task WhenAnotherCustomerTriesToCancelBooking()
    {
        await Actor.AttemptsToAsync(new SetUpCustomer(label: OtherCustomerLabel));
        var otherSession = Recall<CustomerSession>(OtherCustomerLabel);
        var existing = Recall<ReservationResponse>();

        await Actor.AttemptsToAsync(new CancelReservation(
            reservationId: existing.Id,
            customerToken: otherSession.Token));
    }

    [Then("the customer is told the table is too small")]
    public async Task ThenCustomerIsToldTableIsTooSmall()
    {
        var outcome = await Actor.AsksForAsync(new TheOutcome());
        await Assert.That(outcome.Status).IsEqualTo(400);
        await Assert.That(outcome.ErrorMessage).Contains("exceeds table capacity");
    }

    [Then("the booking is refused")]
    [Then("the second booking is refused")]
    public async Task ThenBookingIsRefused()
    {
        var outcome = await Actor.AsksForAsync(new TheOutcome());
        await Assert.That(outcome.Succeeded).IsFalse().Because($"expected refusal, but got {outcome.Status}: {outcome.Body}");
    }

    [Then("the booking is accepted")]
    [Then("the second booking is accepted")]
    public async Task ThenBookingIsAccepted()
    {
        var outcome = await Actor.AsksForAsync(new TheOutcome());
        await Assert.That(outcome.Succeeded).IsTrue().Because($"expected success, but got {outcome.Status}: {outcome.Body}");
    }

    [Then("the action is refused as unauthorized")]
    public async Task ThenActionIsRefusedAsUnauthorized()
    {
        var outcome = await Actor.AsksForAsync(new TheOutcome());
        await Assert.That(outcome.Status).IsEqualTo(401).Because($"expected 401 Unauthorized, got {outcome.Status}: {outcome.Body}");
    }

    [Then("the action is refused as forbidden")]
    public async Task ThenActionIsRefusedAsForbidden()
    {
        var outcome = await Actor.AsksForAsync(new TheOutcome());
        await Assert.That(outcome.Status).IsEqualTo(403).Because($"expected 403 Forbidden, got {outcome.Status}: {outcome.Body}");
    }

    [Then("the booking appears in my reservations with status {string}")]
    public async Task ThenBookingAppearsInMyReservations(string status)
    {
        var reservations = await Actor.AsksForAsync(new TheCustomerReservations());
        var lastReservation = Recall<ReservationResponse>(BookTable.LastReservationMemory);

        var match = reservations.FirstOrDefault(r => r.Id == lastReservation.Id);
        await Assert.That(match).IsNotNull().Because("created reservation was not found in customer's reservations");
        await Assert.That(match!.Status.ToString()).IsEqualTo(status);
        await Assert.That(match.TableId).IsEqualTo(lastReservation.TableId);
        await Assert.That(match.GuestCount).IsEqualTo(lastReservation.GuestCount);
    }

    [Then("the table is not available for that time")]
    public async Task ThenTableIsNotAvailableForThatTime()
    {
        var location = Recall<LocationResponse>();
        var table = Recall<TableResponse>();
        var reservation = Recall<ReservationResponse>();

        var availableTables = await Actor.AsksForAsync(new TheAvailableTables(
            location.Id,
            reservation.GuestCount,
            reservation.StartTime));

        await Assert.That(availableTables.Select(t => t.Id)).DoesNotContain(table.Id);
    }

    [Then("the booking is cancelled")]
    public async Task ThenBookingIsCancelled()
    {
        var outcome = await Actor.AsksForAsync(new TheOutcome());
        await Assert.That(outcome.Succeeded).IsTrue().Because($"expected cancellation success, but got: {outcome.Body}");
    }

    [Then("the customer sees only their own bookings")]
    public async Task ThenCustomerSeesOnlyOwnBookings()
    {
        var reservations = await Actor.AsksForAsync(new TheCustomerReservations());
        var otherReservation = Actor.TryRecall<ReservationResponse>(out var r) ? r : null;
        if (otherReservation is not null && reservations.Any(res => res.Id == otherReservation.Id))
        {
            await Assert.That(reservations.All(res => res.CustomerId != null)).IsTrue();
        }
    }
}
