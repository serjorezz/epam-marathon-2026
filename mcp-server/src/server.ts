import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { config } from './config.js';
import { requireApiKey } from './middleware/auth.js';
import { getOpenApiSpec } from './openapi.js';
import { ReservationBridge } from './services/reservation-bridge.js';
import { CheckAvailabilitySchema, CreateReservationSchema } from './schemas/reservation.schema.js';
import { createMcpServer } from './mcp.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createExpressApp(bridge: ReservationBridge = new ReservationBridge()): express.Express {
  const app = express();

  // Basic middleware
  app.use(express.json({ limit: '1mb' }));

  // CORS headers
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key');
    if (req.method === 'OPTIONS') {
      res.sendStatus(204);
      return;
    }
    next();
  });

  // Track active MCP SSE transports
  const sseTransports = new Map<string, SSEServerTransport>();

  // 1. Health check
  app.get('/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'green-tasty-mcp-server',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    });
  });

  // 2. Gemini Extension / Action Manifest
  app.get(['/manifest.json', '/.well-known/ai-plugin.json'], (_req: Request, res: Response) => {
    const manifestPath = path.resolve(__dirname, '../manifest.json');
    if (fs.existsSync(manifestPath)) {
      try {
        const raw = fs.readFileSync(manifestPath, 'utf-8');
        const parsed = JSON.parse(raw);
        // Ensure server URL matches current config
        parsed.api.url = `${config.serverBaseUrl}/openapi.json`;
        res.json(parsed);
        return;
      } catch (err) {
        console.error('Failed to read manifest.json:', err);
      }
    }

    res.json({
      schema_version: 'v1',
      name_for_model: 'green_tasty_reservations',
      name_for_human: 'Green & Tasty Table Reservations',
      description_for_model:
        "Assistant bridge for Green & Tasty restaurant reservations. Use 'check_availability' to check table availability. Use 'create_reservation' to book a table.",
      description_for_human: 'Check table availability and book dining reservations at Green & Tasty restaurant.',
      auth: {
        type: 'service_http',
        authorization_type: 'bearer',
      },
      api: {
        type: 'openapi',
        url: `${config.serverBaseUrl}/openapi.json`,
      },
      logo_url: 'https://green-tasty.devs.surf/assets/img/logo.svg',
      contact_email: 'reservations@green-tasty.com',
    });
  });

  // 3. Gemini Extension configuration template
  app.get('/gemini-extension.json', (_req: Request, res: Response) => {
    const extPath = path.resolve(__dirname, '../gemini-extension.json');
    if (fs.existsSync(extPath)) {
      try {
        const raw = fs.readFileSync(extPath, 'utf-8');
        const parsed = JSON.parse(raw);
        parsed.openApiSpecUrl = `${config.serverBaseUrl}/openapi.json`;
        res.json(parsed);
        return;
      } catch (err) {
        console.error('Failed to read gemini-extension.json:', err);
      }
    }
    res.sendStatus(404);
  });

  // 4. OpenAPI 3.0 / Swagger specification
  app.get(['/openapi.json', '/swagger.json'], (_req: Request, res: Response) => {
    res.json(getOpenApiSpec(config.serverBaseUrl));
  });

  // 5. REST Action: check_availability (protected with API key)
  app.post('/api/check-availability', requireApiKey, async (req: Request, res: Response) => {
    const parsed = CheckAvailabilitySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Validation failed for check_availability parameters',
        details: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
      });
      return;
    }

    try {
      const result = await bridge.checkAvailability(parsed.data);
      res.status(200).json(result);
    } catch (err: any) {
      console.error('[API] check_availability error:', err);
      res.status(500).json({
        error: 'Internal Server Error',
        message: `Failed to check table availability: ${err.message || String(err)}`,
      });
    }
  });

  // 6. REST Action: create_reservation (protected with API key)
  app.post('/api/create-reservation', requireApiKey, async (req: Request, res: Response) => {
    const parsed = CreateReservationSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Validation failed for create_reservation parameters',
        details: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
      });
      return;
    }

    try {
      const result = await bridge.createReservation(parsed.data);
      res.status(201).json(result);
    } catch (err: any) {
      console.error('[API] create_reservation error:', err);
      res.status(500).json({
        error: 'Internal Server Error',
        message: `Failed to create reservation: ${err.message || String(err)}`,
      });
    }
  });

  // 7. MCP SSE Transport endpoint (protected with API key)
  app.get('/sse', requireApiKey, async (req: Request, res: Response) => {
    try {
      const transport = new SSEServerTransport('/message', res);
      const mcpServer = createMcpServer(bridge);
      sseTransports.set(transport.sessionId, transport);

      req.on('close', () => {
        sseTransports.delete(transport.sessionId);
      });

      await mcpServer.connect(transport);
    } catch (err) {
      console.error('[MCP SSE] Connection error:', err);
      if (!res.headersSent) {
        res.status(500).send('Failed to establish SSE transport');
      }
    }
  });

  // 8. MCP Message endpoint for active SSE sessions
  app.post('/message', async (req: Request, res: Response) => {
    const sessionId = req.query['sessionId'] as string;
    const transport = sseTransports.get(sessionId);

    if (!transport) {
      res.status(404).send('Session not found or expired');
      return;
    }

    try {
      await transport.handlePostMessage(req, res);
    } catch (err) {
      console.error('[MCP Message] Error processing message:', err);
      if (!res.headersSent) {
        res.status(500).send('Error handling message');
      }
    }
  });

  return app;
}
