---
name: github-workflow-troubleshooting
description: 'How to diagnose and fix failing GitHub Actions workflows (.github/workflows/*.yml), including AWS OIDC authentication (thumbprints and numeric repo ID sub claims), git skip-worktree config mismatches, .NET analyzer/format gates, Angular ESLint/TypeScript checks, Terraform S3 state init, AWS Syndicate deployments, and GitHub Pages publishing.'
---
# Diagnosing & Fixing GitHub Actions Workflows (`github-workflow-troubleshooting`)

Use this skill whenever GitHub Actions workflows (`PR`, `Deploy`, `Terraform`, `AQA Quality`, `AQA Tests`) are failing (red) and need to be diagnosed and fixed end-to-end.

## 1. Inspect Workflow Runs, Jobs & Annotations

1. **List Recent Workflow Runs**:
   ```bash
   curl -s -H "Accept: application/vnd.github+json" \
     "https://api.github.com/repos/<owner>/<repo>/actions/runs?per_page=10"
   ```
2. **Drill Into Failing Jobs & Steps**:
   - Query `https://api.github.com/repos/<owner>/<repo>/actions/runs/<run_id>/jobs` to identify the exact job ID and failing step name (`Configure AWS credentials`, `Lint`, `Build`, `Terraform init`, `Syndicate build`, etc.).
   - Query `https://api.github.com/repos/<owner>/<repo>/check-runs/<job_id>/annotations` to read the error messages and warnings even without admin log download tokens.
3. **Check AWS CloudTrail for Cloud Auth / Deployment Errors**:
   - When an AWS step fails in CI, inspect the exact API call and error message in CloudTrail:
     ```bash
     aws cloudtrail lookup-events \
       --lookup-attributes AttributeKey=EventName,AttributeValue=AssumeRoleWithWebIdentity \
       --max-results 5 --output json
     ```

## 2. Root Causes & Proven Fixes

### A. AWS OIDC `Configure AWS credentials` Failures (`Not authorized to perform sts:AssumeRoleWithWebIdentity`)
1. **Missing OIDC Provider or Role**:
   - Ensure the IAM OIDC provider `arn:aws:iam::<ACCOUNT_ID>:oidc-provider/token.actions.githubusercontent.com` exists with client ID `sts.amazonaws.com`.
2. **Certificate Chain / Thumbprint Rotation**:
   - `token.actions.githubusercontent.com` serves certificates signed by Let's Encrypt (`ISRG Root X1`) in addition to legacy CAs. Fetch the live certificate chain thumbprints and register them:
     ```bash
     openssl s_client -servername token.actions.githubusercontent.com -showcerts \
       -connect token.actions.githubusercontent.com:443 < /dev/null 2>/dev/null \
       | awk '/BEGIN CERTIFICATE/,/END CERTIFICATE/{ if(/BEGIN CERTIFICATE/){a++}; out="/tmp/cert"a".pem"; print >out}'
     for f in /tmp/cert*.pem; do openssl x509 -in "$f" -noout -fingerprint -sha1; done
     aws iam update-open-id-connect-provider-thumbprint \
       --open-id-connect-provider-arn arn:aws:iam::<ACCOUNT_ID>:oidc-provider/token.actions.githubusercontent.com \
       --thumbprint-list 06d927fecd0a84aeba28aad1d808139470fe95c3 2d74d6dfd96eea55ad7baafa0d3c6552b2dadc37 ab9d0263244dd0326eb67015705a667e79cfe998 cabd2a79a1076a31f21d253635cb039d4329a5e8 6938fd4d98bab03faadb97b34396831e3780aea1
     ```
3. **GitHub OIDC `sub` Claim Format with Numeric IDs**:
   - GitHub Actions OIDC tokens may emit `sub` claims including numeric owner and repository IDs (`repo:<owner>@<owner_id>/<repo>@<repo_id>:ref:refs/heads/main`).
   - Always include both patterns in the IAM Role trust policy `StringLike` condition:
     ```json
     "token.actions.githubusercontent.com:sub": [
       "repo:<owner>/<repo>:*",
       "repo:<owner>@*/<repo>@*:*"
     ]
     ```

### B. `Terraform init` or `Syndicate build` Failing in CI While Working Locally (`skip-worktree` Trap)
- **Symptom**: Local files (`infra/terraform/backend.tf`, `syndicate.yml`, `syndicate_aliases.yml`) have valid AWS account IDs, and `git status` is clean, yet CI fails on `Terraform init` or `Syndicate build`.
- **Diagnosis**: Run `git ls-files -v | grep -v '^H'` and `git show HEAD:<path>`. Files marked with `S` (`skip-worktree`) hide local changes from git, leaving placeholder strings like `YOUR_AWS_ACCOUNT_ID` committed in the remote repo.
- **Fix**:
  ```bash
  git update-index --no-skip-worktree \
    infra/terraform/backend.tf \
    backend/restaurant-backend-app/.syndicate-config-restaurant-backend-app/syndicate.yml \
    backend/restaurant-backend-app/.syndicate-config-restaurant-backend-app/syndicate_aliases.yml
  git add -u && git commit -m "fix(ci): commit real AWS account IDs in config files"
  ```

### C. `AQA Quality` Failing on `.NET` Format or Analyzer Warnings-as-Errors
- **Symptom**: `dotnet format --verify-no-changes` or `dotnet build --configuration Release -warnaserror` fails on test method underscore naming (`CA1707`) or other code-analysis rules.
- **Fix**:
  1. Run `dotnet format` locally inside `aqa/restaurant-aqa-framework`.
  2. Configure `<NoWarn>$(NoWarn);CA1707;CA1031;CA1305;CA1812;CA1852;CA2007</NoWarn>` in `restaurant-aqa-framework.csproj` so legitimate BDD/Reqnroll test method names pass `-warnaserror`.

### D. `PR` (Frontend) Failing on Lint, Type-Check, or GitHub Pages Deployment
- **Symptom**: `npm run lint` fails on unused imports (`@typescript-eslint/no-unused-vars`), or YAML syntax errors block workflow startup.
- **Fix**:
  1. Run `npm run lint`, `npx tsc -p tsconfig.app.json --noEmit`, and `npx tsc -p tsconfig.spec.json --noEmit` locally in `frontend/restaurant-frontend-app` before pushing.
  2. Ensure `permissions` in `.github/workflows/pr.yml` includes `id-token: write`, `contents: write`, and `pages: write`.
  3. Use `peaceiris/actions-gh-pages@v4` with `publish_dir: frontend/restaurant-frontend-app/dist/restaurant-frontend-app/browser` and `cname: green-tasty.devs.surf` so every push to `main` updates both S3 and GitHub Pages.
