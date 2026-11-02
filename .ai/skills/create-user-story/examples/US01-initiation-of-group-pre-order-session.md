# US1_Initiation of Group Pre-order Session (Owner)

| Field | Value |
| --- | --- |
| **Epic** | Order Management |
| **US name** | Initiation of Group Pre-order Session |
| **Role** | Customer (Owner) |
| **Description** | As a Reservation Owner, I want to easily initiate a group pre-order session and share a unique link with my companions so that they can select their own dishes and I do not have to manually input orders for everyone. |

### Pre-conditions:
- The Customer is logged in.
- The Customer has successfully created a table reservation (Reservation status = "Reserved").

### Acceptance Criteria (AC):
1. Immediately upon successful reservation creation (when Reservation status transitions to "Reserved"), the system must automatically instantiate a unique GroupSessionID mapped 1-to-1 to the ReservationID.
2. This session generation must happen in the background and does not require any explicit initiation trigger from the Owner.
3. The system must display the group pre-order controls (such as the [ Invite Guests ] button, copying options) in "Reservations" only if the table reservation’s guests_count is ≥ 2.
4. Upon clicking the invite button, the system must generate a cryptographically secure, non-guessable tokenized URL: `https://greentasty.app/join/{secure_session_token}`.
5. Clicking the "Copy" action must automatically copy the tokenized URL to the device’s clipboard and show a notification on-screen: "Link copied! Share it with your friends."
6. The sharing link and the invite panel must only be active while the parent Reservation has the status "Reserved".
7. If the reservation is modified to a different restaurant location, cancelled (Cancelled), or completed (Completed), the session token must immediately expire. Anyone trying to access the link after expiration must be redirected to a static page: "This pre-order session has expired or is no longer active."
