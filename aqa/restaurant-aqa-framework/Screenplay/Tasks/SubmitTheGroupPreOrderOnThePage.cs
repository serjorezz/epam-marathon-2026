using Microsoft.Playwright;
using Restaurant_Aqa_Framework.Ui;

namespace Restaurant_Aqa_Framework.Screenplay.Tasks;

/// <summary>The owner confirms the consolidated pre-order in the browser: the submit button opens a
/// confirmation modal whose "Submit" button completes the action.</summary>
public sealed class SubmitTheGroupPreOrderOnThePage : ITask
{
    public async Task PerformAsAsync(Actor actor)
    {
        var page = new GroupOrderPage(actor.LookingAtThePage());
        await page.WaitForReadyAsync();
        await page.SubmitButton.WaitForAsync(new() { State = WaitForSelectorState.Visible, Timeout = 30_000 });
        await page.SubmitButton.ClickAsync();
        await page.ModalSubmitButton.ClickAsync();
    }
}
