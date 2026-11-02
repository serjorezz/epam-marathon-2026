---
name: code-review
description: 'How to perform a comprehensive, structured code review across Angular frontend, .NET AWS Lambda backend, Terraform infrastructure, and Reqnroll/Playwright AQA tests. Covers correctness, security, API contracts, design fidelity, infrastructure safety, and CI readiness.'
---
# Structured Multi-Stack Code Review (`code-review`)

Use this skill when asked to review a pull request, audit uncommitted or recent changes, or evaluate code quality across the repository (`frontend/`, `backend/`, `infra/`, `aqa/`, and `.github/workflows/`).

## 1. Gather Context & Scope the Diff

1. **Identify Changed Files**:
   - Run `git status -s`, `git diff`, or `git diff main...HEAD --stat` (or use the GitHub MCP `pull_request_read` tool for remote PRs) to list all modified, added, or deleted files.
2. **Check Hidden / Ignored State**:
   - Run `git ls-files -v | grep -v '^H'` to detect any `skip-worktree` (`S`) or `assume-unchanged` (`h`) files where local disk contents diverge from what git commits and CI sees.

## 2. Layer-by-Layer Review Checklist

### A. Frontend (`frontend/restaurant-frontend-app` — Angular 19 / TypeScript / SCSS)
- **Strict Type Safety & Clean Imports**:
  - Check for unused imports (e.g., `HttpErrorResponse` or unused RxJS operators) that will fail `@typescript-eslint/no-unused-vars` in CI (`npm run lint`).
  - Verify both `npx tsc -p tsconfig.app.json --noEmit` and `npx tsc -p tsconfig.spec.json --noEmit` pass cleanly.
- **Component & State Lifecycle**:
  - Ensure subscriptions are cleaned up (`takeUntilDestroyed`, `AsyncPipe`, or signals) and error states surface actionable user feedback via toast/alert services.
- **UI & Styling Fidelity**:
  - Verify responsive grid layouts, flex alignment (`align-items: center`), accessible contrast, semantic HTML, and `alt` attributes on `<img>` tags.
  - Confirm external links opened with `target="_blank"` include `rel="noopener noreferrer"` when appropriate.

### B. Backend (`backend/restaurant-backend-app` — .NET 10 AWS Lambdas & Syndicate)
- **API Contracts & Routing**:
  - Verify request/response DTOs, HTTP status codes (`200`, `201`, `400`, `401`, `403`, `404`), and route registrations in `RouteRegistry.cs` match `swagger-endpoints.yaml` and frontend expectations.
- **DynamoDB & Data Access**:
  - Avoid unbounded table scans in hot paths where GSIs exist (`GSI_LocationId`, `GSI_UserId`, `GSI_WaiterId`, `GSI_ReservationId`, `GSI_ByTableId`).
  - Validate input parameters (dates, time slots, guest counts, table capacities) before persisting.
- **Security & Auth**:
  - Ensure Cognito claims and role checks (`Customer`, `Waiter`, `Admin`) are enforced and no credentials or secrets are hardcoded.

### C. Infrastructure (`infra/terraform` & AWS Syndicate)
- **Terraform Hygiene**:
  - Run `terraform fmt -check -recursive` and `terraform validate`.
  - Verify S3 bucket policies, least-privilege IAM policies, encryption at rest, and state locking (`use_lockfile = true`).
  - Confirm no orphaned or duplicate resources exist (e.g., redundant S3 buckets when serving via GitHub Pages).
- **Syndicate Configuration**:
  - Ensure `syndicate.yml` and `syndicate_aliases.yml` match actual DynamoDB table/index names and S3 bucket names in the target AWS account.

### D. AQA (`aqa/restaurant-aqa-framework` — .NET 10 / Reqnroll / TUnit / Playwright)
- **Static Analysis & Formatting**:
  - Run `dotnet format --verify-no-changes --verbosity diagnostic` and `dotnet build --configuration Release -warnaserror`.
  - Ensure Page Objects use resilient locators and step definitions remain decoupled from raw DOM selectors.

## 3. Report Findings Clearly

Structure your review output by severity:
1. **Blocking / Bugs (Must Fix)**: Security issues, broken builds/lints, runtime exceptions, data corruption, or broken CI workflows.
2. **Warnings / Design & Contract Drift (Should Fix)**: Deviations from Figma specs, missing edge-case handling, or suboptimal queries.
3. **Nitpicks / Polish (Optional)**: Naming, minor refactoring, or documentation improvements.
Always link directly to the relevant file and line range (`[filename](file:///abs/path#L10-L20)`).
