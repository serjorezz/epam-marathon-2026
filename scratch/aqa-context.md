# AQA Homework — Working Context

This file is the shared briefing for all AQA homework phases (B1–B4, C). It captures the
contracts, conventions and traps discovered during Phase A. **Do not commit secrets:**
account credentials live in `credentials.env` (repo root, git-ignored) and in the local
`aqa/restaurant-aqa-framework/.env`; this document references them by role only.

## 1. Environment under test

| What | Where |
|---|---|
| Frontend (deployed) | `FRONTEND_URL` in `credentials.env` (S3 static site, HTTP) |
| Backend (deployed) | `API_BASE_URL` in `credentials.env` (API Gateway, stage `/develop`) |
| Cognito | user pool + client id in `credentials.env` |
| Standing accounts | admin, general waiter, 3 location waiters, test customer — `credentials.env` |
| Seeded tables | `table-b1..b6` (loc-baratashvili, cap 2/2/4/4/6/8), `table-a1..a6` (loc-abashidze), `table-r1..r3` (loc-rustaveli) — `scripts/seed-dynamodb.py` |

To run the framework locally, `cp .env.example .env` in `aqa/restaurant-aqa-framework/` and fill
`UI_URL`/`API_URL` from `credentials.env`, plus `WAITER_*`, `ADMIN_*`, `TESTTABLE_*`
(`TESTTABLE_ID=table-b1`, `TESTTABLE_WAITER_*` = the baratashvili waiter from `credentials.env`).
Worktrees do NOT get the git-ignored `.env`/`credentials.env` — copy or reference the main clone.

Deployed-backend verification (Phase A): group pre-order endpoints are live and auth-gated
(`401` unauthenticated on guest session routes, `403` on submit).

## 2. Framework conventions (MUST follow)

Full details with code samples in the explore report; the short binding rules:

- Gherkin is declarative: user intent and observable outcomes only — no URLs, HTTP verbs, status
  codes, selectors or ids. Personas: `visitor`, `guest`, `customer`, `waiter`, `manager`.
- Step definitions are thin glue: they only call `Actor.AttemptsToAsync(...)` /
  `Actor.AsksForAsync(...)` and assert on answers (TUnit `Assert.That`). No page objects or API
  clients in steps; no state in step classes — use actor memory (`Remember`/`Recall<T>()`).
- `[Scope(Tag = "ui")]` / `[Scope(Tag = "api")]` lets one sentence bind to different stages.
- Screenplay: `ITask` (do) in `Screenplay/Tasks/`, `IQuestion<T>` (ask) in `Screenplay/Questions/`.
  API work goes through clients in `Api/` (`sealed class XxxApi(IAPIRequestContext) : ApiClientBase`),
  raw `IAPIResponse` returned, DTOs are records in `Api/Dtos/<Resource>/`.
- Test data: `SampleDataFactory` (Bogus, `AQA-Sample-` prefix, `UniqueEmail()`, `ValidPassword()`).
  Every created entity must be registered with `Recall<CleanupScope>().TrackDelete(label, delete)`.
  Time-dependent data: `now + N` — never hardcode dates.
- UI: page objects in `Ui/` wrap `IPage`/`ILocator`, never assert. Prefer role+accessible name,
  label, then CSS. **The frontend has NO `data-testid` attributes** and most visible text is
  translated — text locators only work because the framework pins English (see §5).
- Tags: `@ui`/`@api` select the stage (hooks), plus `@smoke`, `@negative`, `@validation`,
  `@direction1`, `@direction2`, `@level1..3` for this homework.
- Lint: `npx gherkin-lint -c .gherkin-lintrc "Features/*.feature"`. Build: warnings are errors.

## 3. Group pre-order API contract (Direction 1)

Source of truth: `backend/restaurant-backend-app/docs/ApiRoutes.md` (L1075+) and
`RouteRegistry.cs`; service behaviour verified against
`dnapp/lambdas/api-handler/Services/GroupReservations/GroupReservationService.cs`.

| Endpoint | Notes |
|---|---|
| `GET /reservations/{id}/invite-token` | Owner-only; requires `GuestCount >= 2` and status `Reserved`; group auto-created on first call |
| `GET /guest/invites/{token}` | Public (no auth). 404-ish when group closed/invalid |
| `POST /guest/sessions` body `{groupReservationId, guestName}` → 201 `{sessionToken}` | Guest join; token is the guest's bearer token |
| `GET /guest/sessions/{id}` | Guest's own session (`id`, `groupReservationId`, `guestName`, `status`) |
| `POST/DELETE /guest-sessions/{id}/dishes` body `{dishId, quantity?}` | Add/remove dish in guest cart (bearer = sessionToken) |
| `GET /guest/sessions/{id}/menu` | Public menu for the guest flow |
| `POST /guest-sessions/{id}/submit` | Guest confirms own cart ("Guest cart submitted successfully.") |
| `GET /reservations/{id}/guest-session-id` | Owner's own guest session (created on first call, `IsOwnerSession=true`) |
| `GET /guest/groups/{groupId}/sessions` | **Owner-only.** `{participants:[{id,type,name,items:[{dish:{id,name,price},quantity}],total,isSubmitted}], total}` |
| `POST /group-reservations/{groupId}/submit` body `{reservationId}` → 200 `[{dishId,quantity}]` | Owner-only consolidation |
| `DELETE /guest/groups/{groupId}/sessions/{guestSessionId}` | Owner-only; returns the updated `{participants, total}` |
| `GET /guest/groups/{groupId}/status` | `{status,totalGuests,submittedGuests}` |

### Behaviours chosen for cases undefined in the homework (document in README, test to match backend)

- **Non-Owner / anonymous access to owner routes** → `403` (`ActionForbiddenException`).
- **Repeated submit of an already-Submitted group**: the service has no status guard, so it
  re-consolidates the still-submitted sessions and **succeeds again (200, idempotent)**. Test it
  as "submitting again re-succeeds / stays Submitted", NOT as an error.
- **Group with zero participants** → `participants: []`, `total: 0`.
- **Submit with no submitted carts** → 400 "No submitted guest sessions found to consolidate."
- **Submit with submitted carts but no dishes** → 400 "No dishes found in the submitted guest sessions."
- **Submit when reservation has no order** → 400 "Active pre-order for reservation not found."
- **Group or reservation does not exist** → 404 with the not-found message.
- **Deleting a guest from another group** → 400; **deleting a non-existent session** → 404 (verify
  against deployment; adjust to the real code if it differs).

### UI flow facts (Owner)

Owner's group page route: `/reservations/:reservationId/group-order` (direct URL; the customer
reservation card has NO link to it). Key selectors (deployed build, English pinned):
`main.group-order-page`; status badge `span.status-badge` ("Collecting pre-orders" / "Sent to
Restaurant"); participants `ul.participants > li.participant-item app-participant-card`; inside a
card: `h2.title` (name), `span.chip.submitted|pending` ("Submitted"/"Still choosing"), items
`ul.items > li.item` (`.name`, `.qty`, `.price`), per-participant total `p.subtotal`, empty note
`p.empty` ("No dishes yet"), remove button `button.btn-remove` (`aria-label="Remove <name>"`,
only for unsubmitted `Guest` cards while group is Open); consolidated items
`ul.consolidated-items > li.consolidated-item` (`.dish-name`, `.dish-price`); grand total
`.grand-total-row .grand-total-value`; submit `button.btn-submit-order`; confirm modal
`button.btn-modal-submit`; remove-guest modal `button.btn-modal-danger`.

### UI flow facts (Guest, `/join/:token`)

Guest-name modal: `input#guestName`, confirm "Browse Menu". Menu: category buttons
`.category-buttons button`, sort `select#guestMenuSort`, dish cards `.dish-cards app-dish-card`
(add via shared dish-card pre-order button or dish modal). Cart drawer: open
`button.cart-btn[aria-label="Open cart"]`, items `.list .item` (`.info .name`, `.qty-value`),
qty `button.qty-btn[aria-label="Decrease quantity"|"Increase quantity"]`, remove
`button.trash[aria-label="Remove item"]`, total `.footer .total .total-value`, submit
`.footer button.submit`. After submitting: confirmation `h1` "Pre-Order Submitted!". Expired
redirect → `/guest-pre-order-expired` (`h1` "This pre-order session has expired or is no longer
active.").

### UI flow facts (Waiter)

Waiter dashboard `/waiter-reservations`: cards `ul.reservation-list app-card-reservation`
(`li.card`), status `span.status-badge`, table reassignment `app-custom-select.table-select`,
actions `.actions button` ("Start service", "Finish service", "Cancel", "Postpone", "Pre-order").
Waiter pre-order page `/waiter-pre-order`: items `.preorder-list app-dish-card.pre-order-dish`,
qty `.pre-order-footer .pre-order-quantity` ("Quantity: N"), confirm `app-custom-button.btn-confirm`,
cancel `app-custom-button.btn-cancel`. Waiter login → lands on `/waiter-reservations`
(`login-form.component.ts:105`).

## 4. Direction 2 facts

- Registration rules (homework L1): first/last name 2–50 chars latin+hyphen+apostrophe; email ≤254,
  valid format; password 8–16; confirmation must match; registration always yields a Customer.
  Existing coverage: `Features/Registration.feature`, `Features/Auth.feature`,
  `Features/MenuCatalog.feature` (API-level catalog rules; UI menu scenario exists).
  **Gap**: boundary examples (1/2/50/51, 7/8/16/17) must be explicit — extend outlines there.
- Reservation rules (homework L2): start ≥ now+15min; end > start; guests ≤ capacity; no overlaps;
  new status `Reserved`; customers see/change only their own. Existing
  `Features/Reservations.feature` is `@wip` with 3 API scenarios — steps unimplemented.
  **This is the starting point for B3**: implement the steps and extend with boundaries
  (14/15/16 min; capacity, capacity+1, capacity−1; adjacent vs overlapping intervals; edit, cancel,
  re-cancel; other customer's reservation; anonymous).
- Waiter (homework L3): reservation status transitions (Reserved→InProgress→Completed/Cancelled);
  dish confirm/cancel only for the **assigned** waiter (`PATCH /reservations/{id}/order/
  confirmations/{dishId}` / `cancellations/{dishId}`); table reassignment
  `PATCH /reservations/{id}/table`. API client methods already exist in `Api/ReservationsApi.cs`.
- Feedback (homework L3): `Api/FeedbackApi.cs` + DTOs exist (`CreateFeedbackRequest`,
  `FeedbackType`, sorting, pagination — check `FeedbackApi` for query params).
  `scripts/seed-feedback.py` seeds sample feedback.
- Pre-order (homework L3): customer pre-order via `Api/OrdersApi.cs`
  (create/edit/submit/unsubmit/cancel; see `PreOrdersService` calls: `POST /orders`,
  `PUT/DELETE /orders/{reservationId}`, `POST /orders/{id}/submit|unsubmit`).

## 5. Traps & gotchas (hard-won in Phase A)

1. **Locale pinning is mandatory.** The deployed SPA auto-detects browser language (uk/ka/en)
   and renders translated text. `ScenarioStageHooks.SetUpUiStage` seeds
   `localStorage.app_language='en'` via `AddInitScriptAsync`. Any new UI stage code must do the
   same or locators break.
2. **Deployed bundle ≠ local source.** The S3 deployment may lag the local frontend. Verify
   selectors against the live DOM (probe with playwright-core +
   `~/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome`), not just local HTML.
3. **The S3 bundle is ~5 MB; first load is slow.** Keep `NAVIGATION_TIMEOUT_MS` generous
   (default 30 s); the 15 s default action timeout is fine after load.
4. **Stale locators exist:** `Ui/Components/ReservationCardComponent` targets old classes
   (`button.btn-cancel`, `button.btn-preorder`, `.details-line`) that the current card markup
   (`.actions button.card-action-btn`, `.button--primary|secondary|tertiary`, `.detail-text`)
   no longer has. `ul.reservation-list > li.card` and `.reservation-empty` still match. Fix as
   part of the B4 work that touches reservation cards.
5. **Greeting has no role suffix** — deployed waiter's dashboard greets "Hello, <name>" only.
6. Cleanup/pre-run sweep deletes leftover `AQA-Sample-*` records; user deletion via admin API can
   403 — cleanup is best-effort and logs warnings, never fails the run.
7. `dotnet test` vs `dotnet run -- --treenode-filter`: the suite runs via the Reqnroll/TUnit
   executable; filter syntax is TUnit treenode, e.g. `"/*/*/*/*[Category=smoke]"`. Tags become
   categories (`@direction1` → `Category=direction1`).
8. Playwright browsers are already installed under `~/.cache/ms-playwright` (chromium-1243);
   `PlaywrightInstaller` handles it otherwise. OS is NixOS — Playwright prints a "not officially
   supported" BEWARE line; harmless.

## 6. Definition of done (whole homework)

- Baseline green: 13/13 `@smoke` (achieved in Phase A after locale + greeting fixes).
- New features for Direction 1 (L1–L3) and Direction 2 gaps (L1 boundaries, L2, L3) with
  `@direction1/@direction2/@levelN` tags, positive + negative, unique data, cleanup registered.
- README: chosen direction + approach, how to run/filter, report locations, and the documented
  choices from §3 for undefined behaviours.
- Star task: Report Portal reporting + cloud pipeline (see phase C brief).
