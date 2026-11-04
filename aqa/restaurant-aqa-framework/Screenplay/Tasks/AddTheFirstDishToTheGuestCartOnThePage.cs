using Restaurant_Aqa_Framework.Ui;

namespace Restaurant_Aqa_Framework.Screenplay.Tasks;

/// <summary>The guest adds one portion of the first menu dish to their cart via the dish card's
/// "Pre-Order" button.</summary>
public sealed class AddTheFirstDishToTheGuestCartOnThePage : ITask
{
    public async Task PerformAsAsync(Actor actor) =>
        await new GuestPreOrderPage(actor.LookingAtThePage()).PreOrderButtonOnCard(0).ClickAsync();
}
