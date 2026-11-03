# US3_Customer Favorite Dishes

| Field | Value |
| --- | --- |
| **Epic** | Menu & Dish Management |
| **US name** | Customer Favorite Dishes |
| **Role** | Customer |
| **Description** | As a logged-in Customer, I want to mark dishes as favorites directly on menu cards and filter the menu to view only my favorite dishes, so that I can quickly recognize, review, and reorder the meals I enjoy most. |

### Pre-conditions:
- The customer is browsing the Menu page on the Green & Tasty platform.
- Menu dishes have loaded on the screen.

---

### Acceptance Criteria (AC):

1. **Authentication Requirement**:
   - The favorite features (star icons on dish cards and the Favorites filter button) are only available to authenticated customers.
   - If a visitor is not logged in:
     - No star icons appear on dish cards (even when hovered or clicked).
     - The Favorites filter selector is completely hidden from the category filters bar.
     - Unauthenticated visitors cannot add or remove dishes from favorites.

2. **Hollow Star Display on Card Hover (Authenticated Customers)**:
   - In the idle state (when a dish is not marked as a favorite and the card is not hovered), the star icon remains completely hidden.
   - When an authenticated customer points or hovers their cursor over any dish card, a hollow golden star icon appears in the top-right corner of that card.

3. **Explanatory Tooltip**:
   - Pointing or hovering directly over the star icon displays an explanatory tooltip box adjacent to the star:
     - For non-favorite dishes, the tooltip displays *"Add to favorite"*.
     - For favorite dishes, the tooltip displays *"In favorite"*.
   - Tooltip text adapts dynamically to the selected website language (English, Ukrainian, Georgian).

4. **Adding to Favorites**:
   - Clicking the hollow golden star marks the dish as a favorite.
   - The star icon immediately transitions to a filled golden star.
   - The explanation tooltip updates to *"In favorite"*.
   - The filled golden star remains permanently visible on the dish card at all times (including idle state when the cursor leaves the card).
   - The favorite status is saved in the database for the customer account.

5. **Removing from Favorites**:
   - Clicking an already filled golden star removes the dish from the customer's favorites.
   - The star icon immediately reverts to a hollow golden outline.
   - The explanation tooltip updates back to *"Add to favorite"*.
   - When the cursor leaves the card, the star hides in accordance with the idle state.
   - The removal is updated in the database for the customer account.

6. **Optimized Menu Loading with Favorites**:
   - When an authenticated customer opens or refreshes the Menu page, the dishes are loaded and displayed together with their favorite status already applied.
   - Favorite dishes appear with their filled golden star immediately visible, with no delayed pop-in or flickering.

7. **Favorites Filter Tab / Quick Toggle**:
   - For authenticated customers, a "Favorites" filter option with a golden star icon is available alongside the category filters on the Menu page.
   - The button displays the translated label (*"Favorites"*) and dynamically shows the count of favorite dishes currently available (e.g., `(2)`).
   - Clicking the "Favorites" filter toggles the view to display only dishes marked as favorites by the customer.
   - If a customer is viewing a specific category and activates the favorites filter, only favorite dishes within that category are shown; if no category is selected, all favorite dishes across the entire menu are displayed.
   - When the favorites filter is active, the tab/button is visually highlighted with an active golden accent and filled star.
   - Clicking the "Favorites" filter again deactivates the filter and restores the display of all dishes.
   - If no dishes match the favorites filter, a user-friendly message (*"No favorite dishes found"*) is displayed.
   - The favorites filter state is reflected in the URL query parameters (`?favorites=true`) to support bookmarking and browser navigation.

8. **Card Click Isolation**:
   - Clicking the favorite star button toggles the favorite state without opening the dish details popup or triggering any card-level navigation.

9. **Accessibility & Responsive Presentation**:
   - The favorite toggle button and filter tab are keyboard-accessible with visible focus indicators and accessible labels indicating the current state.
   - On touch-enabled devices where hover is unavailable, favorite controls remain accessible and responsive without blocking other card interactions.

---

### Assumptions & Open Questions:

- **Assumptions**:
  - A customer's saved favorites persist across browser sessions and across different devices upon logging in.
  - Guest/unauthenticated users must register or sign in before accessing personal favorites.
- **Open Questions**:
  - None.
