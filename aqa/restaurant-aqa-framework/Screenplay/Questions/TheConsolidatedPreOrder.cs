using Restaurant_Aqa_Framework.Api.Dtos.GroupReservations;
using Restaurant_Aqa_Framework.Screenplay.Tasks;

namespace Restaurant_Aqa_Framework.Screenplay.Questions;

/// <summary>The composition the owner's last group submit consolidated (dish ids and summed
/// quantities), as remembered by SubmitTheGroupPreOrder.</summary>
public sealed class TheConsolidatedPreOrder : IQuestion<SubmittedDishDto[]>
{
    public Task<SubmittedDishDto[]> AnsweredByAsync(Actor actor) =>
        Task.FromResult(actor.Recall<SubmittedDishDto[]>(SubmitTheGroupPreOrder.ConsolidatedKey));
}
