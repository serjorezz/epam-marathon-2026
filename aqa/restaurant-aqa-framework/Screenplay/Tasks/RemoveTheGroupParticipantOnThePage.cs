using Microsoft.Playwright;
using Restaurant_Aqa_Framework.Ui;

namespace Restaurant_Aqa_Framework.Screenplay.Tasks;

/// <summary>The owner removes a participant from the group pre-order page: the card's remove button
/// (aria-label "Remove {name}") opens a modal confirmed by "Remove Guest".</summary>
public sealed class RemoveTheGroupParticipantOnThePage(string guestName) : ITask
{
    public async Task PerformAsAsync(Actor actor)
    {
        var page = new GroupOrderPage(actor.LookingAtThePage());
        await page.WaitForReadyAsync();
        var removeButton = page.ParticipantByName(guestName).RemoveButton(guestName);
        await removeButton.WaitForAsync(new() { State = WaitForSelectorState.Visible, Timeout = 30_000 });
        await removeButton.ClickAsync();
        await page.ModalRemoveGuestButton.ClickAsync();
    }
}
