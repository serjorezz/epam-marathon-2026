using Restaurant_Aqa_Framework.Api;
using Restaurant_Aqa_Framework.Api.Dtos.GuestSessions;

namespace Restaurant_Aqa_Framework.Screenplay.Tasks;

/// <summary>A guest joins a group via the invite flow (POST /guest/sessions, no auth). By default
/// that's the scenario's main group; <paramref name="groupIdKey"/> can point at a second group
/// (SetUpASecondGroupReservation.SecondGroupIdKey) for cross-group scenarios. Remembers the
/// CreateGuestSessionResponse under "guest:{name}".</summary>
public sealed class JoinTheGroupAsGuest(string guestName, string? groupIdKey = null) : ITask
{
    public static string KeyFor(string guestName) => $"guest:{guestName}";

    public async Task PerformAsAsync(Actor actor)
    {
        var response = await new GuestSessionsApi(actor.UsingTheApi()).CreateAsync(
            new CreateGuestSessionRequest(
                actor.Recall<string>(groupIdKey ?? SetUpAGroupReservation.GroupIdKey), guestName));
        await actor.TheLastResponse().CaptureAsync(response);
        if (!response.Ok)
            throw new InvalidOperationException(
                $"Guest '{guestName}' could not join the group ({response.Status}): {await response.ReadErrorMessageAsync()}");
        actor.Remember(KeyFor(guestName), await response.ReadAsAsync<CreateGuestSessionResponse>());
    }
}
