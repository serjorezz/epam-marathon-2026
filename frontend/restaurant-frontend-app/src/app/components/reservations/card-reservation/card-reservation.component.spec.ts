import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { CardReservationComponent } from './card-reservation.component';
import { API_BASE_URL } from '@app/shared/config/api-base-url.token';
import { ReservationCustomer, ReservationStatusCustomer } from '@app/models/reservations/reservation.model';
import { Roles } from '@app/shared/constants/roles';

const PAST_RESERVATION: ReservationCustomer = {
  id: 'res-past',
  tableId: 'table-1',
  startTime: new Date('2026-10-21T11:30:00Z'),
  endTime: new Date('2026-10-21T13:00:00Z'),
  guestCount: 2,
  status: ReservationStatusCustomer.Reserved,
  restaurantName: 'Green & Tasty',
  locationAddress: 'Rustaveli Avenue 48',
  waiterId: 'waiter-1',
};

const FUTURE_RESERVATION: ReservationCustomer = {
  id: 'res-future',
  tableId: 'table-1',
  startTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours in future
  endTime: new Date(Date.now() + 3.5 * 60 * 60 * 1000),
  guestCount: 2,
  status: ReservationStatusCustomer.Reserved,
  restaurantName: 'Green & Tasty',
  locationAddress: 'Rustaveli Avenue 48',
  waiterId: 'waiter-1',
};

const HAPPY_HOUR_RESERVATION: ReservationCustomer = {
  id: 'res-happy',
  tableId: 'table-1',
  startTime: new Date('2026-11-05T13:30:00Z'), // 13:30 is in 12:00-16:00
  endTime: new Date('2026-11-05T15:00:00Z'),
  guestCount: 2,
  status: ReservationStatusCustomer.Reserved,
  restaurantName: 'Green & Tasty',
  locationAddress: '48 Rustaveli Avenue',
  waiterId: 'waiter-1',
};

const NON_HAPPY_HOUR_RESERVATION: ReservationCustomer = {
  id: 'res-non-happy',
  tableId: 'table-1',
  startTime: new Date('2026-11-05T18:00:00Z'), // 18:00 is outside 12:00-16:00
  endTime: new Date('2026-11-05T19:30:00Z'),
  guestCount: 2,
  status: ReservationStatusCustomer.Reserved,
  restaurantName: 'Green & Tasty',
  locationAddress: '48 Rustaveli Avenue',
  waiterId: 'waiter-1',
};

describe('CardReservationComponent', () => {
  let component: CardReservationComponent;
  let fixture: ComponentFixture<CardReservationComponent>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [{ provide: API_BASE_URL, useValue: 'https://test.api' }, provideRouter([])],
      imports: [CardReservationComponent],
    }).compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigate');

    fixture = TestBed.createComponent(CardReservationComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('r', PAST_RESERVATION);
    fixture.componentRef.setInput('role', Roles.CUSTOMER);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should disable pre-order button and render explanation tooltip for past / <30 min reservations', () => {
    fixture.componentRef.setInput('r', PAST_RESERVATION);
    fixture.detectChanges();

    expect(component.isPreOrderCutoffReached()).toBeTrue();

    const element: HTMLElement = fixture.nativeElement;
    const preOrderBtn = element.querySelector('.pre-order-btn-wrapper button') as HTMLButtonElement;
    expect(preOrderBtn).toBeTruthy();
    expect(preOrderBtn.disabled).toBeTrue();

    const tooltip = element.querySelector('.tooltip-box');
    expect(tooltip).toBeTruthy();
    expect(tooltip?.textContent).toContain('Pre-orders can only be modified up to 30 minutes before the reservation start time');

    // Click should be blocked
    component.onPreOrder();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should enable pre-order button and not show tooltip when reservation is more than 30 min in future', () => {
    fixture.componentRef.setInput('r', FUTURE_RESERVATION);
    fixture.detectChanges();

    expect(component.isPreOrderCutoffReached()).toBeFalse();

    const element: HTMLElement = fixture.nativeElement;
    const preOrderBtn = element.querySelector('.pre-order-btn-wrapper button') as HTMLButtonElement;
    expect(preOrderBtn).toBeTruthy();
    expect(preOrderBtn.disabled).toBeFalse();

    const tooltip = element.querySelector('.tooltip-box');
    expect(tooltip).toBeFalsy();

    component.onPreOrder();
    expect(router.navigate).toHaveBeenCalledWith(['/menu'], jasmine.any(Object));
  });

  it('should render second card divider for cancelled reservations', () => {
    const cancelledRes: ReservationCustomer = {
      ...PAST_RESERVATION,
      status: ReservationStatusCustomer.Cancelled,
    };
    fixture.componentRef.setInput('r', cancelledRes);
    fixture.detectChanges();

    const dividers = fixture.nativeElement.querySelectorAll('.card-divider');
    expect(dividers.length).toBe(2);
  });

  it('should disable delete button and render explanation tooltip for past / <30 min reservations', () => {
    fixture.componentRef.setInput('r', PAST_RESERVATION);
    fixture.detectChanges();

    expect(component.isCancelTooLate()).toBeTrue();

    const element: HTMLElement = fixture.nativeElement;
    const deleteBtn = element.querySelector('.delete-btn') as HTMLButtonElement;
    expect(deleteBtn).toBeTruthy();
    expect(deleteBtn.disabled).toBeTrue();

    const deleteTooltip = element.querySelector('.delete-tooltip');
    expect(deleteTooltip).toBeTruthy();
    expect(deleteTooltip?.textContent).toContain('Too late to cancel reservation. Must be 30 minutes before reservation time');
  });

  it('should enable delete button and not render explanation tooltip for future reservations', () => {
    fixture.componentRef.setInput('r', FUTURE_RESERVATION);
    fixture.detectChanges();

    expect(component.isCancelTooLate()).toBeFalse();

    const element: HTMLElement = fixture.nativeElement;
    const deleteBtn = element.querySelector('.delete-btn') as HTMLButtonElement;
    expect(deleteBtn).toBeTruthy();
    expect(deleteBtn.disabled).toBeFalse();

    const deleteTooltip = element.querySelector('.delete-tooltip');
    expect(deleteTooltip).toBeFalsy();
  });

  it('should render happy hours badge when reservation falls in happy hours window', () => {
    fixture.componentRef.setInput('r', HAPPY_HOUR_RESERVATION);
    fixture.detectChanges();

    expect(component.isHappyHourActive()).toBeTrue();

    const badge = fixture.nativeElement.querySelector('.happy-hours-badge');
    expect(badge).toBeTruthy();
    expect(badge.textContent).toContain('Happy hours');
  });

  it('should not render happy hours badge outside happy hours window', () => {
    fixture.componentRef.setInput('r', NON_HAPPY_HOUR_RESERVATION);
    fixture.detectChanges();

    expect(component.isHappyHourActive()).toBeFalse();

    const badge = fixture.nativeElement.querySelector('.happy-hours-badge');
    expect(badge).toBeFalsy();
  });
});
