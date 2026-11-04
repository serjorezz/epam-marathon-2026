using Restaurant_Aqa_Framework.Ui;

namespace Restaurant_Aqa_Framework.Screenplay.Tasks;

/// <summary>A guest joins the group through the storefront: opens the invite link, enters their
/// name in the modal and proceeds to the menu. Remembers the invite token's page state implicitly;
/// the guest name is remembered for later steps.</summary>
public sealed class JoinTheGroupThroughThePage(string guestName) : ITask
{
    public const string GuestNameKey = "groupUiGuestName";

    public async Task PerformAsAsync(Actor actor)
    {
        var token = actor.Recall<string>(SetUpAGroupReservation.InviteTokenKey);
        var page = new GuestPreOrderPage(actor.LookingAtThePage());
        await page.JoinAsync(token);
        await page.GuestNameInput.FillAsync(guestName);
        await page.BrowseMenuButton.ClickAsync();
        actor.Remember(GuestNameKey, guestName);
    }
}
