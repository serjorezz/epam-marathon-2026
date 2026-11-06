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
  selector: 'app-submitted-order',
  standalone: true,
  imports: [CurrencyPipe, TranslatePipe],
  templateUrl: './submitted-order.component.html',
  styleUrl: './submitted-order.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubmittedOrderComponent {
  readonly order = input.required<Order>();
  readonly reservation = input<Reservation | null | undefined>(null);
  /** Past the 30-minute edit cutoff (or reservation no longer 'Reserved') — lock edit/cancel. */
  readonly readOnly = input<boolean>(false);

  readonly canceled = output<void>();
  readonly edited = output<void>();

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
    this.order()
      .orderItems.filter((item) => item.state !== 2)
      .reduce(
        (total, item) =>
          total + item.dish.price * item.quantity,
        0,
      ),
  );

  cancelOrder(): void {
    this.canceled.emit();
  }

  editOrder(): void {
    this.edited.emit();
  }
}
