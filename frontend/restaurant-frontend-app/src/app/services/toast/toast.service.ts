import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ToastComponent, ToastData } from './toast.component';

function capitalize(text: string): string {
  if (!text) return '';
  const trimmed = text.trim();
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private snackBar = inject(MatSnackBar);

  error(message: string, title?: string): void {
    if (typeof message === 'string' && message.startsWith('Http failure response for')) {
      return;
    }
    const formatted = typeof message === 'string' ? capitalize(message) : message;
    const formattedTitle = typeof title === 'string' ? capitalize(title) : title;
    this.open({ message: formatted, title: formattedTitle, type: 'error' }, 5000, ['toast-error']);
  }

  success(message: string, title?: string): void {
    const formatted = typeof message === 'string' ? capitalize(message) : message;
    const formattedTitle = typeof title === 'string' ? capitalize(title) : title;
    this.open({ message: formatted, title: formattedTitle, type: 'success' }, 3000, ['toast-success']);
  }

  info(message: string, title?: string): void {
    const formatted = typeof message === 'string' ? capitalize(message) : message;
    const formattedTitle = typeof title === 'string' ? capitalize(title) : title;
    this.open({ message: formatted, title: formattedTitle, type: 'info' }, 3000, ['toast-info']);
  }

  private open(data: ToastData, duration: number, panelClass: string[]): void {
    this.snackBar.openFromComponent(ToastComponent, {
      data,
      duration,
      panelClass,
      verticalPosition: 'top',
      horizontalPosition: 'right',
    });
  }
}
