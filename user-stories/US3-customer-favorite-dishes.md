# US3_Customer Favorite Dishes

| Field | Value |
| --- | --- |
| **Epic** | Menu & Dish Management |
| **US name** | Customer Favorite Dishes |
| **Role** | Customer |
| **Description** | As a Customer, I want to mark dishes as favorites directly on menu cards and have my favorites appear whenever I view the menu, so that I can quickly recognize and reorder the meals I enjoy most. |

### Pre-conditions:
- The customer is browsing the Menu page on the Green & Tasty platform.
- Menu dishes have loaded on the screen.

---

### Acceptance Criteria (AC):

1. **Hollow Star Display on Card Hover**:
   - In the idle state (when a dish is not marked as a favorite and the card is not hovered), the star icon remains completely hidden.
   - When the customer points or hovers their cursor over any dish card, a hollow golden star icon appears in the top-right corner of that card.

2. **Explanatory Tooltip**:
   - Pointing or hovering directly over the star icon displays an explanatory tooltip box adjacent to the star:
     - For non-favorite dishes, the tooltip displays *"Add to favorite"*.
     - For favorite dishes, the tooltip displays *"In favorite"*.
   - Tooltip text adapts dynamically to the selected website language (English, Ukrainian, Georgian).

3. **Adding to Favorites**:
   - Clicking the hollow golden star marks the dish as a favorite.
   - The star icon immediately transitions to a filled golden star.
   - The explanation tooltip updates to *"In favorite"*.
   - The filled golden star remains permanently visible on the dish card at all times (including idle state when the cursor leaves the card).
   - The favorite status is saved in the database for the customer account.

4. **Removing from Favorites**:
   - Clicking an already filled golden star removes the dish from the customer's favorites.
   - The star icon immediately reverts to a hollow golden outline.
   - The explanation tooltip updates back to *"Add to favorite"*.
   - When the cursor leaves the card, the star hides in accordance with the idle state.
   - The removal is updated in the database for the customer account.

5. **Optimized Menu Loading with Favorites**:
   - When an authenticated customer opens or refreshes the Menu page, the dishes are loaded and displayed together with their favorite status already applied.
   - Favorite dishes appear with their filled golden star immediately visible, with no delayed pop-in or flickering.

6. **Card Click Isolation**:
   - Clicking the favorite star button toggles the favorite state without opening the dish details popup or triggering any card-level navigation.

7. **Accessibility & Responsive Presentation**:
   - The favorite toggle button is keyboard-accessible with visible focus indicators and accessible labels indicating the current state.
   - On touch-enabled devices where hover is unavailable, favorite controls remain accessible and responsive without blocking other card interactions.

---

### Assumptions & Open Questions:

- **Assumptions**:
  - Unauthenticated visitors who attempt to add a dish to favorites are prompted to log in to save their preferences.
  - A customer's saved favorites persist across browser sessions and across different devices upon logging in.
- **Open Questions**:
  - *Product / UX*: Should a future enhancement introduce a "Favorites" filter tab or quick toggle alongside the category filters on the menu page?
