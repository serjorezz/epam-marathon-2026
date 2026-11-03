import { TranslatePipe } from "@app/shared/pipes/translate.pipe";
import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  computed,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DishListResponse } from '@app/models/dishes/dish-list-response.model';
import { DishState } from '@app/models/enums/dish-state.model';
import { DishStateLabels } from '@app/shared/mappers/dish-enum.mapper';
import { CustomButtonComponent } from '@app/shared/custom-components/custom-button/custom-button.component';
import { enrichDishWithAllergens } from '@app/shared/helpers/dish-allergens.helper';

@Component({
  selector: 'app-dish-card',
  templateUrl: './dish-card.component.html',
  styleUrls: ['./dish-card.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [CommonModule, CustomButtonComponent, TranslatePipe],
})
export class DishCardComponent {
  readonly dish = input.required<DishListResponse>();
  readonly maxWidth = input('');
  readonly preOrderEnabled = input(false);
  readonly showFavorite = input(true);

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

  onCardClicked(): void {
    if (!this.isUnavailable() && !this.preOrderEnabled()) {
      this.dishClicked.emit();
    }
  }

  onFavoriteClick(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    if (!this.showFavorite()) {
      return;
    }
    const nextState = !this.isFavorite();
    this.isFavoriteInternal.set(nextState);
    this.favoriteToggle.emit({ dish: this.dish(), isFavorite: nextState });
  }
}
