using System.Text;
using System.Text.Json;

namespace Restaurant_Aqa_Framework.Screenplay.Questions;

/// <summary>The roles recorded in the id token the last sign-in handed out — the account's Cognito
/// groups. Registration adds every new account to the Customer group and to no other, so this is
/// how a scenario proves who the newly registered user became.</summary>
public sealed class TheRoleClaims : IQuestion<IReadOnlyList<string>>
{
    public async Task<IReadOnlyList<string>> AnsweredByAsync(Actor actor)
    {
        var token = await actor.AsksForAsync(new TheIdToken())
            ?? throw new InvalidOperationException(
                "The last sign-in did not succeed, so there is no id token to read roles from.");

        using var payload = JsonDocument.Parse(Base64UrlDecode(token.Split('.')[1]));
        return payload.RootElement.TryGetProperty("cognito:groups", out var groups)
            ? groups.EnumerateArray().Select(group => group.GetString() ?? string.Empty).ToList()
            : [];
    }

    private static string Base64UrlDecode(string segment)
    {
        var base64 = segment.Replace('-', '+').Replace('_', '/');
        base64 = base64.PadRight(base64.Length + (4 - base64.Length % 4) % 4, '=');
        return Encoding.UTF8.GetString(Convert.FromBase64String(base64));
    }
}
