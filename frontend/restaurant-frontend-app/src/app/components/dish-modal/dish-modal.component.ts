import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DishListResponse } from '@app/models/dishes/dish-list-response.model';

@Component({
  selector: 'app-dish-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dish-modal.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './dish-modal.component.scss',
})
export class DishModalComponent {
  @Input() dish?: DishListResponse | null;
  @Output() closed = new EventEmitter<void>();

  onClose(): void {
    this.closed.emit();
  }

  formatCalories(calories?: string): string {
    if (!calories) return 'N/A';
    const trimmed = calories.trim();
    const prefix = trimmed.startsWith('~') ? '' : '~';
    const suffix = trimmed.toLowerCase().includes('kcal') ? '' : ' kcal';
    return `${prefix}${trimmed}${suffix}`;
  }

  formatGrams(value?: string): string {
    if (!value) return 'N/A';
    const trimmed = value.trim();
    if (trimmed.endsWith('g')) return trimmed;
    return `${trimmed}g`;
  }
}
