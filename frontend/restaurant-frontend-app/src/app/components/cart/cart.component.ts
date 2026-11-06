import { TranslatePipe } from "@app/shared/pipes/translate.pipe";
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { Order } from '@app/models/orders/order.model';
import { Reservation } from '@app/models/reservations/reservation.model';
import { PreOrdersService } from '@app/services/pre-orders/pre-orders.service';
import { ReservationService } from '@app/services/reservation/reservation.service';

import { CancelOrderModalComponent } from './components/cancel-order-modal/cancel-order-modal.component';
import { NotSubmittedOrderComponent } from './components/not-submitted-order/not-submitted-order.component';
import { SubmitOrderModalComponent } from './components/submit-order-modal/submit-order-modal.component';
import { SubmittedOrderComponent } from './components/submitted-order/submitted-order.component';
import { SkeletonOrderItemComponent } from '@app/shared/custom-components/skeleton';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    SubmittedOrderComponent,
    NotSubmittedOrderComponent,
    SkeletonOrderItemComponent,
    CancelOrderModalComponent,
    SubmitOrderModalComponent,
    TranslatePipe,
  ],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartComponent implements OnInit {
  private readonly preOrdersService =
    inject(PreOrdersService);
  private readonly reservationService =
    inject(ReservationService, { optional: true });

  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly closeCartEvent = output<void>();

  readonly isLoading = signal(true);
  readonly isClosing = signal(false);
  readonly orders = signal<Order[]>([]);
  readonly reservations = signal<Reservation[]>([]);

  readonly cancelOrderId = signal<string | null>(null);
  readonly submitOrderId = signal<string | null>(null);

  readonly reservationsMap = computed(() => {
    const map = new Map<string, Reservation>();
    for (const r of this.reservations()) {
      map.set(r.id, r);
    }
    return map;
  });

  readonly submittedOrders = computed(() =>
    this.orders().filter(
      (order) => order.status === 1 || order.status === 3,
    ),
  );

  readonly unsubmittedOrders = computed(() =>
    this.orders().filter((order) => order.status === 0),
  );

  readonly submittedOrder = computed(() => {
    const orderId = this.submitOrderId();

    if (!orderId) {
      return undefined;
    }

    return this.orders().find(
      (order) => order.orderId === orderId,
    );
  });

  ngOnInit(): void {
    this.loadOrders();
  }

  closeCart(immediate = false): void {
    if (this.isClosing()) {
      return;
    }

    if (immediate) {
      this.closeCartEvent.emit();
      return;
    }

    this.isClosing.set(true);
    setTimeout(() => {
      this.closeCartEvent.emit();
    }, 300);
  }

  openCancelModal(orderId: string): void {
    this.cancelOrderId.set(orderId);
    this.submitOrderId.set(null);
  }

  closeCancelModal(): void {
    this.cancelOrderId.set(null);
  }

  closeSubmitModal(): void {
    this.submitOrderId.set(null);
  }

  editOrderModal(): void {
    const orderId = this.submitOrderId();

    if (!orderId) {
      console.error('No order selected for editing');
      return;
    }

    this.editOrder(orderId);
    this.closeSubmitModal();
  }

  goToReservations(): void {
    this.closeCart(true);
    void this.router.navigate(['/reservations']);
  }

  onCreateNewPreOrder(): void {
    this.closeSubmitModal();
    this.closeCart(true);
    void this.router.navigate(['/menu']);
  }

  cancelOrder(orderId: string): void {
    const order = this.findOrder(orderId);

    if (!order) {
      return;
    }

    this.preOrdersService
      .cancelPreOrderByReservationId(order.reservationId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.closeCancelModal();
          this.loadOrders();
        },
        error: (error) => {
          console.error(
            `Error cancelling order ${orderId}:`,
            error,
          );
        },
      });
  }

  editOrder(orderId: string): void {
    const order = this.findOrder(orderId);

    if (!order) {
      return;
    }

    this.preOrdersService
      .unsubmitPreOrderByReservationId(order.reservationId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.loadOrders();
        },
        error: (error) => {
          console.error(
            `Error un-submitting order ${orderId}:`,
            error,
          );
        },
      });
  }

  submitOrder(orderId: string): void {
    const order = this.findOrder(orderId);

    if (!order) {
      return;
    }

    this.preOrdersService
      .submitPreOrderByReservationId(order.reservationId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.submitOrderId.set(orderId);
          this.loadOrders();
        },
        error: (error) => {
          console.error(
            `Error submitting order ${orderId}:`,
            error,
          );
        },
      });
  }

  addDishToOrder(orderId: string): void {
    void this.router.navigate(['/menu'], { queryParams: { orderId } });
  }

  updateDishQuantity(
    orderId: string,
    itemId: string,
    quantity: number,
  ): void {
    if (quantity <= 0) {
      return;
    }

    const originalOrder = this.findOrder(orderId);

    if (!originalOrder) {
      return;
    }

    const originalOrders = this.orders();

    // Optimistic local update — update only the affected item instead of
    // reloading the whole cart (which flashes the loading state).
    this.orders.set(
      originalOrders.map((order) =>
        order.orderId === orderId
          ? {
              ...order,
              orderItems: order.orderItems.map((item) =>
                item.dish.id === itemId ? { ...item, quantity } : item,
              ),
            }
          : order,
      ),
    );

    const updatedOrder: Order = {
      ...originalOrder,
      orderItems: originalOrder.orderItems.map((item) =>
        item.dish.id === itemId
          ? {
            ...item,
            quantity,
          }
          : item,
      ),
    };

    this.preOrdersService
      .editPreOrderByReservationId(
        updatedOrder.reservationId,
        updatedOrder,
      )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: (error) => {
          // Revert the optimistic update on failure
          this.orders.set(originalOrders);
          console.error(
            `Error updating item ${itemId}:`,
            error,
          );
        },
      });
  }

  removeDishFromOrder(
    orderId: string,
    itemId: string,
  ): void {
    const originalOrder = this.findOrder(orderId);

    if (!originalOrder) {
      return;
    }

    const originalOrders = this.orders();

    // Optimistic removal — no full cart reload.
    // Orders left with zero items disappear (the backend DELETEs them).
    this.orders.set(
      originalOrders
        .map((order) =>
          order.orderId === orderId
            ? {
                ...order,
                orderItems: order.orderItems.filter(
                  (item) => item.dish.id !== itemId,
                ),
              }
            : order,
        )
        .filter((order) => order.orderItems.length > 0),
    );

    const updatedOrder: Order = {
      ...originalOrder,
      orderItems: originalOrder.orderItems.filter(
        (item) => item.dish.id !== itemId,
      ),
    };

    this.preOrdersService
      .editPreOrderByReservationId(
        updatedOrder.reservationId,
        updatedOrder,
      )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: (error) => {
          // Revert the optimistic removal on failure
          this.orders.set(originalOrders);
          console.error(
            `Error removing item ${itemId}:`,
            error,
          );
        },
      });
  }

  private findOrder(orderId: string): Order | undefined {
    const order = this.orders().find(
      (item) => item.orderId === orderId,
    );

    if (!order) {
      console.error(`Order with ID ${orderId} not found`);
    }

    return order;
  }

  private loadOrders(): void {
    this.isLoading.set(true);

    const orders$ = this.preOrdersService.getPreOrders().pipe(
      catchError((error) => {
        console.error('Error loading orders:', error);
        return of([] as Order[]);
      }),
    );

    const reservations$ = this.reservationService
      ? this.reservationService.getReservationsForUser$().pipe(
          catchError((error) => {
            console.error('Error loading reservations for cart:', error);
            return of([] as Reservation[]);
          }),
        )
      : of([] as Reservation[]);

    forkJoin({
      orders: orders$,
      reservations: reservations$,
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ orders, reservations }) => {
          this.reservations.set(reservations ?? []);
          this.orders.set(orders ?? []);
          this.isLoading.set(false);
        },
        error: () => {
          this.orders.set([]);
          this.reservations.set([]);
          this.isLoading.set(false);
        },
      });
  }
}
