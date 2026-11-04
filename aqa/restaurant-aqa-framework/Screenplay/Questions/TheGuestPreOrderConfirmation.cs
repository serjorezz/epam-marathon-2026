using Microsoft.Playwright;
using Restaurant_Aqa_Framework.Ui;

namespace Restaurant_Aqa_Framework.Screenplay.Questions;

/// <summary>Whether the guest flow reached the "Pre-Order Submitted!" confirmation screen.</summary>
public sealed class TheGuestPreOrderConfirmation : IQuestion<bool>
{
    public async Task<bool> AnsweredByAsync(Actor actor)
    {
        var heading = new GuestPreOrderPage(actor.LookingAtThePage()).SubmittedHeading;
        try
        {
            await heading.WaitForAsync(new() { State = WaitForSelectorState.Visible, Timeout = 5000 });
            return true;
        }
        catch (TimeoutException)
        {
            return false;
        }
    }
}
