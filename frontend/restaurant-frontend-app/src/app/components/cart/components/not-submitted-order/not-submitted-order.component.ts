import {
  evaluateHappyHours,
  calculateDiscountedPrice,
} from '@app/shared/helpers/happy-hours.helper';
import { OrderItem } from '@app/models/dishes/order-item.model';
import { CurrencyPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from '@angular/core';

import { Order } from '@app/models/orders/order.model';
import { Reservation } from '@app/models/reservations/reservation.model';
import { DishListResponse } from '@app/models/dishes/dish-list-response.model';
import {
  formatOrderNumber,
  parseOrderReservationDetails,
} from '@app/shared/helpers/order-helpers';
import {
  enrichDishWithAllergens,
  getAllergenRemovalLabel,
  getAllergenDisplayName,
} from '@app/shared/helpers/dish-allergens.helper';
import { TranslatePipe } from '@app/shared/pipes/translate.pipe';

export interface DishCustomization {
  removedAllergens: string[];
  isNonSpicy: boolean;
}

@Component({
  selector: 'app-not-submitted-order',
  standalone: true,
  imports: [CurrencyPipe, TranslatePipe],
  templateUrl: './not-submitted-order.component.html',
  styleUrl: './not-submitted-order.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotSubmittedOrderComponent {
  readonly order = input.required<Order>();
  readonly reservation = input<Reservation | null | undefined>(null);

  readonly submitted = output<string>();
  readonly addDish = output<void>();
  readonly removeDish = output<string>();
  readonly updateQuantity = output<{
    itemId: string;
    quantity: number;
  }>();

  readonly customizations = signal<Record<string, DishCustomization>>({});

  readonly formattedOrderId = computed(() =>
    formatOrderNumber(this.order().orderId),
  );

  readonly orderDetails = computed(() =>
    parseOrderReservationDetails(
      this.order().reservationAddress,
      this.order().reservationTime,
      this.reservation(),
    ),
  );

  readonly happyHourEvaluation = computed(() => {
    return evaluateHappyHours({
      locationAddress: this.order().reservationAddress,
      startTime: this.order().reservationTime,
    });
  });

  readonly isHappyHourActive = computed(() => this.happyHourEvaluation().isHappyHour);
  readonly happyHourDiscount = computed(() =>
    this.isHappyHourActive() ? this.happyHourEvaluation().discountPercentage : null
  );

  readonly totalPrice = computed(() => {
    const discount = this.happyHourDiscount();
    return this.order().orderItems.reduce((total, item) => {
      const price = discount
        ? calculateDiscountedPrice(item.dish.price, discount)
        : item.dish.price;
      return total + price * item.quantity;
    }, 0);
  });

  getItemDiscountedPrice(item: OrderItem): number {
    const discount = this.happyHourDiscount();
    if (!discount) return item.dish.price * item.quantity;
    return calculateDiscountedPrice(item.dish.price, discount) * item.quantity;
  }

  getEnrichedDish(dish: DishListResponse): DishListResponse {
    return enrichDishWithAllergens(dish);
  }

  canRemoveAllergen(dish: DishListResponse, allergen: string): boolean {
    const enriched = this.getEnrichedDish(dish);
    return (
      enriched.removableAllergens?.some(
        (a) => a.toLowerCase() === allergen.toLowerCase(),
      ) ?? false
    );
  }

  isAllergenRemoved(dishId: string, allergen: string): boolean {
    const list = this.customizations()[dishId]?.removedAllergens ?? [];
    return list.some((a) => a.toLowerCase() === allergen.toLowerCase());
  }

  toggleAllergen(dishId: string, allergen: string): void {
    const normalized = allergen.toLowerCase();
    const current = this.customizations()[dishId] ?? {
      removedAllergens: [],
      isNonSpicy: false,
    };
    const exists = current.removedAllergens.some((a) => a.toLowerCase() === normalized);
    const updatedAllergens = exists
      ? current.removedAllergens.filter((a) => a.toLowerCase() !== normalized)
      : [...current.removedAllergens, normalized];

    this.customizations.update((map) => ({
      ...map,
      [dishId]: {
        ...current,
        removedAllergens: updatedAllergens,
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

  incrementItemQuantity(itemId: string): void {
    const item = this.findOrderItem(itemId);

    if (item) {
      this.updateItemQuantity(itemId, item.quantity + 1);
    }
  }

  decrementItemQuantity(itemId: string): void {
    const item = this.findOrderItem(itemId);

    if (item && item.quantity > 1) {
      this.updateItemQuantity(itemId, item.quantity - 1);
    }
  }

  submit(): void {
    this.submitted.emit(this.order().orderId);
  }

  addDishToOrder(): void {
    this.addDish.emit();
  }

  removeDishFromOrder(itemId: string): void {
    this.removeDish.emit(itemId);
  }

  private findOrderItem(itemId: string) {
    return this.order().orderItems.find(
      (item) => item.dish.id === itemId,
    );
  }

  private updateItemQuantity(itemId: string, quantity: number): void {
    this.updateQuantity.emit({ itemId, quantity });
  }
}
