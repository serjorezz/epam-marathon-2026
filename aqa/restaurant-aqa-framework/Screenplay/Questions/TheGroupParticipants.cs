using Restaurant_Aqa_Framework.Api;
using Restaurant_Aqa_Framework.Api.Dtos.GroupReservations;
using Restaurant_Aqa_Framework.Screenplay.Tasks;

namespace Restaurant_Aqa_Framework.Screenplay.Questions;

/// <summary>The owner-only participant list of the remembered group: every participant with their
/// dishes, quantities and per-participant totals, plus the grand total. Performs a fresh read.</summary>
public sealed class TheGroupParticipants : IQuestion<GroupSessionsResponse>
{
    public async Task<GroupSessionsResponse> AnsweredByAsync(Actor actor)
    {
        var response = await new GroupReservationsApi(actor.UsingTheApi()).GetSessionsAsync(
            actor.Recall<string>(SetUpAGroupReservation.GroupIdKey),
            actor.Recall<string>(SetUpAGroupReservation.OwnerTokenKey));
        return await response.ReadAsAsync<GroupSessionsResponse>();
    }
}
