# US4_Allergen and Spiciness Dietary Customization

| Field | Value |
| --- | --- |
| **Epic** | Menu & Pre-Order Experience |
| **US name** | Allergen and Spiciness Dietary Customization |
| **Role** | Customer / Dining Guest |
| **Description** | As a customer or dining guest, I want to clearly identify dishes containing allergens or spicy ingredients on menu cards and customize eligible dishes in my cart by removing allergens or selecting non-spicy preparation, so that I can safely order food suited to my dietary restrictions while being clearly informed when allergens are baked-in and cannot be omitted. |

### Pre-conditions:
- The user is browsing the Menu page or viewing dishes in the pre-order cart (logged-in customer cart or guest pre-order drawer).
- Menu dishes have been loaded with their respective allergen and spiciness attributes.

---

### Acceptance Criteria (AC):

1. **Top-Left Circular Badges on Dish Cards**:
   - Dishes containing allergy ingredients (`nuts` or `cilantro`) display a circular badge with a nut icon in the top-left corner of the dish card.
   - Dishes designated as spicy display a circular badge with a flame icon in the top-left corner of the dish card.
   - If a dish is both spicy and contains allergens, both circular badges are displayed side-by-side in the top-left corner.
   - Dishes with no allergens and zero spiciness display no dietary badges in the top-left corner.

2. **Explanatory Tooltips on Hover**:
   - Pointing or hovering the cursor over the circular nut badge displays a tooltip: *"Contains allergy ingredients"*.
   - Pointing or hovering the cursor over the circular flame badge displays a tooltip: *"Spicy food"*.
   - Tooltips are dynamically translated into the active language (English, Ukrainian, Georgian).

3. **Dietary Details in Dish Modal**:
   - Opening the dish details modal displays a dedicated dietary information section.
   - When a dish contains allergens, the section lists all present allergens (e.g., *Nuts*, *Cilantro*).
   - If an allergen cannot be removed from the dish (e.g., Honey Walnut Baklava), the modal clearly indicates *(cannot be removed)* next to that allergen.
   - When a dish is spicy, the modal indicates that it is spicy and notes *(Can be prepared non-spicy)* if mild preparation is possible.

4. **Cart Customization for Removable Allergens**:
   - In the pre-order cart (`NotSubmittedOrderComponent`) and guest drawer (`GuestCartDrawerComponent`), dishes with removable allergens provide explicit checkboxes for each removable ingredient:
     - Checkbox label: *"No nuts"* for nuts removal.
     - Checkbox label: *"No cilantro"* for cilantro removal.
   - Toggling the checkbox marks the allergen as removed from that order item.

5. **Cart Customization for Non-Spicy Option**:
   - Dishes that are spicy and support non-spicy preparation provide a checkbox in the cart:
     - Checkbox label: *"Non-spicy"*.
   - Selecting the checkbox updates the order item to request non-spicy preparation.

6. **Protection for Non-Removable Allergens**:
   - For dishes where allergens are baked-in or blended (e.g., Honey Walnut Baklava, Georgian Pkhali Trio), removal checkboxes are not displayed.
   - The cart displays only the circular allergen and spicy badges without checkboxes, visually confirming the presence of allergens that cannot be omitted.

7. **Multi-Language Localization**:
   - All dietary badge tooltips, modal notes, and cart removal checkbox labels are fully localized in English, Ukrainian, and Georgian.

8. **Accessibility & Responsive Presentation**:
   - Badge icons have descriptive `aria-label` attributes for screen readers.
   - Checkbox controls in the cart have clear tap/click targets and accessible labels that can be navigated and toggled via keyboard.

---

### Assumptions & Open Questions:

- **Assumptions**:
  - Removing an allergen or requesting non-spicy preparation does not alter the base price of the dish.
  - Customization selections are preserved in the order item state until submitted or modified.
- **Open Questions**:
  - None.
