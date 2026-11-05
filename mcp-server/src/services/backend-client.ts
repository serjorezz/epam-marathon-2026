import { config, BACKEND_REQUEST_TIMEOUT_MS } from '../config.js';

export interface BackendTable {
  id: string;
  locationId: string;
  capacity: number;
  tableNumber: number;
}

export interface BackendTimeSlot {
  start: string;
  end: string;
}

export interface BackendReservationPayload {
  tableId: string;
  startTime: string;
  endTime: string;
  guestCount: number;
  customerEmail?: string;
  customerId?: string;
}

export interface BackendReservationResponse {
  id: string;
  tableId: string;
  locationId?: string;
  startTime: string;
  endTime: string;
  guestCount: number;
  customerId?: string;
  status?: string;
}

export class BackendClient {
  private cachedToken: string | null = null;
  private tokenExpiresAt = 0;

  constructor(private readonly baseUrl: string = config.backendUrl) {}

  /**
   * Fetches available tables from the restaurant backend for a given time and guest capacity.
   */
  async getAvailableTables(capacity: number, startTimeIso: string): Promise<BackendTable[]> {
    const url = new URL(`${this.baseUrl}/available-tables`);
    url.searchParams.set('capacity', capacity.toString());
    url.searchParams.set('startTime', startTimeIso);

    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(BACKEND_REQUEST_TIMEOUT_MS),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`Failed to query available tables: HTTP ${res.status} - ${errText}`);
    }

    const data = await res.json();
    return Array.isArray(data) ? data : [];
  }

  /**
   * Fetches available time slots for a specific table.
   */
  async getTableTimeSlots(tableId: string, startTimeIso: string): Promise<BackendTimeSlot[]> {
    const url = new URL(`${this.baseUrl}/tables/${tableId}/available-time-slots`);
    url.searchParams.set('startTime', startTimeIso);

    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(BACKEND_REQUEST_TIMEOUT_MS),
    });

    if (!res.ok) {
      return [];
    }

    const data = await res.json();
    return Array.isArray(data) ? data : [];
  }

  /**
   * Obtains a Cognito bearer token for backend requests by signing in as service customer.
   */
  async getAuthToken(): Promise<string | null> {
    const now = Date.now();
    if (this.cachedToken && this.tokenExpiresAt > now + 60_000) {
      return this.cachedToken;
    }

    if (!config.customerEmail || !config.customerPassword) {
      return null;
    }

    try {
      const res = await fetch(`${this.baseUrl}/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: config.customerEmail,
          password: config.customerPassword,
        }),
        signal: AbortSignal.timeout(BACKEND_REQUEST_TIMEOUT_MS),
      });

      if (!res.ok) {
        console.warn(`[BackendClient] Signin failed with status ${res.status}`);
        return null;
      }

      const data = await res.json() as { idToken?: string; accessToken?: string };
      const token = data.idToken || data.accessToken;
      if (token) {
        this.cachedToken = token;
        // Cognito ID tokens last 1 hour
        this.tokenExpiresAt = now + 50 * 60 * 1000;
        return token;
      }
    } catch (err) {
      console.warn(`[BackendClient] Error authenticating with backend:`, err);
    }

    return null;
  }

  /**
   * Creates a reservation in the backend database.
   */
  async createReservation(payload: BackendReservationPayload): Promise<BackendReservationResponse> {
    const token = await this.getAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${this.baseUrl}/reservations`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(BACKEND_REQUEST_TIMEOUT_MS),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`Failed to create reservation: HTTP ${res.status} - ${errText}`);
    }

    return await res.json() as BackendReservationResponse;
  }
}
