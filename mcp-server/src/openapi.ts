import { config } from './config.js';

export function getOpenApiSpec(serverUrl = config.serverBaseUrl) {
  return {
    openapi: '3.0.3',
    info: {
      title: 'Green & Tasty Restaurant Reservation API & Action Bridge',
      version: '1.0.0',
      description:
        'Standardized OpenAPI 3.0 interface for AI assistants (Google Gemini App, Custom GPTs, and MCP agents) to check table availability and book restaurant reservations at Green & Tasty in Tbilisi.',
      contact: {
        name: 'Green & Tasty Support',
        email: 'reservations@green-tasty.com',
        url: 'https://green-tasty.devs.surf',
      },
    },
    servers: [
      {
        url: serverUrl,
        description: 'Green & Tasty Reservation MCP Server / Bridge',
      },
    ],
    security: [
      {
        ApiKeyAuth: [],
      },
      {
        BearerAuth: [],
      },
    ],
    paths: {
      '/api/check-availability': {
        post: {
          summary: 'Check available dining time slots',
          description:
            'Queries table availability and available dining time slots for a specified calendar date and guest count.',
          operationId: 'check_availability',
          security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/CheckAvailabilityRequest',
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Successfully checked table availability',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/CheckAvailabilityResponse',
                  },
                },
              },
            },
            '400': {
              description: 'Invalid input parameters (e.g. past date or invalid guest count)',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse',
                  },
                },
              },
            },
            '401': {
              description: 'Unauthorized - missing or invalid API key',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse',
                  },
                },
              },
            },
            '500': {
              description: 'Internal server error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse',
                  },
                },
              },
            },
          },
        },
      },
      '/api/create-reservation': {
        post: {
          summary: 'Create a table reservation',
          description:
            'Books a table in the restaurant database with customer contact details, party size, reservation start time, and optional special requests.',
          operationId: 'create_reservation',
          security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/CreateReservationRequest',
                },
              },
            },
          },
          responses: {
            '201': {
              description: 'Reservation successfully created',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/CreateReservationResponse',
                  },
                },
              },
            },
            '400': {
              description: 'Invalid reservation request or validation failure',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse',
                  },
                },
              },
            },
            '401': {
              description: 'Unauthorized - missing or invalid API key',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse',
                  },
                },
              },
            },
            '500': {
              description: 'Failed to create reservation in backend',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse',
                  },
                },
              },
            },
          },
        },
      },
    },
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'x-api-key',
          description: "API Key authentication header ('x-api-key: <key>')",
        },
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          description: "Bearer token authentication header ('Authorization: Bearer <token>')",
        },
      },
      schemas: {
        CheckAvailabilityRequest: {
          type: 'object',
          required: ['date', 'guests_count'],
          properties: {
            date: {
              type: 'string',
              format: 'date',
              description: 'Dining date in YYYY-MM-DD format (e.g. 2026-11-10)',
              example: '2026-11-10',
            },
            guests_count: {
              type: 'integer',
              minimum: 1,
              maximum: 20,
              description: 'Number of dining guests (party size)',
              example: 2,
            },
          },
        },
        CheckAvailabilityResponse: {
          type: 'object',
          properties: {
            date: {
              type: 'string',
              example: '2026-11-10',
            },
            guests_count: {
              type: 'integer',
              example: 2,
            },
            available: {
              type: 'boolean',
              example: true,
            },
            available_time_slots: {
              type: 'array',
              items: {
                type: 'string',
              },
              example: ['12:00', '13:30', '15:00', '18:00', '19:30', '20:00', '21:00'],
            },
            available_tables_count: {
              type: 'integer',
              example: 5,
            },
            message: {
              type: 'string',
              example: 'Tables are available for 2 guest(s) on 2026-11-10 at: 12:00, 13:30, 15:00, 18:00, 19:30, 20:00, 21:00.',
            },
          },
        },
        CreateReservationRequest: {
          type: 'object',
          required: ['name', 'phone', 'guests_count', 'datetime'],
          properties: {
            name: {
              type: 'string',
              minLength: 2,
              maxLength: 100,
              description: 'Customer contact or full name',
              example: 'Mariam Lomidze',
            },
            phone: {
              type: 'string',
              minLength: 7,
              maxLength: 25,
              description: 'Customer contact phone number',
              example: '+995555123456',
            },
            guests_count: {
              type: 'integer',
              minimum: 1,
              maximum: 20,
              description: 'Number of dining guests (party size)',
              example: 2,
            },
            datetime: {
              type: 'string',
              format: 'date-time',
              description: 'Reservation start date and time in ISO 8601 format',
              example: '2026-11-10T18:00:00Z',
            },
            special_requests: {
              type: 'string',
              maxLength: 500,
              description: 'Optional seating preference or dietary request',
              example: 'Quiet table by the conservatory window',
            },
          },
        },
        CreateReservationResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            reservationId: {
              type: 'string',
              example: 'res-12345',
            },
            tableId: {
              type: 'string',
              example: 'table-b2',
            },
            locationId: {
              type: 'string',
              example: 'loc-baratashvili',
            },
            startTime: {
              type: 'string',
              example: '2026-11-10T18:00:00Z',
            },
            endTime: {
              type: 'string',
              example: '2026-11-10T19:30:00Z',
            },
            guestsCount: {
              type: 'integer',
              example: 2,
            },
            name: {
              type: 'string',
              example: 'Mariam Lomidze',
            },
            phone: {
              type: 'string',
              example: '+995555123456',
            },
            specialRequests: {
              type: 'string',
              example: 'Quiet table by the conservatory window',
            },
            message: {
              type: 'string',
              example: 'Reservation successfully confirmed for Mariam Lomidze (2 guests) on 2026-11-10 at 18:00 UTC.',
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              example: 'Bad Request',
            },
            message: {
              type: 'string',
              example: 'Invalid input parameter',
            },
            details: {
              type: 'array',
              items: {
                type: 'string',
              },
            },
          },
        },
      },
    },
  };
}
