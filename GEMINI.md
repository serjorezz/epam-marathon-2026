# Project Guidelines for Gemini & Zed IDE — Green & Tasty (EPAM IT Marathon 6.0)

This file is the central source of truth and instructions for AI assistants (Gemini, Zed AI, and Agentic tools) working in this repository.

---

## 1. Repository & Architecture Overview

**Green & Tasty** is a cloud-native full-stack restaurant reservation and pre-ordering platform featuring a multi-track engineering ecosystem:

```
epam-marathon-2026/
├── frontend/restaurant-frontend-app/   # Angular 22 client SPA
├── backend/restaurant-backend-app/     # .NET 10 C# Serverless Lambdas (AWS Syndicate)
├── infra/terraform/                    # Terraform IaC (Cognito, S3, CloudFront, Alarms)
├── aqa/restaurant-aqa-framework/       # .NET 10 Reqnroll (BDD) + Playwright + Screenplay
├── homework/                           # Homework requirements, specs & Figma design assets
└── .github/workflows/                  # GitHub Actions CI/CD pipelines
```

### Key Domain & Homework Context
* **Core Flow:** Group Pre-Order. An **Owner** reserves a table and invites guests via an invite link (`/join/:token`). Guests pick dishes. The Owner consolidates all submitted items on `/reservations/:id/group-order` and submits a unified pre-order to the kitchen (`SubmittedByCustomer`).
* **Source of Truth for API Contracts:** `backend/restaurant-backend-app/docs/ApiRoutes.md` and `RouteRegistry.cs` win over frontend interfaces when discrepancies occur.
* **Homework Documentation:** Detailed requirements for all tracks are located in [`homework/ALL_IN_ONE_HOMEWORK.md`](homework/ALL_IN_ONE_HOMEWORK.md).

---

## 2. Frontend Development (`frontend/restaurant-frontend-app/`)

### 2.1 Quick Start & Environment
```bash
cd frontend/restaurant-frontend-app
npm ci                   # Lockfile is authoritative; DO NOT use npm install
npm start                # Dev server at http://localhost:4200 (?demo for mock login)
npm run test:hw          # Run homework-specific Karma/Jasmine tests
```
* **Development Config:** `npm start` runs against `environment.development.ts`. For Levels 1–2, the built-in mock interceptor (`groupOrdersMockInterceptor`) intercepts `demo-reservation` calls. No live backend needed.
* **Production Build:** Requires `BACKEND_URL`:
  ```bash
  BACKEND_URL=https://<api-gateway-id>.execute-api.<region>.amazonaws.com/develop npm run build
  ```
  `prebuild` generates `environment.production.ts`. `postbuild` verifies no placeholder leaks. Never commit `environment.production.ts`.

### 2.2 File Structure & Placement
```
src/app/
├── auth/                       # Authentication, guards, token interceptor
├── components/<domain>/        # Feature components grouped by domain (e.g., group-orders/)
├── core/                       # App-wide singleton blocks & layouts
├── models/<domain>/            # Domain interfaces (one interface file per concern)
├── pages/<name>-page/          # Route-level page components
├── services/<domain>/          # HTTP services
└── shared/                     # Reusable utilities, custom components, mocks, styles
```
* **Decision Rules:**
  - Route screens go to `pages/<name>-page/` (`*.component.ts`).
  - Feature components go to `components/<domain>/`.
  - Reusable dumb components go to `shared/custom-components/<name>/`.
  - HTTP client calls go to `services/<domain>/` (`*.service.ts`).
  - Shared domain interfaces go to `models/<domain>/` (`*.model.ts`). Never declare an interface inside a component file.
  - Constants go to `shared/constants/` or a local `constants.ts`.
  - Pure functions / helpers go to `shared/helpers/`.

### 2.3 Angular & TypeScript Conventions
* **Standalone components only:** No `NgModules`. Always declare dependencies in `imports: []`. Clean up unused imports (Angular warns `NG8113`).
* **`inject()` function:** Always use `inject()` instead of constructor injection (`@angular-eslint/prefer-inject` is an error). Remember to import `inject` from `@angular/core`.
* **Signals & Reactivity:** Use `signal()`, `computed()`, `input()`, and `output()` for state and component APIs.
* **Strict TypeScript:** No `any`. No variable names shorter than 3 characters (except standard loop indices `i`, `j`).
* **Styling (SCSS):** Use `@use`, never `@import`. Use namespaced color helpers (e.g., `@use 'app/shared/styles/abstracts/colors' as color;` and `color.adjust(...)`).
* **Relative Imports:** Count `../` depth carefully; avoid broken relative paths.
* **ChangeDetectionStrategy:** `ChangeDetectionStrategy.Eager` is standard across existing components.
* **Lifecycle & Memory:** Always unsubscribe from observables or use `takeUntilDestroyed()`.
* **Accessibility:** Any element with `(click)` must have keyboard parity (`(keydown.enter)` + `tabindex`) or use a semantic `<button>`.

### 2.4 Testing & Verification Gates
Before opening a PR or submitting work:
```bash
cd frontend/restaurant-frontend-app
npx tsc -p tsconfig.app.json  --noEmit          # Verify app compilation
npx tsc -p tsconfig.spec.json --noEmit          # Verify test compilation
BACKEND_URL=https://example.com npm run build   # Must output "Bundle check passed"
npm run test:hw                                 # All homework tests must be green
```

---

## 3. Backend Development (`backend/restaurant-backend-app/`)

### 3.1 Stack & Deployment
* **Framework:** .NET 10 (C#) AWS Serverless Lambdas (`api-handler`, `reports-handler`, `report-sender`).
* **Storage & Infrastructure:** Amazon DynamoDB, S3, Cognito, API Gateway.
* **Deployment Tool:** AWS Syndicate (`syndicate deploy --bundle_name <name>`).
* **Note:** Backend cannot be run standalone locally without AWS/mock services. Testing is performed via integration/unit tests and deployed AWS stages.

### 3.2 Key Group Pre-Order Endpoints
* `GET /guest/groups/{groupReservationId}/sessions` (Owner only): Get participant sessions and carts.
* `GET /reservations/{reservationId}/guest-session-id`: Retrieve Owner's own guest session ID.
* `POST /group-reservations/{groupReservationId}/submit`: Consolidate submitted carts and submit the group pre-order.
* `DELETE /guest/groups/{groupReservationId}/sessions/{guestSessionId}` (Owner only): Remove a participant session.

---

## 4. Test Automation / AQA (`aqa/restaurant-aqa-framework/`)

### 4.1 Architecture & Layers (Screenplay + Reqnroll BDD)
```
aqa/restaurant-aqa-framework/
├── Features/             # Gherkin .feature files (pure declarative business language)
├── StepDefinitions/      # Thin glue steps calling Screenplay tasks and questions
├── Screenplay/           # Actor, Abilities (BrowseTheWeb, CallTheApi, RememberThings)
│   ├── Tasks/            # Actions performed by Actor (ITask)
│   └── Questions/        # State inquiries asked by Actor (IQuestion<T>)
├── Ui/                   # Page objects & components (locators & UI actions; never assert)
├── Api/                  # REST clients, DTOs, Seeding/
└── Hooks/                # Lifecycle hooks, cleanup tracking, Playwright browser hooks
```

### 4.2 AQA Conventions
* **Declarative Gherkin:** Describe user intent and observations, never implementation details (no raw URLs, HTTP verbs, status codes, selectors, or button IDs).
* **Personas:** Use explicit personas (`visitor`, `guest`, `customer`, `waiter`, `manager`).
* **Step Definitions:** Keep them thin. A step delegates to `Actor.AttemptsToAsync(...)` or `Actor.AsksForAsync(...)`. Steps never instantiate page objects or API clients directly.
* **State Management:** Share state across steps via Actor memory (`Remember(value)` / `Recall<T>()`), never static variables.
* **Test Isolation & Cleanup:** All entities created during test runs must prefix names with `AQA-Sample-` and register with `CleanupScope` for automated disposal.
* **No Hard Sleep:** Rely on Playwright's auto-waiting and retry assertions (`Expect(...)`).
* **Linter & Verification:**
  ```bash
  cd aqa/restaurant-aqa-framework
  npx gherkin-lint -c .gherkin-lintrc "Features/*.feature"
  dotnet test
  ```

---

## 5. Critical Traps & Known Debt

* **Import Depths:** Relative path depth errors (`../` vs `../../`) are common source of breakage. Always check type-checking via `tsc --noEmit`.
* **Lockfile Authority:** Never run `npm install`. Always use `npm ci` to preserve package tree stability.
* **Bundle Budget:** 1 MB hard error budget on the frontend bundle (~84 kB headroom). Avoid importing entire heavy utility libraries into main chunk.
* **No Global Blind Find-and-Replace:** Never do regex-based text replacements of types or symbols across files; use AST/IDE renames to avoid modifying strings, URLs, or HTML labels.
* **Test Isolation:** Never depend on static variables or order-of-execution in tests.

---

## 6. AI Assistant & Zed IDE Optimization Guidelines

### 6.1 Context Efficiency & Prompting
* **Targeted Reads:** Point the assistant to relevant files (`/file` in Zed) rather than loading entire repositories into context.
* **Follow Established Patterns:** Look at existing tests or components in the domain before generating new files.
* **Smallest Reproducible Verification:** Compile with `tsc --noEmit` or `dotnet build` first, then run specific test filters before running entire test suites.

### 6.2 Zed IDE Integration
* **Project Root:** Open `/home/serjorez/Projects/epam-marathon-2026` as the root workspace in Zed.
* **Zed Assistant Slash Commands:**
  - Use `/file` to include specific domain files (e.g., `/file homework/ALL_IN_ONE_HOMEWORK.md`).
  - Use terminal integration for rapid test checking (`npm run test:hw` or `dotnet test`).
* **Format on Save:** Prettier is configured for frontend (`src/**/*.{ts,html,scss}`) and `.editorconfig` applies across C# and TypeScript code.
