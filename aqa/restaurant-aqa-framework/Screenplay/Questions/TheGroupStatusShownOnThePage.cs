using Microsoft.Playwright;
using Restaurant_Aqa_Framework.Ui;

namespace Restaurant_Aqa_Framework.Screenplay.Questions;

/// <summary>The status badge text on the owner's group pre-order page ("Collecting pre-orders" /
/// "Sent to Restaurant"), or null if no badge rendered.</summary>
public sealed class TheGroupStatusShownOnThePage : IQuestion<string?>
{
    public async Task<string?> AnsweredByAsync(Actor actor)
    {
        var page = new GroupOrderPage(actor.LookingAtThePage());
        await page.WaitForReadyAsync();
        var badge = page.StatusBadge;
        try
        {
            await badge.WaitForAsync(new() { State = WaitForSelectorState.Visible, Timeout = 5000 });
            return (await badge.TextContentAsync())?.Trim();
        }
        catch (TimeoutException)
        {
            return null;
        }
    }
}
