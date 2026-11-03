import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { API_BASE_URL } from '@app/shared/config/api-base-url.token';
import { ChatApiRequest, ChatApiResponse } from '@app/models/chat/chat.model';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly http = inject(HttpClient);

  sendMessage$(request: ChatApiRequest): Observable<ChatApiResponse> {
    const url = `${this.baseUrl}/api/chat`;
    return this.http.post<ChatApiResponse>(url, request).pipe(
      catchError(() => {
        // Fallback to /chat if /api/chat is not mapped on some gateways
        const fallbackUrl = `${this.baseUrl}/chat`;
        return this.http.post<ChatApiResponse>(fallbackUrl, request).pipe(
          catchError((err) => {
            console.error('[ChatService] Failed to send chat message:', err);
            return of<ChatApiResponse>({
              reply:
                'I apologize, but I am having trouble connecting to our booking service. Please try again or visit our Book a Table page directly.',
            });
          })
        );
      })
    );
  }
}
