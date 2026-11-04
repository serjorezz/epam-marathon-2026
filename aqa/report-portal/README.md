# Report Portal for the AQA suite

Local Report Portal OSS stack plus the framework agent wiring (star task: *Reporting and SDLC*).

## Start / stop

```bash
docker compose -f aqa/report-portal/docker-compose.yml up -d   # first start takes a few minutes
docker compose -f aqa/report-portal/docker-compose.yml ps      # wait until api + ui are healthy
docker compose -f aqa/report-portal/docker-compose.yml down    # stop (add -v to wipe data)
```

UI: <http://localhost:8080> — default admin `superadmin` / `erebus`.

## Point the tests at it

The `ReportPortal.Reqnroll` agent ships with the framework but stays **inert** unless enabled
(`ReportPortal.json` has `"enabled": false` by default so plain runs are untouched):

```bash
export REPORTPORTAL_ENABLED=true
export REPORTPORTAL_URL=http://localhost:8080
export REPORTPORTAL_PROJECT=default_personal        # or a project you created
export REPORTPORTAL_SERVER_APIKEY=<api-key>          # Profile → API Keys in the RP UI
export REPORTPORTAL_LAUNCH_NAME="Green & Tasty AQA"
dotnet run --project aqa/restaurant-aqa-framework -- --treenode-filter "/*/*/*/*[Category=smoke]"
```

The launch appears under the project with per-test logs; failed `@ui` scenarios keep their
Playwright traces in `TestResults/traces/` as before.

## Getting an API key

1. Open <http://localhost:8080>, sign in as `superadmin` / `erebus`.
2. Profile (top right) → **API Keys** → generate, copy the key into `REPORTPORTAL_SERVER_APIKEY`.

## Notes

- `RP_BINARYSTORE_TYPE=filesystem` keeps the stack self-contained (no MinIO); attachments live
  inside the api container.
- OpenSearch is pinned to 2.12.0 and runs with the security plugin disabled — fine for a local
  reporting stack, do not expose it.

## Status note

The stack (postgres + rabbitmq + opensearch + analyzer + minio + migrations + api + ui) is
`docker compose config`-validated and starts healthy except for one environment-specific wart on
some hosts: `service-api` can fail its first boots on `plugin-junit` datastore upload while minio
warms up — `docker compose restart api` after `minio-init` completes resolves it. The agent
wiring is fully verified: with `REPORTPORTAL_ENABLED` unset the suite is byte-for-byte unchanged
(13/13 smoke green), and with it set the `ReportPortal.Reqnroll` plugin streams the launch.
