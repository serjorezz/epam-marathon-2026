import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { CurrencyPipe } from '@angular/common';

import { Order } from '@app/models/orders/order.model';
import { TranslatePipe } from '@app/shared/pipes/translate.pipe';

@Component({
  selector: 'app-view-pre-order-modal',
  standalone: true,
  imports: [CurrencyPipe, TranslatePipe],
  templateUrl: './view-pre-order-modal.component.html',
  styleUrl: './view-pre-order-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewPreOrderModalComponent {
  readonly order = input.required<Order>();
  readonly closeModal = output<void>();

  readonly total = computed(() =>
    this.order().orderItems.reduce(
      (sum, item) => sum + item.dish.price * item.quantity,
      0
    )
  );

  close(): void {
    this.closeModal.emit();
  }
}
