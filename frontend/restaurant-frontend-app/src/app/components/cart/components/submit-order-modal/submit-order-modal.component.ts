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
import { parseOrderReservationDetails } from '@app/shared/helpers/order-helpers';

@Component({
  selector: 'app-submit-order-modal',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './submit-order-modal.component.html',
  styleUrl: './submit-order-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubmitOrderModalComponent {
  readonly order = input.required<Order>();
  readonly reservation = input<Reservation | null | undefined>(null);

  readonly canceled = output<void>();
  readonly edited = output<void>();
  readonly closed = output<void>();
  readonly createNew = output<void>();

  readonly orderDetails = computed(() =>
    parseOrderReservationDetails(
      this.order().reservationAddress,
      this.order().reservationTime,
      this.reservation(),
    ),
  );

  readonly restaurantName = computed(
    () => this.reservation()?.restaurantName || 'Green & Tasty',
  );

  readonly totalPrice = computed(() =>
    this.order().orderItems.reduce(
      (total, item) => total + item.dish.price * item.quantity,
      0,
    ),
  );

  readonly tableTargetText = computed(() => {
    const rawAddress = this.order().reservationAddress || '';
    const tableMatch = rawAddress.match(/Table\s*\d+/i);
    if (tableMatch) {
      return tableMatch[0];
    }
    return 'your table';
  });

  cancelOrder(): void {
    this.canceled.emit();
  }

  editOrder(): void {
    this.edited.emit();
  }

  closeModal(): void {
    this.closed.emit();
  }

  createNewPreOrder(): void {
    this.createNew.emit();
  }
}
