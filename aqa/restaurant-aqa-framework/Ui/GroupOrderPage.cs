using Microsoft.Playwright;

namespace Restaurant_Aqa_Framework.Ui;

/// <summary>The owner's consolidated group pre-order page (/reservations/{id}/group-order).
/// Selectors verified against the deployed DOM — see scratch/aqa-context.md §3.</summary>
public sealed class GroupOrderPage(IPage page) : BasePage(page)
{
    public ILocator StatusBadge => Page.Locator("main.group-order-page span.status-badge");
    public ILocator ParticipantCards => Page.Locator("ul.participants > li.participant-item app-participant-card");
    public ILocator GrandTotalValue => Page.Locator(".grand-total-row .grand-total-value");
    public ILocator ConsolidatedItems => Page.Locator("ul.consolidated-items > li.consolidated-item");
    public ILocator SubmitButton => Page.Locator("button.btn-submit-order");
    public ILocator ModalSubmitButton => Page.Locator("button.btn-modal-submit");
    public ILocator ModalRemoveGuestButton => Page.Locator("button.btn-modal-danger");

    /// <summary>The page loads through a skeleton while it chains invite-token → invite → sessions;
    /// any of these rendered states means the data has arrived (badge, error state, or empty list).
    /// </summary>
    public ILocator ReadyIndicator => Page.Locator(
        "main.group-order-page span.status-badge, main.group-order-page .state-container, main.group-order-page p.empty-state, main.group-order-page ul.participants").First;

    public async Task WaitForReadyAsync() =>
        await ReadyIndicator.WaitForAsync(new() { State = WaitForSelectorState.Visible, Timeout = 60_000 });

    public Task NavigateForAsync(string reservationId) => NavigateToAsync($"/reservations/{reservationId}/group-order");

    public Components.ParticipantCardComponent Participant(int index) => new(ParticipantCards.Nth(index));

    public Components.ParticipantCardComponent ParticipantByName(string name) =>
        new(ParticipantCards.Filter(new() { HasText = name }));
}
