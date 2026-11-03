import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { DishListResponse } from '@app/models/dishes/dish-list-response.model';
import { DishState } from '@app/models/enums/dish-state.model';
import { DishStateLabels } from '@app/shared/mappers/dish-enum.mapper';
import { CustomButtonComponent } from '@app/shared/custom-components/custom-button/custom-button.component';
import { TranslatePipe } from '@app/shared/pipes/translate.pipe';
import { enrichDishWithAllergens } from '@app/shared/helpers/dish-allergens.helper';
import { calculateDiscountedPrice } from '@app/shared/helpers/happy-hours.helper';

@Component({
  selector: 'app-dish-card',
  standalone: true,
  imports: [CurrencyPipe, CustomButtonComponent, TranslatePipe],
  templateUrl: './dish-card.component.html',
  styleUrl: './dish-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DishCardComponent {
  readonly dish = input.required<DishListResponse>();
  readonly preOrderEnabled = input<boolean>(false);
  readonly maxWidth = input<string>('300px');
  readonly showFavorite = input<boolean>(true);
  readonly happyHourDiscount = input<number | null>(null);

  readonly dishClicked = output<void>();
  readonly preOrderClicked = output<void>();
  readonly favoriteToggle = output<{ dish: DishListResponse; isFavorite: boolean }>();

  private readonly isFavoriteInternal = signal<boolean | null>(null);

  readonly enrichedDish = computed(() => {
    return enrichDishWithAllergens(this.dish());
  });

  readonly hasAllergens = computed(() => {
    const allergens = this.enrichedDish().allergens;
    return Array.isArray(allergens) && allergens.length > 0;
  });

  readonly isSpicy = computed(() => {
    return !!this.enrichedDish().isSpicy;
  });

  readonly isFavorite = computed(() => {
    return this.isFavoriteInternal() ?? this.dish().isFavorite ?? false;
  });

  readonly dishStateLabel = computed(() => {
    const state = this.dish().state;

    return DishStateLabels[state as DishState] ?? state;
  });

  readonly isUnavailable = computed(() => {
    const state = this.dish().state.toLowerCase();

    return (
      state === DishState.OnStop.toLowerCase() ||
      state === DishState.OutOfStock.toLowerCase()
    );
  });

  getDiscountedPrice(price: number, discount: number): number {
    return calculateDiscountedPrice(price, discount);
  }

  onCardClicked(): void {
    if (!this.isUnavailable() && !this.preOrderEnabled()) {
      this.dishClicked.emit();
    }
  }

  onFavoriteClick(event: MouseEvent): void {
    if (!this.showFavorite()) return;
    event.stopPropagation();
    event.preventDefault();
    const newStatus = !this.isFavorite();
    this.isFavoriteInternal.set(newStatus);
    this.favoriteToggle.emit({
      dish: this.dish(),
      isFavorite: newStatus,
    });
  }

  onPreOrderClicked(): void {
    if (!this.isUnavailable()) {
      this.preOrderClicked.emit();
    }
  }
}
