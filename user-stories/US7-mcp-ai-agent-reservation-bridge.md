# US7_Model Context Protocol (MCP) Server & External AI Agent Reservation Bridge

| Field | Value |
| --- | --- |
| **Epic** | External Integrations / AI Agent Interoperability & Model Context Protocol (MCP) |
| **US name** | Model Context Protocol (MCP) Server & External AI Agent Reservation Bridge |
| **Role** | External AI Assistant / Dining Customer / AI Agent Developer |
| **Description** | As a dining customer or AI agent developer using an external AI assistant (such as the Google Gemini App, Claude Desktop, Cursor, or an MCP-compliant client), I want to connect to the restaurant's Model Context Protocol (MCP) server and OpenAPI action layer, so that I can check real-time table availability and book dining reservations directly through natural language conversations in external AI platforms. |

### Pre-conditions:
- Restaurant backend services (tables query, available slots, and reservation creation) are operational.
- The MCP Server & API Bridge module is deployed or running locally with valid configuration.
- The external AI assistant supports MCP (stdio or SSE) or OpenAPI 3.0 actions (e.g. Gemini Extensions, Custom GPT Actions).

---

### Acceptance Criteria (AC):

1. **Model Context Protocol (MCP) Tools Definition**:
   - The MCP server exposes standard `tools/list` and `tools/call` protocol handlers via `@modelcontextprotocol/sdk`.
   - The server registers two core dining tools matching the restaurant booking domain:
     - `check_availability`:
       - Accepts `date` (string, `YYYY-MM-DD` or ISO date) and `guests_count` (integer, 1–20).
       - Returns a list of available dining time slots and available table counts.
     - `create_reservation`:
       - Accepts `name` (string), `phone` (string), `guests_count` (integer), `datetime` (ISO 8601 string), and optional `special_requests` (string).
       - Allocates a matching available table and creates a confirmed booking record in the database.
       - Returns the reservation confirmation reference, table identifier, party size, and timestamps.

2. **Standardized OpenAPI 3.0 / Swagger JSON Specification**:
   - The server provides an OpenAPI 3.0.3 compliant specification at `GET /openapi.json` and `GET /swagger.json`.
   - The specification details request schemas, response models, parameter validation constraints, and security definitions for `check_availability` and `create_reservation`.
   - The specification is directly importable by OpenAPI-compliant action platforms, including Google Gemini Custom Extensions and ChatGPT Actions.

3. **Gemini Extension & Action Manifests**:
   - The server serves a standardized manifest at `GET /manifest.json` conforming to AI plugin/extension specifications.
   - Companion configuration templates (`gemini-extension.json` and `mcp-config.json`) provide ready-to-use snippets for the Gemini App, Claude Desktop, and Cursor settings.

4. **API Key & Bearer Token Security Enforcement**:
   - External requests to action endpoints (`POST /api/check-availability`, `POST /api/create-reservation`, and `GET /sse`) require valid authentication.
   - Authentication supports both `x-api-key: <key>` and `Authorization: Bearer <key>` headers, as well as `?api_key=<key>` query parameters for event streams.
   - Requests with missing or invalid keys are rejected with HTTP 401 Unauthorized using timing-safe credential verification.

5. **Input Sanitization & Strict Schema Validation**:
   - Incoming payloads are strictly validated using Zod schemas:
     - Strips HTML tags, script elements, null bytes, and SQL injection patterns.
     - Validates date formats and rejects bookings with dates in the past.
     - Enforces party size boundaries (1 to 20 guests).
     - Validates international phone number formatting.
   - Validation failures return structured HTTP 400 Bad Request responses with detailed field-level error messages.

6. **Resilient Backend Integration & Fallback Handling**:
   - The bridge integrates with the live restaurant API Gateway (`/available-tables`, `/reservations`, and Cognito authentication).
   - In offline or mock testing environments, resilient fallback logic ensures tests and client handshakes execute gracefully without unhandled exceptions.

7. **Documentation & Local Testing Instructions**:
   - Detailed instructions are provided in `mcp-server/README.md` and the root `README.md` explaining how to start the server in HTTP and stdio modes, test with cURL, and connect external AI clients.
