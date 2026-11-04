using Restaurant_Aqa_Framework.Api;
using Restaurant_Aqa_Framework.Api.Dtos.GroupReservations;
using Restaurant_Aqa_Framework.Screenplay.Tasks;

namespace Restaurant_Aqa_Framework.Screenplay.Questions;

/// <summary>The remembered group's status snapshot (Open/Submitted), fresh from the API.</summary>
public sealed class TheGroupStatus : IQuestion<GroupStatusResponse>
{
    public async Task<GroupStatusResponse> AnsweredByAsync(Actor actor)
    {
        var response = await new GroupReservationsApi(actor.UsingTheApi()).GetStatusAsync(
            actor.Recall<string>(SetUpAGroupReservation.GroupIdKey),
            actor.Recall<string>(SetUpAGroupReservation.OwnerTokenKey));
        return await response.ReadAsAsync<GroupStatusResponse>();
    }
}
