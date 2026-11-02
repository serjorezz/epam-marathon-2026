# US12_Group Owner Consolidated Pre-order View

| Field | Value |
| --- | --- |
| **Epic** | Order Management |
| **US name** | Consolidated Group Pre-order Overview |
| **Role** | Customer (Group Owner) |
| **Description** | As a group owner, I want to see a consolidated overview of all pre-ordered items submitted by each guest in my group, so that I can review total costs, verify dietary requirements, and approve or adjust the collective order before final submission. |

### Pre-conditions:
- The Customer (Group Owner) is authenticated.
- A table reservation has been created with an active group pre-order session (`Reservation.status = 'Reserved'`).
- At least one guest has joined the session or has items added to their subcart.

### Acceptance Criteria (AC):
1. **Consolidated Breakdown by Guest**: The system displays a grouped list showing each guest's name, their selected dishes, quantities, individual item prices, and subtotal per person.
2. **Table Aggregate Summary**: The view displays an automatically calculated total item count and overall order sum across all guests in real time without page reload.
3. **Status Indicators**: Each guest's sub-order clearly displays its current status (e.g., *Selecting*, *Ready/Confirmed*, *Empty*).
4. **Item Removal & Modification**: The group owner can remove or edit quantities of items from any guest's subcart before the final pre-order submission, triggering a recalculation of the totals.
5. **Session Lock State**: When the group owner triggers "Submit Pre-order to Restaurant", all guest subcarts are locked to prevent further edits, and a confirmation modal is displayed.

---

### Assumptions & Open Questions:
- **Assumption 1**: The group owner pays the entire bill upfront or at the restaurant unless split-billing is enabled in a subsequent story.
- **Assumption 2**: Guests receive visual feedback (read-only banner) when the owner locks the order for submission.
- **Open Question for Tech**: How are real-time updates pushed to the owner's screen when guests add items (WebSocket vs. short polling)?
- **Open Question for UX**: Should guests be able to see each other's orders, or is the consolidated view restricted only to the group owner?
