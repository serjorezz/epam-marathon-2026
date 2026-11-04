using Restaurant_Aqa_Framework.Api;
using Restaurant_Aqa_Framework.Api.Dtos.GuestSessions;

namespace Restaurant_Aqa_Framework.Screenplay.Tasks;

/// <summary>The named guest confirms their cart ("submits" it), making it eligible for consolidation.</summary>
public sealed class SubmitTheGuestCart(string guestName) : ITask
{
    public async Task PerformAsAsync(Actor actor)
    {
        var guest = actor.Recall<CreateGuestSessionResponse>(JoinTheGroupAsGuest.KeyFor(guestName));
        var response = await new GuestSessionsApi(actor.UsingTheApi()).SubmitCartAsync(guest.SessionId, guest.SessionToken);
        await actor.TheLastResponse().CaptureAsync(response);
    }
}
