import { TranslatePipe } from "@app/shared/pipes/translate.pipe";
import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DishListResponse } from '@app/models/dishes/dish-list-response.model';

@Component({
  selector: 'app-dish-modal',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './dish-modal.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './dish-modal.component.scss',
})
export class DishModalComponent {
  @Input() dish?: DishListResponse | null;
  @Input() preOrderEnabled = false;
  @Output() closed = new EventEmitter<void>();
  @Output() preOrderClicked = new EventEmitter<void>();

  onClose(): void {
    this.closed.emit();
  }

  onPreOrder(): void {
    this.preOrderClicked.emit();
  }

  isUnavailable(): boolean {
    const state = this.dish?.state?.toLowerCase();
    return state === 'on stop' || state === 'unavailable' || state === 'sold out';
  }

  formatCalories(calories?: string): string {
    if (!calories) return 'N/A';
    const trimmed = calories.trim();
    const prefix = trimmed.startsWith('~') ? '' : '~';
    const num = trimmed.replace(/^~/, '').replace(/\s*kcal\s*/i, '').trim();
    return `${prefix}${num} kcal`;
  }

  formatGrams(value?: string): string {
    if (!value) return 'N/A';
    const trimmed = value.trim();
    if (trimmed.endsWith('g')) return trimmed;
    return `${trimmed}g`;
  }
}
