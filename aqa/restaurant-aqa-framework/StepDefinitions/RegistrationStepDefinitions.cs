using Restaurant_Aqa_Framework.Api.Dtos.Auth;
using Restaurant_Aqa_Framework.Api.Seeding;
using Restaurant_Aqa_Framework.Screenplay;
using Restaurant_Aqa_Framework.Screenplay.Questions;
using Restaurant_Aqa_Framework.Screenplay.Tasks;
using Restaurant_Aqa_Framework.Support;

namespace Restaurant_Aqa_Framework.StepDefinitions;

/// <summary>Visitor sign-up, through the service ("registers ...") and through the storefront form
/// ("signs up ..."). Every visitor gets a fresh email address and a valid password unless a step says
/// one of the details is invalid — feature files never spell out data the rule does not care about.
/// The visitor's details are remembered by the tasks, so a later step can sign in with them.</summary>
[Binding]
public sealed class RegistrationStepDefinitions(Actor actor) : StepDefinitionBase(actor)
{
    // ---- through the service ----

    [When("a visitor registers as {word} {word} with a new email address and a valid password")]
    public Task WhenVisitorRegisters(string firstName, string lastName)
    {
        var password = SampleDataFactory.ValidPassword();
        return Actor.AttemptsToAsync(
            new RegisterThroughTheService(new RegisterRequest(firstName, lastName, SampleDataFactory.UniqueEmail(), password, password)));
    }

    [When("a visitor tries to register with an invalid {field} \\({problem}\\)")]
    public Task WhenVisitorTriesToRegisterWithInvalid(InputField field, InputProblem problem) =>
        Actor.AttemptsToAsync(new RegisterThroughTheService(WithInvalid(SampleDataFactory.RegisterRequest(), field, problem)));

    [Then("the visitor is registered")]
    public async Task ThenVisitorIsRegistered()
    {
        var outcome = await Actor.AsksForAsync(new TheOutcome());
        await Assert.That(outcome.Succeeded).IsTrue().Because($"response body was: {outcome.Body}");
    }

    [Then("the visitor can sign in with those details")]
    public async Task ThenVisitorCanSignIn()
    {
        var visitor = Recall<RegisterRequest>();
        await Actor.AttemptsToAsync(new SignInThroughTheService(visitor.Email, visitor.Password));

        var outcome = await Actor.AsksForAsync(new TheOutcome());
        await Assert.That(outcome.Succeeded).IsTrue().Because($"response body was: {outcome.Body}");
        await Assert.That(await Actor.AsksForAsync(new TheIdToken())).IsNotNullOrEmpty();
    }

    /// <summary>Registers a visitor whose named detail is a valid value of exactly the given length — the
    /// boundary counterpart of "tries to register with an invalid ...". Lengths live in <see cref="BoundaryInputs"/>.</summary>
    [When("a visitor registers with a {field} of {int} characters")]
    public Task WhenVisitorRegistersWithBoundaryValue(InputField field, int length)
    {
        var visitor = SampleDataFactory.RegisterRequest();
        var boundary = field switch
        {
            InputField.FirstName or InputField.LastName => BoundaryInputs.NameOfLength(length),
            InputField.EmailAddress => BoundaryInputs.EmailOfLength(length),
            InputField.Password or InputField.PasswordConfirmation => BoundaryInputs.PasswordOfLength(length),
            _ => throw new ArgumentOutOfRangeException(nameof(field), field, null),
        };
        var request = field switch
        {
            InputField.FirstName => visitor with { FirstName = boundary },
            InputField.LastName => visitor with { LastName = boundary },
            InputField.EmailAddress => visitor with { Email = boundary },
            InputField.Password => visitor with { Password = boundary, ConfirmPassword = boundary },
            _ => visitor with { ConfirmPassword = boundary },
        };

        return Actor.AttemptsToAsync(new RegisterThroughTheService(request));
    }

    /// <summary>The backend's own validation allows this length, so the failure (if any) comes from the account
    /// store downstream — scenarios assert the business outcome (no account) rather than a message.</summary>
    [When("a visitor tries to register with an email address of {int} characters")]
    public Task WhenVisitorTriesBoundaryEmail(int length) =>
        Actor.AttemptsToAsync(new RegisterThroughTheService(
            SampleDataFactory.RegisterRequest() with { Email = BoundaryInputs.EmailOfLength(length) }));

    [Then("the visitor is not registered")]
    public async Task ThenVisitorIsNotRegistered()
    {
        var outcome = await Actor.AsksForAsync(new TheOutcome());
        await Assert.That(outcome.Succeeded).IsFalse().Because($"the visitor was unexpectedly registered: {outcome.Body}");
    }

    [Then("the visitor is signed in as a customer")]
    public async Task ThenVisitorIsSignedInAsCustomer()
    {
        var roles = await Actor.AsksForAsync(new TheRoleClaims());
        await Assert.That(roles).Contains("Customer");
    }

    // ---- through the storefront ----

    [Given("a visitor is on the sign-up page")]
    public Task GivenVisitorIsOnSignUpPage() => Actor.AttemptsToAsync(new OpenTheSignUpPage());

    [When("the visitor fills in the sign-up form with valid details")]
    public Task WhenVisitorFillsInSignUpForm() =>
        Actor.AttemptsToAsync(new FillInTheSignUpForm(SampleDataFactory.RegisterRequest()));

    [When("the visitor enters an invalid {field} \\({problem}\\)")]
    public Task WhenVisitorEntersInvalid(InputField field, InputProblem problem) =>
        Actor.AttemptsToAsync(new EnterIntoTheSignUpForm(field, InvalidInputs.Value(field, problem)));

    /// <summary>Replaces the email with a syntactically valid address of exactly the given length.</summary>
    [When("the visitor enters an email address that is {int} characters long")]
    public Task WhenVisitorEntersBoundaryEmail(int length) =>
        Actor.AttemptsToAsync(new EnterIntoTheSignUpForm(InputField.EmailAddress, BoundaryInputs.EmailOfLength(length)));

    /// <summary>On the sign-up form the explanation appears right under the field that is wrong.</summary>
    [Then("the visitor is told {string}")]
    [Scope(Tag = "ui")]
    public async Task ThenVisitorIsToldOnTheForm(string message) =>
        await Assert.That(await Actor.AsksForAsync(new TheSignUpFormMessages())).Contains(message);

    [Then("the visitor can submit the form")]
    public async Task ThenVisitorCanSubmit() =>
        await Assert.That(await Actor.AsksForAsync(new TheSignUpFormCanBeSubmitted())).IsTrue();

    [Then("the visitor cannot submit the form")]
    public async Task ThenVisitorCannotSubmit() =>
        await Assert.That(await Actor.AsksForAsync(new TheSignUpFormCanBeSubmitted())).IsFalse();

    [When("a visitor signs up with valid details")]
    public Task WhenVisitorSignsUp() => Actor.AttemptsToAsync(new SignUp(SampleDataFactory.RegisterRequest()));

    [When("the visitor signs in with those details")]
    public Task WhenVisitorSignsInWithThoseDetails()
    {
        var visitor = Recall<RegisterRequest>();
        return Actor.AttemptsToAsync(new SignInThroughTheLoginForm(visitor.Email, visitor.Password, openTheLoginPage: false));
    }

    [Then("the customer is signed in")]
    public async Task ThenCustomerIsSignedIn() =>
        await Assert.That(await Actor.AsksForAsync(new TheSignedInUser())).IsNotNullOrEmpty();

    private static RegisterRequest WithInvalid(RegisterRequest valid, InputField field, InputProblem problem)
    {
        var bad = InvalidInputs.Value(field, problem);
        return field switch
        {
            InputField.FirstName => valid with { FirstName = bad },
            InputField.LastName => valid with { LastName = bad },
            InputField.EmailAddress => valid with { Email = bad },
            InputField.Password => valid with { Password = bad, ConfirmPassword = bad },
            InputField.PasswordConfirmation => valid with { ConfirmPassword = bad },
            _ => throw new ArgumentOutOfRangeException(nameof(field), field, null),
        };
    }
}
