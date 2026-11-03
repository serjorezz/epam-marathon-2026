export interface ReservationCardData {
  id: string;
  startTime: string;
  endTime: string;
  guestCount: number;
  address: string;
  customerName?: string;
  status: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: Date;
  reservation?: ReservationCardData;
}

export interface ChatApiRequest {
  message: string;
  history?: {
    role: string;
    text: string;
  }[];
}

export interface ChatApiResponse {
  reply: string;
  reservation?: ReservationCardData;
}
