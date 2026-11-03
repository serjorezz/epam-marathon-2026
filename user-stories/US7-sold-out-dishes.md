# US7_Sold Out Dish Availability Presentation

| Field | Value |
| --- | --- |
| **Epic** | Menu & Pre-Order Experience / Catalog Management |
| **US name** | Sold Out Dish Availability Presentation |
| **Role** | Customer / Dining Guest / Platform Visitor |
| **Description** | As a customer or dining guest browsing the restaurant menu or selecting dishes for a reservation pre-order, I want to clearly see which dishes are currently sold out with a faded dish card, a prominent "Sold out" badge replacing the price on the card, and a "Sold out" badge in the dish description modal, so that I am immediately aware of dish availability. |

### Pre-conditions:
- Dishes have an availability status (`Available`, `OnStop`, `OutOfStock`).
- "Rkatsiteli Qvevri Amber Wine" is designated as sold out in the menu catalog.
- The user is browsing the menu on the Main page, Menu page, or Guest Pre-Order page.

---

### Acceptance Criteria (AC):

1. **Sold Out Badge as Price Replacement on Dish Cards**:
   - On dish cards (`DishCardComponent`) across the Menu page and Main page, when a dish is sold out (`OutOfStock` or `OnStop`):
     - The price display (and any promotional pricing) is replaced with a styled **Sold out** badge.
     - The portion weight remains visible directly underneath or beside the status.

2. **Faded Dish Card Styling**:
   - Dish cards representing sold-out dishes feature a visually faded presentation (reduced opacity and subtle desaturation) matching the design specification.
   - The card remains legible while clearly indicating to the user that the item is currently unavailable.

3. **Card Interactivity & Dish Details Modal Access**:
   - Clicking on a sold-out dish card remains interactive and opens the dish description card modal (`DishModalComponent`), allowing guests to inspect ingredients, dietary allergens, and nutritional facts.
   - If in Pre-Order mode, the pre-order action button on the card is disabled.

4. **Sold Out Badge in Dish Description Modal**:
   - Inside the dish description modal (`DishModalComponent`):
     - A **Sold out** badge is displayed prominently in the modal footer in place of the price.
     - A **Sold out** badge tag is displayed next to the dish name in the modal header.
     - The "Pre-Order" button in the modal footer is disabled for sold-out dishes.

5. **Designated Sold-Out Wine**:
   - "Rkatsiteli Qvevri Amber Wine" is configured as sold out across all menu views, dish cards, and detail modals.

6. **Internationalization & Localization**:
   - The "Sold out" badge text is fully localized across all supported languages:
     - English: *Sold out*
     - Ukrainian: *Розпродано*
     - Georgian: *გაყიდულია*

7. **Responsive Design & Accessibility**:
   - The "Sold out" badge and faded presentation adapt seamlessly across desktop, tablet, and mobile screen sizes.
