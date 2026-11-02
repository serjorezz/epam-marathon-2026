# US1_Sort Reservations

| Field | Value |
| --- | --- |
| **Epic** | Reservation Management |
| **US name** | Sort Reservations |
| **Role** | Customer (Reservation Owner) |
| **Description** | As a Customer, I want to sort my reservations by date/time, number of guests, or restaurant, so that I can easily find and manage my upcoming or past bookings. |

### Pre-conditions:
- The Customer is logged in to the Green & Tasty platform.
- The Customer has navigated to the Reservations page.
- Customer reservations data has loaded.

---

### Acceptance Criteria (AC):

1. **Dropdown Placement & Visibility**:
   - The "Sort by" dropdown is positioned above the reservations list, aligned next to or below the greeting header.
   - The control displays a clear and accessible visual label "Sort by:".

2. **Available Sort Options**:
   - The dropdown provides the following sorting choices:
     1. Date / Time (Earliest first)
     2. Date / Time (Latest first)
     3. Guests (High to Low)
     4. Guests (Low to High)
     5. Restaurant (A to Z)
     6. Restaurant (Z to A)

3. **Default Selection Behavior**:
   - When opening the Reservations page, the default selected sort option is **Date / Time (Earliest first)**.
   - Reservations appear in chronological order with the earliest upcoming bookings first.

4. **Immediate Reordering**:
   - Selecting any option from the dropdown immediately reorders the displayed reservation cards.
   - Reordering occurs smoothly without a full page reload or disruptive screen flicker.

5. **Stability & Action Retention**:
   - Performing an action on any reservation card (such as cancelling, editing, or leaving feedback) preserves the currently selected sort option.
   - The list remains sorted according to the active criterion after updates.
   - The sort selection resets back to default when opening a new session.

6. **Tie-Breaking Rule**:
   - If two or more reservations have identical values for the selected sort criteria (for example, same number of guests or same restaurant), they are ordered chronologically by Date / Time (Earliest first).

7. **Empty State & Loading Handling**:
   - When the page is still loading, the dropdown is either disabled or hidden to prevent premature interaction.
   - If the customer has no reservations (0 reservations), the sort dropdown is hidden, and the standard empty-state illustration with the "Book a table" button is shown.
   - If only one reservation is present, the dropdown remains accessible and functional.

8. **Accessibility & Responsiveness**:
   - The dropdown is navigable and selectable via keyboard controls.
   - The layout adapts gracefully to mobile screens without overlapping text or breaking alignment.

---

### Assumptions & Open Questions:

- **Assumptions**:
  - Sorting applies to all reservations displayed on the customer's dashboard.
  - Sorting by restaurant compares restaurant names alphabetically.
- **Open Questions**:
  - *UX / Product*: Should the user's chosen sort preference persist across visits, or reset to the default on every page visit?
  - *Product*: Should future iterations introduce status filtering (e.g. active bookings only) alongside sorting?
