using Microsoft.Playwright;

namespace Restaurant_Aqa_Framework.Ui.Components;

/// <summary>One participant card inside the owner's group pre-order page. Locators verified against
/// the deployed build (app-participant-card): h2.title, chips submitted/pending, items ul.items
/// li.item (.name/.qty/.price), p.subtotal, remove button.btn-remove with aria-label "Remove {name}".</summary>
public sealed class ParticipantCardComponent(ILocator root)
{
    public ILocator Name => root.Locator("h2.title");
    public ILocator SubmittedChip => root.Locator("span.chip.submitted");
    public ILocator PendingChip => root.Locator("span.chip.pending");
    public ILocator Items => root.Locator("ul.items > li.item");
    public ILocator EmptyNote => root.Locator("p.empty");
    public ILocator Subtotal => root.Locator("p.subtotal");

    public ILocator RemoveButton(string name) =>
        root.Locator($"button.btn-remove[aria-label='Remove {name}']");
}
