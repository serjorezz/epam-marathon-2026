import { CurrencyPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';

import { Order } from '@app/models/orders/order.model';
import { Reservation } from '@app/models/reservations/reservation.model';
import {
  formatOrderNumber,
  parseOrderReservationDetails,
} from '@app/shared/helpers/order-helpers';
import { TranslatePipe } from '@app/shared/pipes/translate.pipe';

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

  readonly totalPrice = computed(() =>
    this.order().orderItems.reduce(
      (total, item) => total + item.dish.price * item.quantity,
      0,
    ),
  );

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
