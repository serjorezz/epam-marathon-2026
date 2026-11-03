import { TranslatePipe } from "@app/shared/pipes/translate.pipe";
import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DishListResponse } from '@app/models/dishes/dish-list-response.model';
import {
  enrichDishWithAllergens,
  getAllergenDisplayName,
} from '@app/shared/helpers/dish-allergens.helper';
import { calculateDiscountedPrice } from '@app/shared/helpers/happy-hours.helper';

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
  @Input() happyHourDiscount: number | null = null;
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

  get enrichedDish(): DishListResponse | null {
    return this.dish ? enrichDishWithAllergens(this.dish) : null;
  }

  get hasAllergens(): boolean {
    return (this.enrichedDish?.allergens?.length ?? 0) > 0;
  }

  get isSpicy(): boolean {
    return !!this.enrichedDish?.isSpicy;
  }

  get canBeNonSpicy(): boolean {
    return !!this.enrichedDish?.canBeNonSpicy;
  }

  getDiscountedPrice(price: number, discount: number): number {
    return calculateDiscountedPrice(price, discount);
  }

  getAllergenLabel(allergen: string): string {
    const isRemovable = this.enrichedDish?.removableAllergens?.includes(allergen);
    const displayName = getAllergenDisplayName(allergen);
    if (!isRemovable) {
      return `${displayName} (cannot be removed)`;
    }
    return displayName;
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
    if (trimmed.toLowerCase().endsWith('g') || trimmed.toLowerCase().endsWith('г')) {
      return trimmed;
    }
    return `${trimmed}g`;
  }
}
