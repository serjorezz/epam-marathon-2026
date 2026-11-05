# Security Policy

## Scope

This policy covers the Green & Tasty project stack:

| Component | Path | Notes |
| :--- | :--- | :--- |
| Frontend (Angular SPA) | `frontend/restaurant-frontend-app/` | Served via S3 + GitHub Pages (`green-tasty.devs.surf`) |
| Backend (AWS Lambda, .NET) | `backend/restaurant-backend-app/` | API Gateway + Cognito + DynamoDB |
| MCP Server & AI Bridge | `mcp-server/` | MCP (stdio/SSE) + OpenAPI 3.0 action bridge |
| Infrastructure | `infra/terraform/`, `.github/workflows/` | Terraform, GitHub Actions OIDC |
| Test Automation | `aqa/restaurant-aqa-framework/` | Runs against the deployed environment |

## Supported Versions

Only the latest state of the `main` branch receives security fixes. The deployed demo environment tracks `main` automatically via CI/CD. There are no versioned releases.

## Reporting a Vulnerability

**Please do not open a public issue for security vulnerabilities.**

- **Preferred:** [GitHub Security Advisories](https://github.com/serjorezz/epam-marathon-2026/security/advisories/new) (private report).
- **Email:** serjorez@proton.me with the subject `Security: Green & Tasty`.

You can expect an acknowledgement within **72 hours**. If the report is accepted, a fix will be developed on a private branch and disclosed via a GitHub Security Advisory after release. If declined, you will receive the reasoning.

## Security Measures in Place

- **Authentication & Authorization:** AWS Cognito-backed JWT authentication; backend validates tokens (`Microsoft.IdentityModel.JsonWebTokens`); role-based routes (customer/waiter/admin guards on the frontend).
- **MCP / AI Bridge hardening:**
  - API-key authentication (`x-api-key`, `Authorization: Bearer`, `?api_key=` for SSE) with **timing-safe** credential comparison.
  - Strict Zod schema validation (date-not-in-past, party size 1–20, phone format, ISO 8601).
  - Input sanitization stripping HTML/script tags, null bytes, and SQL-injection patterns.
  - 15-second timeouts on all outbound backend calls; graceful mock fallback when the backend is unreachable.
  - Docker image runs as a **non-root** user with a healthcheck.
- **CI/CD:** OIDC federation to AWS (no long-lived cloud keys in GitHub); secrets via GitHub Secrets; credential files (`credentials.*`, `.env`) are gitignored.
- **Transport:** HTTPS everywhere via GitHub Pages / the custom domain.

## Known Considerations (Demo Environment)

This repository is a **marathon/demo project**. The following are intentional for demo purposes but **must be changed before any production use**:

- Test account credentials are documented in `README.md` and used by the AQA framework.
- `mcp-server` ships a default `MCP_API_KEY` (`gt-agent-secret-key-2026`) and default backend service-account credentials as fallbacks — always override via environment variables.
- The MCP bridge sets `Access-Control-Allow-Origin: *` to allow external AI clients; restrict this to known origins for production deployments.

## Responsible Disclosure

- Do not access, modify, or delete data belonging to other users of the demo environment.
- Do not run high-volume load/security scanning tools against the deployed environment (`green-tasty.devs.surf`, the API Gateway, or the MCP bridge) — it is a shared demo with serverless cost implications.
- Low-impact verification (single requests, obvious auth checks) is fine; report what you find.
