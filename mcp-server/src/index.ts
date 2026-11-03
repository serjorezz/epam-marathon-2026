#!/usr/bin/env node
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createMcpServer } from './mcp.js';
import { createExpressApp } from './server.js';
import { config } from './config.js';
import { ReservationBridge } from './services/reservation-bridge.js';

async function main() {
  const args = process.argv.slice(2);
  const isStdioMode = args.includes('--stdio');

  const bridge = new ReservationBridge();

  if (isStdioMode) {
    // Run as stdio MCP server (for Claude Desktop, Cursor, Gemini CLI)
    const server = createMcpServer(bridge);
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('[Green & Tasty MCP] Running in stdio mode');
  } else {
    // Run as HTTP / OpenAPI / SSE server
    const app = createExpressApp(bridge);
    app.listen(config.port, config.host, () => {
      console.log(`
======================================================================
  🌿 Green & Tasty — Restaurant Reservation MCP Server & API Bridge
======================================================================
  Mode:           HTTP / OpenAPI / SSE Bridge
  Listening on:   http://${config.host}:${config.port}
  Base URL:       ${config.serverBaseUrl}
  Backend URL:    ${config.backendUrl}
  Auth API Key:   ${config.mcpApiKey}
----------------------------------------------------------------------
  Endpoints:
    • Health:           GET  http://localhost:${config.port}/health
    • Manifest:         GET  http://localhost:${config.port}/manifest.json
    • Gemini Extension: GET  http://localhost:${config.port}/gemini-extension.json
    • OpenAPI 3.0:      GET  http://localhost:${config.port}/openapi.json
    • Check Table:      POST http://localhost:${config.port}/api/check-availability
    • Book Table:       POST http://localhost:${config.port}/api/create-reservation
    • MCP SSE Stream:   GET  http://localhost:${config.port}/sse
======================================================================
      `);
    });
  }
}

main().catch((err) => {
  console.error('Fatal error starting Green & Tasty MCP Server:', err);
  process.exit(1);
});
