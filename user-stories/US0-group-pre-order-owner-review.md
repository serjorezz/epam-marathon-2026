# US0_Group Pre-Order Owner Review and Confirmation

| Field | Value |
| --- | --- |
| **Epic** | Pre-Order & Group Booking Management |
| **US name** | Group Pre-Order Owner Review and Confirmation |
| **Role** | Customer (Group Booking Owner) |
| **Description** | As a booking owner, I want to review the dishes selected by each invited guest and submit a single consolidated pre-order to the restaurant, so that the restaurant receives an accurate aggregate order ahead of our visit while ensuring everyone's choices are respected. |

### Pre-conditions:
- The Customer is authenticated on the Green & Tasty platform as the creator/owner of the table reservation.
- The table reservation is confirmed with an active group pre-order session.
- The Customer navigates to the Group Pre-Order review screen for the reservation.

---

### Acceptance Criteria (AC):

1. **Header & Reservation Context**:
   - The screen header displays the title "Group Pre-Order" alongside a real-time status badge indicating the booking phase ("Collecting pre-orders" while open, or "Sent to Restaurant" once submitted).
   - The header displays essential event metadata: restaurant venue address, booking date, reservation time window, and guest attendance count ("X of Y guests").

2. **Participant Pre-Order Overview**:
   - Each participant in the group (the booking owner and invited guests) is displayed in a dedicated participant card.
   - The owner's own card is explicitly distinguished with the title "My Pre-Order", whereas guest cards display the guest's name (e.g., "Guest: Alex").
   - Each participant card displays their current cart status: "Submitted" (green badge) if the participant finalized their choices, or "Still choosing" (yellow badge) if their cart remains pending.
   - For participants who have chosen dishes, their card lists each dish title, dish thumbnail image (or initial placeholder), item quantity, and line price, followed by their individual Subtotal.
   - If a participant has not chosen any dishes, their card displays a clear "No dishes yet" placeholder.

3. **Pending Participants Alert**:
   - If one or more participants have not submitted their pre-order, a prominent warning alert is displayed above the order breakdown:
     *"N participants haven't submitted their cart yet — their dishes won't be included in the order"*.
   - If all participants have submitted their pre-orders, the warning banner is automatically hidden.

4. **Consolidated Pre-Order Summary**:
   - A dedicated "Consolidated Pre-Order" panel displays the aggregate items ready for restaurant preparation.
   - Only dishes from participants whose cart status is "Submitted" are included in the consolidated summary. Items from participants who are "Still choosing" are excluded.
   - Identical dishes across multiple submitted guest carts are grouped into a single combined line item displaying the dish name, total combined quantity, and aggregate price.
   - If no participants have added dishes, an empty state message is shown: *"Participants haven't added any dishes yet"*.
   - A "Grand Total" amount is prominently calculated and displayed, representing the sum of all submitted items.

5. **Submitting Pre-Order to Restaurant**:
   - A primary "Submit Pre-Order" button is available within the consolidated order panel.
   - The submit button is disabled if there are no submitted dishes in the consolidated summary, or while a submission request is currently in progress.
   - Clicking "Submit Pre-Order" triggers a confirmation dialog prompting the owner:
     *"Are you sure you want to submit the consolidated pre-order to the restaurant? Only dishes from submitted carts will be included."*
   - Upon clicking "Submit" in the dialog:
     - The consolidated order is submitted to the restaurant.
     - A confirmation notification ("Pre-order sent to the restaurant") is displayed.
     - The page transitions to a locked, read-only state: the status badge updates to "Sent to Restaurant", the submit button is removed or disabled, and further guest changes are stopped.

6. **Guest Removal (Pre-Submission Management)**:
   - While the group pre-order is open, the owner can remove any invited guest from the reservation by clicking "Remove Guest" on that guest's card.
   - The "Remove Guest" action is NOT available on the owner's own card ("My Pre-Order") and is permanently disabled after the order has been submitted.
   - Clicking "Remove Guest" opens a confirmation modal:
     *"Are you sure you want to remove [Guest Name] and their pre-order from this reservation? This action cannot be undone."*
   - Confirming removal removes the guest and their selections, immediately recalculating participant counts, consolidated item totals, and the Grand Total.

7. **Data Freshness & Manual Refresh**:
   - While the session is open, the page automatically synchronizes with guest updates in the background without refreshing the entire web page or disrupting the owner's view.
   - The header displays a timestamp indicating when the data was last updated (*"Updated at HH:mm:ss"*), along with an interactive "Refresh" button for immediate on-demand synchronization.
   - If a background synchronization fails, the page retains existing data and gracefully indicates *"Couldn't refresh. Showing data from [time]"*.

8. **Error & Loading States**:
   - While loading group reservation data, an accessible loading indicator is displayed.
   - If the group reservation cannot be found, a descriptive message is shown: *"Group reservation not found"*.
   - If an unexpected error occurs while retrieving reservation data, a message *"Failed to load group reservation"* is displayed alongside a "Try again" action button.

9. **Accessibility & Responsive Presentation**:
   - All interactive controls (buttons, links, dialog triggers) are keyboard accessible with visible focus states and descriptive accessible labels.
   - The layout adapts responsively to mobile viewports (375px+) ensuring cards, summary details, and action buttons remain clear and readable.

10. **Pre-Order Cutoff Deadline & Cart Locking (2 Hours Prior to Reservation)**:
    - Group pre-ordering has an automatic deadline 2 hours prior to the reservation start time (`reservation.StartTime - 2 hours`).
    - If the reservation owner has not yet submitted the consolidated pre-order by this deadline:
      - All unsubmitted guest carts are automatically locked to prevent further additions, modifications, or submissions.
      - Guests attempting to access or edit an unsubmitted pre-order after the deadline see a clear notice that the 2-hour deadline has passed and their cart is locked.
      - In the owner review screen, unsubmitted participant cards display a "Locked" status chip once the deadline is reached.
      - The reservation owner retains the ability to review all submitted guest dishes and submit the final consolidated pre-order to the restaurant.

---

### Assumptions & Open Questions:

- **Assumptions**:
  - The booking owner is responsible for confirming the collective pre-order for the entire party; individual guests cannot independently submit the table's final order.
  - The restaurant kitchen prepares only the dishes included in the final consolidated pre-order; unsubmitted carts are treated as guests ordering directly at the restaurant upon arrival.
- **Open Questions**:
  - *Product / Business*: Should an automatic deadline (e.g. 2 hours before reservation start time) auto-submit or lock unsubmitted group carts if the owner hasn't submitted yet? -> **Resolved**: Yes, lock unsubmitted group carts 2 hours before reservation start time if the owner hasn't submitted yet.
  - *UX / Notification*: Should invited guests receive an in-app or SMS notification when the owner removes them or when the final pre-order is confirmed? -> **Resolved**: No, confirmed as out of scope.
