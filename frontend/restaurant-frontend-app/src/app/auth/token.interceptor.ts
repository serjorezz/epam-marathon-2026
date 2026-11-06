import {
  HttpErrorResponse,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast/toast.service';
import { inject } from '@angular/core';
import { AuthenticationService } from './services/authentication.service';
import { SKIP_ERROR_TOAST } from './skip-error-toast.context';
import { getServerErrorMessage } from '../shared/helpers/http-error-helpers';

export const tokenInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const toastr = inject(ToastService);

  // IMPORTANT: do not modify Guest endpoints at all.
  // Guest flow uses a different token (guest session token) and we must not touch the body.
  // Otherwise we break POST /guest/sessions payload.
  // Exceptions:
  // - /guest/groups/* are OWNER routes (participant list, status, submit, removal)
  //   and need the signed-in user's token — without it the owner's group pre-order page gets 401.
  // - /guest/invites/* is an anonymous route, but when the OWNER calls it the signed-in
  //   user's token must be attached so the backend can tell the owner apart from a guest
  //   (skips guest-only restrictions like the 2-hour deadline / full group / submitted).
  if (req.url.includes('/guest/') &&
      !req.url.includes('/guest/groups/') &&
      !req.url.includes('/guest/invites/')) {
    return next(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (req.context.get(SKIP_ERROR_TOAST) || req.url.includes('/chat')) {
          return throwError(() => error);
        }

        const serverMessage = getServerErrorMessage(error);

        // For guest endpoints, you may still show toast if you want:
        switch (error.status) {
          case 400:
            toastr.error(serverMessage || 'Bad request.', 'Error');
            break;
          case 401:
            toastr.error('Session expired. Please re-open the invite link.', 'Unauthorized');
            break;
          case 403:
            toastr.error(serverMessage || 'You are not allowed!', 'Forbidden');
            break;
          case 404:
            toastr.error(serverMessage || 'Resource not found.', 'Not Found');
            break;
          case 409:
            toastr.error(serverMessage || 'Conflict occurred.', 'Conflict');
            break;
          case 422:
            toastr.error(serverMessage || 'Validation error.', 'Error');
            break;
          case 500:
            toastr.error('Server error. Please try again later.', 'Server Error');
            break;
          default:
            toastr.error(serverMessage || 'An unexpected error occurred.', 'Error');
            break;
        }

        return throwError(() => error);
      })
    );
  }

  const authService = inject(AuthenticationService);
  const tokens = authService.getTokens();

  const clonedRequest =
    tokens && tokens.idToken
      ? req.clone({
        setHeaders: {
          Authorization: 'Bearer ' + tokens.idToken,
        },
      })
      : req;

  return next(clonedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      if (clonedRequest.url.includes('orders') && error.status === 404) {
        return throwError(() => error);
      }

      if (clonedRequest.context.get(SKIP_ERROR_TOAST) || clonedRequest.url.includes('/chat')) {
        return throwError(() => error);
      }

      const serverMessage = getServerErrorMessage(error);

      switch (error.status) {
        case 400:
          toastr.error(serverMessage || 'Bad request.', 'Error');
          break;
        case 401:
          toastr.error('Please log in to perform the action!', 'Unauthorized');
          break;
        case 403:
          toastr.error(serverMessage || 'You are not allowed!', 'Forbidden');
          break;
        case 404:
          toastr.error(serverMessage || 'Resource not found.', 'Not Found');
          break;
        case 409:
          toastr.error(serverMessage || 'Conflict occurred.', 'Conflict');
          break;
        case 422:
          toastr.error(serverMessage || 'Validation error.', 'Error');
          break;
        case 500:
          toastr.error('Server error. Please try again later.', 'Server Error');
          break;
        default:
          toastr.error(serverMessage || 'An unexpected error occurred.', 'Error');
          break;
      }

      return throwError(() => error);
    })
  );
};
