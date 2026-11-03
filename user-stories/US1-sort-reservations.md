# US1_Sort Reservations

| Field | Value |
| --- | --- |
| **Epic** | Reservation Management |
| **US name** | Sort & Status Filtering for Reservations |
| **Role** | Customer (Reservation Owner) |
| **Description** | As a Customer, I want to sort my reservations by date/time, number of guests, or restaurant, and filter them to show only active bookings, so that I can easily find and manage my upcoming or past bookings. |

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
   - When opening or navigating to the Reservations page, the default selected sort option is **Date / Time (Earliest first)**.
   - Reservations appear in chronological order with the earliest upcoming bookings first.
   - The sort preference resets to this default on every new page visit or refresh.

4. **Immediate Reordering**:
   - Selecting any option from the dropdown immediately reorders the displayed reservation cards.
   - Reordering occurs smoothly without a full page reload or disruptive screen flicker.

5. **Stability & Action Retention**:
   - Performing an action on any reservation card (such as cancelling, editing, or leaving feedback) preserves the currently selected sort option during the active session.
   - The list remains sorted according to the active criterion after updates.

6. **Tie-Breaking Rule**:
   - If two or more reservations have identical values for the selected sort criteria (for example, same number of guests or same restaurant), they are ordered chronologically by Date / Time (Earliest first).

7. **Empty State & Loading Handling**:
   - When the page is still loading, the dropdown is either disabled or hidden to prevent premature interaction.
   - If the customer has no reservations (0 reservations), the sort dropdown and filter controls are hidden, and the standard empty-state illustration with the "Book a table" button is shown.
   - If only one reservation is present, the controls remain accessible and functional.

8. **Active Bookings Status Filter Checkbox**:
   - A checkbox labeled "Active bookings only" is available alongside the "Sort by" dropdown in the controls bar above the reservations list.
   - In the default state, the checkbox is unchecked, showing all reservations regardless of status.
   - When checked, the reservations list dynamically filters to display only active bookings (`Reserved` and `In Progress`). Past (`Finished`) and cancelled (`Cancelled`) bookings are hidden.
   - Unchecking the checkbox immediately restores all reservations without requiring a page refresh.
   - Active filtering works simultaneously with sorting: the filtered active bookings remain ordered by the currently selected sort option.
   - If no bookings match the active status filter, an informative message ("No active bookings found") is displayed.

9. **Accessibility & Responsiveness**:
   - The dropdown and checkbox controls are navigable and operable via keyboard.
   - The layout adapts gracefully to mobile screens without overlapping text or breaking alignment.

---

### Assumptions & Open Questions:

- **Assumptions**:
  - Sorting applies to all reservations displayed on the customer's dashboard.
  - Sorting by restaurant compares restaurant names alphabetically.
  - The sort preference resets to the default option ("Date / Time (Earliest first)") on every page visit without client-side persistence across visits.
- **Open Questions**:
  - *UX / Product*: Should the user's chosen sort preference persist across visits, or reset to the default on every page visit? -> **Resolved**: Resets to default ("Date / Time (Earliest first)") on every page visit.
  - *Product*: Should future iterations introduce status filtering (e.g. active bookings only) alongside sorting? -> **Resolved**: Added "Active bookings only" checkbox filter alongside the sort dropdown.
