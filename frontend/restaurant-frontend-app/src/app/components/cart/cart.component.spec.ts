import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { Order } from '@app/models/orders/order.model';
import {
  Reservation,
  ReservationStatus,
} from '@app/models/reservations/reservation.model';
import { PreOrdersService } from '@app/services/pre-orders/pre-orders.service';
import { ReservationService } from '@app/services/reservation/reservation.service';

import { CartComponent } from './cart.component';

describe('CartComponent', () => {
  let component: CartComponent;
  let fixture: ComponentFixture<CartComponent>;

  let preOrdersServiceMock: jasmine.SpyObj<PreOrdersService>;
  let reservationServiceMock: jasmine.SpyObj<ReservationService>;
  let routerMock: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    preOrdersServiceMock =
      jasmine.createSpyObj<PreOrdersService>(
        'PreOrdersService',
        [
          'getPreOrders',
          'cancelPreOrderByReservationId',
          'unsubmitPreOrderByReservationId',
          'submitPreOrderByReservationId',
          'editPreOrderByReservationId',
        ],
      );

    reservationServiceMock =
      jasmine.createSpyObj<ReservationService>(
        'ReservationService',
        ['getReservationsForUser$'],
      );

    routerMock = jasmine.createSpyObj<Router>(
      'Router',
      ['navigate'],
    );

    preOrdersServiceMock.getPreOrders.and.returnValue(of([]));
    reservationServiceMock.getReservationsForUser$.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [CartComponent],
      providers: [
        {
          provide: PreOrdersService,
          useValue: preOrdersServiceMock,
        },
        {
          provide: ReservationService,
          useValue: reservationServiceMock,
        },
        {
          provide: Router,
          useValue: routerMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CartComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit closeCartEvent after animation when closeCart is called', fakeAsync(() => {
    spyOn(component.closeCartEvent, 'emit');

    component.closeCart();
    expect(component.closeCartEvent.emit).not.toHaveBeenCalled();

    tick(300);
    expect(component.closeCartEvent.emit).toHaveBeenCalled();
  }));

  it('should emit closeCartEvent immediately when closeCart(true) is called', () => {
    spyOn(component.closeCartEvent, 'emit');

    component.closeCart(true);
    expect(component.closeCartEvent.emit).toHaveBeenCalled();
  });

  it('should return submitted orders with statuses 1 and 3 and a Reserved reservation', () => {
    component.reservations.set([
      { id: 'res-1', status: ReservationStatus.Reserved },
      { id: 'res-3', status: ReservationStatus.Reserved },
      { id: 'res-cancelled', status: ReservationStatus.Cancelled },
    ] as Reservation[]);

    component.orders.set([
      {
        orderId: 'order-1',
        reservationId: 'res-1',
        status: 1,
      },
      {
        orderId: 'order-2',
        reservationId: 'res-1',
        status: 2,
      },
      {
        orderId: 'order-3',
        reservationId: 'res-3',
        status: 3,
      },
      {
        orderId: 'order-4',
        reservationId: 'res-1',
        status: 0,
      },
      {
        orderId: 'order-cancelled',
        reservationId: 'res-cancelled',
        status: 1,
      },
    ] as Order[]);

    expect(
      component
        .submittedOrders()
        .map((order) => order.orderId),
    ).toEqual(['order-1', 'order-3']);
  });

  it('should return unsubmitted orders with status 0 and a Reserved reservation', () => {
    component.reservations.set([
      { id: 'res-1', status: ReservationStatus.Reserved },
    ] as Reservation[]);

    component.orders.set([
      {
        orderId: 'order-1',
        reservationId: 'res-1',
        status: 0,
      },
      {
        orderId: 'order-2',
        reservationId: 'res-1',
        status: 1,
      },
      {
        orderId: 'order-3',
        reservationId: 'res-1',
        status: 3,
      },
    ] as Order[]);

    expect(
      component
        .unsubmittedOrders()
        .map((order) => order.orderId),
    ).toEqual(['order-1']);
  });

  it('should navigate to reservations when goToReservations is called', () => {
    component.goToReservations();

    expect(routerMock.navigate).toHaveBeenCalledWith([
      '/reservations',
    ]);
  });
});
