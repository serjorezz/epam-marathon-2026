import { HttpErrorResponse } from '@angular/common/http';

export function getServerErrorMessage(error: HttpErrorResponse | unknown): string {
  if (!error) {
    return '';
  }

  let body: unknown = error;
  if (error instanceof HttpErrorResponse || (typeof error === 'object' && error !== null && 'error' in error)) {
    body = (error as { error: unknown }).error;
  }

  if (typeof body === 'string') {
    const trimmed = body.trim();
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed && typeof parsed === 'object') {
          body = parsed;
        }
      } catch {
        // Not valid JSON, keep as string
      }
    }
  }

  if (body && typeof body === 'object') {
    const obj = body as Record<string, unknown>;
    if (typeof obj['error'] === 'string' && obj['error']) {
      return obj['error'];
    }
    if (typeof obj['message'] === 'string' && obj['message']) {
      return obj['message'];
    }
    if (typeof obj['detail'] === 'string' && obj['detail']) {
      return obj['detail'];
    }
  }

  if (typeof body === 'string') {
    if (body.startsWith('Http failure response for')) {
      return '';
    }
    return body;
  }

  return '';
}
