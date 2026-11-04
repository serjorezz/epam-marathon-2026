using Microsoft.Playwright;

namespace Restaurant_Aqa_Framework.Ui;

/// <summary>The guest pre-order flow at /join/{token}: guest-name modal, menu with dish cards,
/// cart drawer with quantity controls and the submit-cart button. Selectors verified against the
/// deployed DOM — see scratch/aqa-context.md §3.</summary>
public sealed class GuestPreOrderPage(IPage page) : BasePage(page)
{
    public ILocator GuestNameInput => Page.Locator("input#guestName");
    public ILocator BrowseMenuButton => Page.GetByRole(AriaRole.Button, new() { Name = "Browse Menu", Exact = true });
    public ILocator DishCards => Page.Locator(".dish-cards app-dish-card");
    public ILocator CartOpenButton => Page.Locator("button.cart-btn[aria-label='Open cart']");
    public ILocator CartItems => Page.Locator("aside.drawer .list .item");
    public ILocator CartTotalValue => Page.Locator("aside.drawer .footer .total .total-value");
    public ILocator SubmitCartButton => Page.Locator("aside.drawer .footer button.submit");
    public ILocator SubmittedHeading => Page.GetByRole(AriaRole.Heading, new() { Name = "Pre-Order Submitted!" });

    public Task JoinAsync(string token) => NavigateToAsync($"/join/{token}");

    /// <summary>The shared dish card renders its pre-order action as a native button inside the
    /// custom-button host; the first card's button adds one portion of that dish.</summary>
    public ILocator PreOrderButtonOnCard(int index) =>
        DishCards.Nth(index).GetByRole(AriaRole.Button, new() { Name = "Pre-Order", Exact = true });
}
