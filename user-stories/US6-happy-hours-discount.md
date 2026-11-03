# US6_Happy Hours Discount

| Field | Value |
| --- | --- |
| **Epic** | Menu & Pre-Order Experience / Pricing & Promotions |
| **US name** | Happy Hours Discount |
| **Role** | Customer / Dining Guest / Platform Visitor |
| **Description** | As a customer or dining guest making a reservation pre-order, I want to take advantage of restaurant Happy Hours discounts with clear price reductions (old price crossed out in red with the discount percentage and new lower price directly under it) in the menu catalog, dish details, and pre-order cart, and see a golden "Happy hours ★" sign on the reservation banner, so that I can easily recognize promotions and save money. Additionally, as a platform visitor, I want to view Happy Hours schedules and discount percentages on the Locations page. |

### Pre-conditions:
- Restaurant locations have configured Happy Hours time periods (e.g., 12:00 to 16:00) and discount percentages (e.g., 10%).
- The user is either:
  1. Browsing restaurant details on the Locations page, or
  2. Selecting dishes for a reservation pre-order (as a logged-in customer or invited dining guest).

---

### Acceptance Criteria (AC):

1. **Locations Page Happy Hours Schedule & Discount Information**:
   - On the Locations page (`LocationOverviewComponent`), each restaurant's detail card includes Happy Hours information placed directly after the `Atmosphere` block.
   - The block displays a bold heading **Happy Hours** followed by the schedule and discount amount (e.g., *"Daily from 12:00 to 16:00 — 10% discount on all menu dishes."*).
   - The information is fully localized in English, Ukrainian, and Georgian.

2. **Golden "Happy hours ★" Sign on Pre-Order Banner**:
   - When a customer is creating or modifying a pre-order for a reservation scheduled during the restaurant's Happy Hours window (e.g., between 12:00 and 16:00):
     - The top pre-order banner on the Menu page (`MenuPageComponent`) and Guest Pre-Order page (`GuestPreOrderPageComponent`) displays a golden badge: `Happy hours ★`.
     - The golden badge is positioned directly before the text *"You are making a pre-order for a reservation"*.
     - The golden badge features an amber/golden gradient background, golden border, and golden text with a star icon (`★`).
   - If the reservation falls outside Happy Hours, the banner displays only the standard pre-order notification text without the golden sign.

3. **Discounted Price Presentation on Dish Cards**:
   - During an active Happy Hours pre-order, dish cards on the Menu page and Guest Pre-Order page display discounted pricing:
     - The original regular price is displayed in red font (`#dc2626`) with a strikethrough line (`line-through`).
     - Adjacent to the old price, a discount badge displays the percentage reduction (e.g., `-10%`).
     - Positioned directly underneath the struck-out price, the new lower discounted price is clearly displayed in bold primary green text.
   - Outside Happy Hours or when browsing the menu without an active pre-order, regular prices are displayed without strikethrough or discount badges.

4. **Discounted Price Presentation in Dish Modal**:
   - Opening the dish details modal (`DishModalComponent`) during an active Happy Hours pre-order reflects the promotion in the modal footer:
     - The old regular price is displayed in red with a strikethrough, accompanied by the discount badge (e.g., `-10%`).
     - Positioned directly underneath, the new discounted price is displayed along with the dish portion weight (e.g., `$10.80 / 300g`).
   - Outside Happy Hours, the modal displays the standard single price.

5. **Discounted Price & Grand Total Presentation in Pre-Order Cart**:
   - In both the customer cart drawer (`NotSubmittedOrderComponent`) and guest cart drawer (`GuestCartDrawerComponent`):
     - For each dish line item, the old total price is displayed in red with a strikethrough, alongside the discount badge (e.g., `-10%`).
     - Positioned directly underneath, the new discounted price for that quantity is displayed.
     - The order's Total Price / "To Pay" sum is calculated using the discounted prices of all items.
   - If the pre-order reservation is outside the Happy Hours time window, standard non-discounted item prices and totals are shown.

6. **Internationalization & Localization**:
   - All Happy Hours text elements (*"Happy Hours"*, *"Happy hours"*, location schedule descriptions, discount percentage badges) dynamically adapt to the active platform language (English, Ukrainian, Georgian).

7. **Responsive Design & Accessibility**:
   - Struck-through old prices and new discounted prices remain legible across all screen breakpoints (mobile, tablet, desktop).
   - Screen readers and keyboard navigation announce the promotional discount and effective price clearly.

---

### Assumptions & Open Questions:

- **Assumptions**:
  - The default Happy Hours window is 12:00 to 16:00 daily with a 10% discount on all menu items across all restaurant locations, unless custom location-specific hours and discounts are defined.
  - Eligibility for Happy Hours discounts is determined by the scheduled reservation start time.
- **Open Questions**:
  - None.
