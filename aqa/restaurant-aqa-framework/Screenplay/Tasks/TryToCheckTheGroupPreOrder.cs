using Restaurant_Aqa_Framework.Api;
using Restaurant_Aqa_Framework.Api.Dtos.GuestSessions;
using Restaurant_Aqa_Framework.Screenplay.Questions;

namespace Restaurant_Aqa_Framework.Screenplay.Tasks;

public enum GroupPreOrderViewer
{
    AnotherCustomer,
    Guest,
    Waiter,
    Anonymous,
}

/// <summary>Reads the owner-only participant list with the wrong credentials (or none) and captures
/// the outcome as the scenario's last response — the refusal scenarios of Level 1.</summary>
public sealed class TryToCheckTheGroupPreOrder(GroupPreOrderViewer viewer, string? name = null) : ITask
{
    public async Task PerformAsAsync(Actor actor)
    {
        string? token = viewer switch
        {
            GroupPreOrderViewer.AnotherCustomer => actor.Recall<string>(RegisterAnotherCustomer.TokenKeyFor(name!)),
            GroupPreOrderViewer.Guest => actor.Recall<CreateGuestSessionResponse>(JoinTheGroupAsGuest.KeyFor(name!)).SessionToken,
            GroupPreOrderViewer.Waiter => (await actor.AsksForAsync(new TheWaiterSession())).IdToken,
            _ => null,
        };
        var response = await new GroupReservationsApi(actor.UsingTheApi()).GetSessionsAsync(
            actor.Recall<string>(SetUpAGroupReservation.GroupIdKey), token);
        await actor.TheLastResponse().CaptureAsync(response);
    }
}
