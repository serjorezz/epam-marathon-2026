import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { ReservationBridge } from './services/reservation-bridge.js';
import { CheckAvailabilitySchema, CreateReservationSchema } from './schemas/reservation.schema.js';

/**
 * Creates and configures a Model Context Protocol (MCP) server instance with the
 * restaurant reservation tools: 'check_availability' and 'create_reservation'.
 */
export function createMcpServer(bridge: ReservationBridge = new ReservationBridge()): Server {
  const server = new Server(
    {
      name: 'green-tasty-reservations',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // 1. List available tools
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: 'check_availability',
          description:
            'Checks table availability and dining time slots for a specified calendar date and guest count at Green & Tasty restaurant in Tbilisi.',
          inputSchema: {
            type: 'object',
            properties: {
              date: {
                type: 'string',
                description: 'Dining date in YYYY-MM-DD format (e.g. 2026-11-10)',
              },
              guests_count: {
                type: 'number',
                description: 'Number of dining guests (party size, 1-20)',
              },
            },
            required: ['date', 'guests_count'],
          },
        },
        {
          name: 'create_reservation',
          description:
            'Creates a table reservation for dining guests in our restaurant database with contact information, datetime, guest count, and optional seating requests.',
          inputSchema: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                description: 'Customer contact or full name',
              },
              phone: {
                type: 'string',
                description: 'Customer contact phone number (e.g. +995555123456)',
              },
              guests_count: {
                type: 'number',
                description: 'Number of dining guests (party size, 1-20)',
              },
              datetime: {
                type: 'string',
                description: 'Reservation start date and time in ISO 8601 format (e.g. 2026-11-10T18:00:00Z)',
              },
              special_requests: {
                type: 'string',
                description: 'Optional seating notes or dietary preferences',
              },
            },
            required: ['name', 'phone', 'guests_count', 'datetime'],
          },
        },
      ],
    };
  });

  // 2. Call tool execution handler
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    if (name === 'check_availability') {
      const parsed = CheckAvailabilitySchema.safeParse(args);
      if (!parsed.success) {
        return {
          isError: true,
          content: [
            {
              type: 'text',
              text: `Validation error: ${parsed.error.issues.map((i) => i.message).join('; ')}`,
            },
          ],
        };
      }

      try {
        const result = await bridge.checkAvailability(parsed.data);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [
            {
              type: 'text',
              text: `Failed to check table availability: ${err.message || String(err)}`,
            },
          ],
        };
      }
    }

    if (name === 'create_reservation') {
      const parsed = CreateReservationSchema.safeParse(args);
      if (!parsed.success) {
        return {
          isError: true,
          content: [
            {
              type: 'text',
              text: `Validation error: ${parsed.error.issues.map((i) => i.message).join('; ')}`,
            },
          ],
        };
      }

      try {
        const result = await bridge.createReservation(parsed.data);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [
            {
              type: 'text',
              text: `Failed to create reservation: ${err.message || String(err)}`,
            },
          ],
        };
      }
    }

    return {
      isError: true,
      content: [
        {
          type: 'text',
          text: `Unknown tool '${name}'`,
        },
      ],
    };
  });

  return server;
}
