using Restaurant_Aqa_Framework.Api;
using Restaurant_Aqa_Framework.Api.Dtos.Auth;
using Restaurant_Aqa_Framework.Api.Seeding;

namespace Restaurant_Aqa_Framework.Screenplay.Tasks;

/// <summary>Registers a second, independent customer (Mallory-style personas for negative scenarios).
/// Remembers the RegisterRequest under "other:{name}" and their id token under "otherToken:{name}".</summary>
public sealed class RegisterAnotherCustomer(string name) : ITask
{
    public static string KeyFor(string name) => $"other:{name}";
    public static string TokenKeyFor(string name) => $"otherToken:{name}";

    public async Task PerformAsAsync(Actor actor)
    {
        var api = new AuthApi(actor.UsingTheApi());
        var person = SampleDataFactory.RegisterRequest();
        actor.Remember(KeyFor(name), person);
        await actor.TheLastResponse().CaptureAsync(await api.RegisterAsync(person));
        var signIn = await api.SignInAsync(new SignInRequest(person.Email, person.Password));
        if (!signIn.Ok)
            throw new InvalidOperationException(
                $"Second customer sign-in failed with {signIn.Status}: {await signIn.ReadErrorMessageAsync()}");
        actor.Remember(TokenKeyFor(name), (await signIn.ReadAsAsync<SignInResponse>()).IdToken);
    }
}
