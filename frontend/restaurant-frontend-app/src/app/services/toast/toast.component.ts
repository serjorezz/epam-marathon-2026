import { Component, inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';

export interface ToastData {
  title?: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

function capitalize(text?: string): string {
  if (!text) return '';
  const trimmed = text.trim();
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

@Component({
  selector: 'app-toast',
  template: `
    <div class="toast-content">
      @if (data.type === 'error') {
        <svg class="toast-icon toast-icon-error" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd" />
        </svg>
      } @else if (data.type === 'success') {
        <img src="assets/svg/check-circle.svg" alt="" class="toast-icon" />
      } @else if (data.type === 'info') {
        <svg class="toast-icon toast-icon-info" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clip-rule="evenodd" />
        </svg>
      }
      <div class="toast-text">
        @if (displayTitle) {
          <strong class="toast-title">{{ displayTitle }}</strong>
        }
        <span class="toast-message">{{ displayMessage }}</span>
      </div>
    </div>
    <button class="toast-close" (click)="snackBarRef.dismiss()" aria-label="Close">
      <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="1" y1="1" x2="13" y2="13"></line>
        <line x1="13" y1="1" x2="1" y2="13"></line>
      </svg>
    </button>
  `,
  styleUrl: './toast.component.scss',
})
export class ToastComponent {
  data = inject<ToastData>(MAT_SNACK_BAR_DATA);
  snackBarRef = inject(MatSnackBarRef);

  get displayMessage(): string {
    return capitalize(this.data?.message);
  }

  get displayTitle(): string | undefined {
    return this.data?.title ? capitalize(this.data.title) : undefined;
  }
}
