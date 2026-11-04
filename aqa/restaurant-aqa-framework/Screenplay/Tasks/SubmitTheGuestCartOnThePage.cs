using Microsoft.Playwright;
using Restaurant_Aqa_Framework.Ui;

namespace Restaurant_Aqa_Framework.Screenplay.Tasks;

/// <summary>The guest opens the cart drawer and confirms their pre-order with the drawer's submit
/// button, then waits for the confirmation screen.</summary>
public sealed class SubmitTheGuestCartOnThePage : ITask
{
    public async Task PerformAsAsync(Actor actor)
    {
        var page = new GuestPreOrderPage(actor.LookingAtThePage());
        await page.CartOpenButton.ClickAsync();
        await page.SubmitCartButton.ClickAsync();
        await page.SubmittedHeading.WaitForAsync(new() { State = WaitForSelectorState.Visible });
    }
}
