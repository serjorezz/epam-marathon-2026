import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env if present
dotenv.config();

export interface AppConfig {
  port: number;
  host: string;
  serverBaseUrl: string;
  mcpApiKey: string;
  backendUrl: string;
  cognitoClientId: string;
  customerEmail?: string;
  customerPassword?: string;
  mockFallback: boolean;
}

export const config: AppConfig = {
  port: parseInt(process.env.PORT || '3000', 10),
  host: process.env.HOST || '0.0.0.0',
  serverBaseUrl: process.env.SERVER_BASE_URL || `http://localhost:${process.env.PORT || '3000'}`,
  mcpApiKey: process.env.MCP_API_KEY || 'gt-agent-secret-key-2026',
  backendUrl: process.env.RESTAURANT_BACKEND_URL || 'https://pin0yvpmgk.execute-api.us-east-1.amazonaws.com/develop',
  cognitoClientId: process.env.COGNITO_CLIENT_ID || 'rv8ltk3pcfuvtr8p6snv3fct5',
  customerEmail: process.env.CUSTOMER_EMAIL || 'customer@green-tasty.com',
  customerPassword: process.env.CUSTOMER_PASSWORD || 'Customer12345!',
  mockFallback: process.env.MOCK_FALLBACK !== 'false',
};
