import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';

import { Order } from '@app/models/orders/order.model';
import { NotSubmittedOrderComponent } from './not-submitted-order.component';

describe('NotSubmittedOrderComponent', () => {
  let component: NotSubmittedOrderComponent;
  let fixture: ComponentFixture<NotSubmittedOrderComponent>;

  const order = {
    orderId: 'order-1',
    status: 0,
    reservationId: 'res-1',
    reservationAddress: 'Test address',
    reservationTime: '19:00',
    orderItems: [
      {
        quantity: 2,
        state: 0,
        dish: {
          id: 'dish-mushroom-khinkali',
          name: 'Wild Mushroom Khinkali (4 pcs)',
          price: 15,
          allergens: ['cilantro'],
          removableAllergens: ['cilantro'],
          isSpicy: true,
          canBeNonSpicy: true,
        },
      },
    ],
  } as unknown as Order;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotSubmittedOrderComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(
      NotSubmittedOrderComponent,
    );

    component = fixture.componentInstance;

    fixture.componentRef.setInput('order', order);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit submitted with the order ID', () => {
    spyOn(component.submitted, 'emit');

    component.submit();

    expect(
      component.submitted.emit,
    ).toHaveBeenCalledWith('order-1');
  });

  it('should calculate the total price when outside happy hours', () => {
    expect(component.totalPrice()).toBe(30);
  });

  it('should calculate discounted total and show old price crossed out with discount when reservation is during happy hours', () => {
    const happyHourOrder = {
      ...order,
      reservationTime: '13:00',
    } as unknown as Order;

    fixture.componentRef.setInput('order', happyHourOrder);
    fixture.detectChanges();

    expect(component.isHappyHourActive()).toBeTrue();
    expect(component.happyHourDiscount()).toBe(10);
    // 15 * 0.9 = 13.5 per item; 2 items = 27
    expect(component.totalPrice()).toBe(27);

    const oldPrice = fixture.nativeElement.querySelector('.old-price');
    expect(oldPrice).toBeTruthy();
    expect(oldPrice.textContent).toContain('$30.00');

    const discountBadge = fixture.nativeElement.querySelector('.discount-badge');
    expect(discountBadge).toBeTruthy();
    expect(discountBadge.textContent).toContain('-10%');

    const discountedPrice = fixture.nativeElement.querySelector('.discounted-price');
    expect(discountedPrice).toBeTruthy();
    expect(discountedPrice.textContent).toContain('$27.00');
  });

  it('should render customizable checkboxes for removable allergen and non-spicy toggle', () => {
    const checkboxes = fixture.nativeElement.querySelectorAll('.custom-checkbox');
    expect(checkboxes.length).toBe(2);

    const labels = Array.from(checkboxes).map((cb: any) => cb.textContent.trim());
    expect(labels).toContain('No cilantro');
    expect(labels).toContain('Non-spicy');
  });

  it('should toggle allergen removal and non-spicy state', () => {
    expect(component.isAllergenRemoved('dish-mushroom-khinkali', 'cilantro')).toBeFalse();
    expect(component.isNonSpicy('dish-mushroom-khinkali')).toBeFalse();

    component.toggleAllergen('dish-mushroom-khinkali', 'cilantro');
    component.toggleNonSpicy('dish-mushroom-khinkali');

    expect(component.isAllergenRemoved('dish-mushroom-khinkali', 'cilantro')).toBeTrue();
    expect(component.isNonSpicy('dish-mushroom-khinkali')).toBeTrue();

    // Untoggle
    component.toggleAllergen('dish-mushroom-khinkali', 'cilantro');
    expect(component.isAllergenRemoved('dish-mushroom-khinkali', 'cilantro')).toBeFalse();
  });

  it('should render only the allergy badge icon without checkboxes when allergen is not removable (e.g. Baklava)', () => {
    const baklavaOrder = {
      ...order,
      orderItems: [
        {
          quantity: 1,
          state: 0,
          dish: {
            id: 'dish-honey-walnut-baklava',
            name: 'Honey Walnut Baklava',
            price: 11,
            allergens: ['nuts'],
            removableAllergens: [],
            isSpicy: false,
          },
        },
      ],
    } as unknown as Order;

    fixture.componentRef.setInput('order', baklavaOrder);
    fixture.detectChanges();

    const checkboxes = fixture.nativeElement.querySelectorAll('.custom-checkbox');
    expect(checkboxes.length).toBe(0);

    const allergenBadge = fixture.nativeElement.querySelector('.cart-dietary-badge.allergen-badge');
    expect(allergenBadge).toBeTruthy();
    expect(allergenBadge.getAttribute('aria-label')).toBe('Contains nuts (cannot be removed)');
  });
});
