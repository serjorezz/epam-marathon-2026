using Restaurant_Aqa_Framework.Api;
using Restaurant_Aqa_Framework.Api.Dtos.GuestSessions;

namespace Restaurant_Aqa_Framework.Screenplay.Tasks;

/// <summary>The owner (or, for negative scenarios, another customer) removes a guest's session from
/// the group. The response — the updated participant list — becomes the scenario's last response.
/// <paramref name="nonExistent"/> targets a made-up session id for the 404 scenario.</summary>
public sealed class RemoveTheGroupParticipant(
    string guestName, string? onBehalfOf = null, bool nonExistent = false) : ITask
{
    public async Task PerformAsAsync(Actor actor)
    {
        var guestSessionId = nonExistent
            ? "no-such-guest-session"
            : actor.Recall<CreateGuestSessionResponse>(JoinTheGroupAsGuest.KeyFor(guestName)).SessionId;
        var token = onBehalfOf is null
            ? actor.Recall<string>(SetUpAGroupReservation.OwnerTokenKey)
            : actor.Recall<string>(RegisterAnotherCustomer.TokenKeyFor(onBehalfOf));
        var response = await new GroupReservationsApi(actor.UsingTheApi()).DeleteSessionAsync(
            actor.Recall<string>(SetUpAGroupReservation.GroupIdKey), guestSessionId, token);
        await actor.TheLastResponse().CaptureAsync(response);
    }
}
