# Green & Tasty — Model Context Protocol (MCP) Server & AI Action Bridge

Lightweight, production-ready **Model Context Protocol (MCP)** server and **OpenAPI 3.0 / Gemini Extension** bridge that empowers external AI assistants (such as the **Google Gemini App**, **Claude Desktop**, **Cursor**, or custom MCP agents) to interact with the Green & Tasty restaurant reservation platform.

---

## 🌟 Capabilities & Exposed Tools

The bridge defines two core reservation actions wrapping the restaurant's backend reservation services and DynamoDB storage:

| Tool / Action | Method & Endpoint | Description | Parameters |
| :--- | :--- | :--- | :--- |
| `check_availability` | `POST /api/check-availability` | Queries available tables and dining time slots for a party on a given date. | `date` (string, `YYYY-MM-DD`), `guests_count` (integer, 1–20) |
| `create_reservation` | `POST /api/create-reservation` | Books a confirmed reservation in the database with customer contact details. | `name` (string), `phone` (string), `guests_count` (integer), `datetime` (ISO 8601 string), `special_requests` (optional string) |

---

## 🔐 Security & Authentication

- **API Key Authentication**: Incoming requests from external AI clients must supply the secret key in the request header or query parameter:
  - Header: `x-api-key: <YOUR_MCP_API_KEY>`
  - Header: `Authorization: Bearer <YOUR_MCP_API_KEY>`
  - Query parameter (for SSE streams): `?api_key=<YOUR_MCP_API_KEY>`
- **Timing-Safe Comparison**: Prevents timing-attack vectors on secret validation.
- **Input Sanitization & Validation**:
  - HTML, script tags, null bytes, and SQL injection patterns are stripped automatically.
  - Strict **Zod** schemas enforce date constraints (no past bookings), valid international phone formatting, sensible guest limits (1–20), and ISO 8601 timestamps.

---

## 🚀 Quick Start & Local Testing

### 1. Installation

```bash
cd mcp-server
npm install
npm run build
```

### 2. Configuration (`.env`)

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Default configuration values:

```env
PORT=3000
HOST=0.0.0.0
SERVER_BASE_URL=http://localhost:3000
MCP_API_KEY=gt-agent-secret-key-2026
RESTAURANT_BACKEND_URL=https://pin0yvpmgk.execute-api.us-east-1.amazonaws.com/develop
COGNITO_CLIENT_ID=rv8ltk3pcfuvtr8p6snv3fct5
CUSTOMER_EMAIL=customer@green-tasty.com
CUSTOMER_PASSWORD=Customer12345!
MOCK_FALLBACK=true
```

### 3. Run the Server

- **Start HTTP / OpenAPI / SSE server (default on port 3000):**
  ```bash
  npm start
  ```

- **Start in stdio mode (for Claude Desktop or Cursor local process execution):**
  ```bash
  npm run start:stdio
  ```

- **Run Automated Unit & Integration Tests:**
  ```bash
  npm test
  ```

---

## 🧪 Testing with cURL

### Check Server Health & Discovery Metadata

```bash
# Health check (public)
curl -s http://localhost:3000/health

# Gemini Extension Manifest
curl -s http://localhost:3000/manifest.json

# OpenAPI 3.0.3 Specification
curl -s http://localhost:3000/openapi.json
```

### Test `check_availability`

```bash
curl -X POST http://localhost:3000/api/check-availability \
  -H "Content-Type: application/json" \
  -H "x-api-key: gt-agent-secret-key-2026" \
  -d '{
    "date": "2026-11-10",
    "guests_count": 2
  }'
```

**Sample Response:**

```json
{
  "date": "2026-11-10",
  "guests_count": 2,
  "available": true,
  "available_time_slots": ["12:00", "13:30", "15:00", "17:00", "18:00", "19:30", "20:00", "21:00"],
  "available_tables_count": 5,
  "message": "Tables are available for 2 guest(s) on 2026-11-10 at: 12:00, 13:30, 15:00, 17:00, 18:00, 19:30, 20:00, 21:00."
}
```

### Test `create_reservation`

```bash
curl -X POST http://localhost:3000/api/create-reservation \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer gt-agent-secret-key-2026" \
  -d '{
    "name": "Mariam Lomidze",
    "phone": "+995 555 123 456",
    "guests_count": 2,
    "datetime": "2026-11-10T18:00:00Z",
    "special_requests": "Window table in the conservatory"
  }'
```

**Sample Response:**

```json
{
  "success": true,
  "reservationId": "res-109283-abc",
  "tableId": "table-b2",
  "locationId": "loc-baratashvili",
  "startTime": "2026-11-10T18:00:00.000Z",
  "endTime": "2026-11-10T19:30:00.000Z",
  "guestsCount": 2,
  "name": "Mariam Lomidze",
  "phone": "+995 555 123 456",
  "specialRequests": "Window table in the conservatory",
  "message": "Reservation successfully confirmed for Mariam Lomidze (2 guests) on 2026-11-10 at 18:00 UTC. Reference #res-109283-abc."
}
```

---

## 🤖 Connecting to External AI Clients

### 1. Google Gemini App (Gemini Extensions)

1. Ensure your server is publicly accessible or exposed via a tunnel (e.g. `ngrok http 3000` or hosted instance).
2. In the **Gemini App / Developer Studio**, go to **Extensions / Actions** > **Add Custom Extension**.
3. Point the OpenAPI URL to:
   ```text
   https://<your-public-host>/openapi.json
   ```
4. Set Authentication to **API Key**:
   - Header Name: `x-api-key`
   - Key: `gt-agent-secret-key-2026`
5. The extension will automatically detect the `check_availability` and `create_reservation` tools. Gemini users can now ask:
   > *"Can you check if Green & Tasty has a table for 4 people tomorrow at 7 PM?"*  
   > *"Book a table for 2 under Mariam Lomidze on Friday at 18:00."*

### 2. Claude Desktop / Cursor (Local MCP Stdio)

Add the following to your `claude_desktop_config.json` (or Cursor MCP settings):

```json
{
  "mcpServers": {
    "green-tasty-reservations": {
      "command": "node",
      "args": ["/ABSOLUTE/PATH/TO/epam-marathon-2026/mcp-server/dist/index.js", "--stdio"],
      "env": {
        "RESTAURANT_BACKEND_URL": "https://pin0yvpmgk.execute-api.us-east-1.amazonaws.com/develop",
        "MCP_API_KEY": "gt-agent-secret-key-2026",
        "CUSTOMER_EMAIL": "customer@green-tasty.com",
        "CUSTOMER_PASSWORD": "Customer12345!"
      }
    }
  }
}
```

### 3. Remote MCP Clients (Server-Sent Events / SSE)

Connect via SSE URL:
```text
http://<host>:3000/sse?api_key=gt-agent-secret-key-2026
```
Or via HTTP headers:
```text
GET /sse
x-api-key: gt-agent-secret-key-2026
```
All messages and tool calls are handled according to the official Model Context Protocol JSON-RPC specification.
