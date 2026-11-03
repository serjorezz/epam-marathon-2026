import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { GuestCartItem } from '@app/pages/guest-pre-order-page/state/guest-preorder.store';
import { TranslatePipe } from '@app/shared/pipes/translate.pipe';
import {
  getAllergenRemovalLabel,
  getAllergenDisplayName,
  DISH_ALLERGEN_METADATA,
} from '@app/shared/helpers/dish-allergens.helper';

@Component({
  standalone: true,
  selector: 'app-guest-cart-drawer',
  templateUrl: './guest-cart-drawer.component.html',
  styleUrl: './guest-cart-drawer.component.scss',
  imports: [CurrencyPipe, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GuestCartDrawerComponent {
  readonly open = input(false);
  readonly items = input<GuestCartItem[]>([]);
  readonly total = input(0);
  readonly busy = input(false);
  readonly error = input<string | null>(null);
  readonly isLocked = input(false);

  readonly closed = output<void>();
  readonly goToMenu = output<void>();
  readonly inc = output<string>();
  readonly dec = output<string>();
  readonly remove = output<string>();
  readonly submitted = output<void>();

  readonly customizations = signal<Record<string, { removedAllergens: string[]; isNonSpicy: boolean }>>({});

  getItemAllergens(item: GuestCartItem): string[] {
    return DISH_ALLERGEN_METADATA[item.dishId]?.allergens ?? [];
  }

  isItemSpicy(item: GuestCartItem): boolean {
    return DISH_ALLERGEN_METADATA[item.dishId]?.isSpicy ?? false;
  }

  canRemoveAllergen(item: GuestCartItem, allergen: string): boolean {
    const removable = DISH_ALLERGEN_METADATA[item.dishId]?.removableAllergens ?? [];
    return removable.some((a: string) => a.toLowerCase() === allergen.toLowerCase());
  }

  canBeNonSpicy(item: GuestCartItem): boolean {
    return DISH_ALLERGEN_METADATA[item.dishId]?.canBeNonSpicy ?? false;
  }

  isAllergenRemoved(dishId: string, allergen: string): boolean {
    const list = this.customizations()[dishId]?.removedAllergens ?? [];
    return list.some((a: string) => a.toLowerCase() === allergen.toLowerCase());
  }

  toggleAllergen(dishId: string, allergen: string): void {
    const normalized = allergen.toLowerCase();
    const current = this.customizations()[dishId] ?? {
      removedAllergens: [],
      isNonSpicy: false,
    };
    const exists = current.removedAllergens.some((a: string) => a.toLowerCase() === normalized);
    const updated = exists
      ? current.removedAllergens.filter((a: string) => a.toLowerCase() !== normalized)
      : [...current.removedAllergens, normalized];

    this.customizations.update((map) => ({
      ...map,
      [dishId]: {
        ...current,
        removedAllergens: updated,
      },
    }));
  }

  isNonSpicy(dishId: string): boolean {
    return this.customizations()[dishId]?.isNonSpicy ?? false;
  }

  toggleNonSpicy(dishId: string): void {
    const current = this.customizations()[dishId] ?? {
      removedAllergens: [],
      isNonSpicy: false,
    };
    this.customizations.update((map) => ({
      ...map,
      [dishId]: {
        ...current,
        isNonSpicy: !current.isNonSpicy,
      },
    }));
  }

  getAllergenRemovalLabel(allergen: string): string {
    return getAllergenRemovalLabel(allergen);
  }

  getAllergenDisplayName(allergen: string): string {
    return getAllergenDisplayName(allergen);
  }
}
