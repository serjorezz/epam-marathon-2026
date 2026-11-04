using Restaurant_Aqa_Framework.Api;
using Restaurant_Aqa_Framework.Api.Dtos.Auth;
using Restaurant_Aqa_Framework.Api.Seeding;
using Restaurant_Aqa_Framework.Contexts;

namespace Restaurant_Aqa_Framework.Screenplay.Tasks;

public sealed record CustomerSession(string Email, string Token);

/// <summary>
/// Sets up a brand new customer by registering them and signing them in via the auth API.
/// Remembers the customer's credentials and auth tokens so subsequent steps can act as this customer.
/// </summary>
public sealed class SetUpCustomer(string? label = null) : ITask
{
    public async Task PerformAsAsync(Actor actor)
    {
        var request = SampleDataFactory.RegisterRequest();
        var api = new AuthApi(actor.UsingTheApi());

        var registerResponse = await api.RegisterAsync(request);
        if (registerResponse.Status >= 400)
            throw new InvalidOperationException($"Registering customer failed with {registerResponse.Status}: {await registerResponse.TextAsync()}");

        var signInResponse = await api.SignInAsync(new SignInRequest(request.Email, request.Password));
        if (signInResponse.Status >= 400)
            throw new InvalidOperationException($"Signing in customer failed with {signInResponse.Status}: {await signInResponse.TextAsync()}");

        var tokens = await signInResponse.ReadAsAsync<SignInResponse>();
        var session = new CustomerSession(request.Email, tokens.IdToken);

        if (label is null)
            actor.Remember(session);
        else
            actor.Remember(label, session);

        actor.Remember(request);

        actor.Recall<CleanupScope>().TrackDelete(
            $"user:{request.Email}",
            async () =>
            {
                return await api.SignInAsync(new SignInRequest(request.Email, request.Password));
            });
    }
}
