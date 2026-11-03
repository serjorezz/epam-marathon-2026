import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DishModalComponent } from './dish-modal.component';
import { DishListResponse } from '@app/models/dishes/dish-list-response.model';

describe('DishModalComponent', () => {
  let component: DishModalComponent;
  let fixture: ComponentFixture<DishModalComponent>;

  const baseDish: DishListResponse = {
    id: 'dish-custom',
    name: 'Sample Dish',
    imageUrl: 'assets/img/dish.png',
    price: 12,
    state: 'Available',
    weight: '300g',
    dishType: 'MainCourse',
    description: 'Tasty Georgian dish',
    calories: '400',
    proteins: '15g',
    carbohydrates: '30g',
    fats: '10g',
    vitamins: 'A, C',
    allergens: [],
    isSpicy: false,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DishModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DishModalComponent);
    component = fixture.componentInstance;
    component.dish = baseDish;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render allergens and non-removable warning when dish has baked-in allergens', () => {
    component.dish = {
      ...baseDish,
      id: 'dish-honey-walnut-baklava',
      name: 'Honey Walnut Baklava',
      allergens: ['nuts'],
      removableAllergens: [],
      isSpicy: false,
    };
    fixture.detectChanges();

    const dietaryInfo = fixture.nativeElement.querySelector('.dish-dietary-info');
    expect(dietaryInfo).toBeTruthy();

    const allergenRow = dietaryInfo.querySelector('.allergen-item');
    expect(allergenRow).toBeTruthy();
    expect(allergenRow.textContent).toContain('Allergens:');
    expect(allergenRow.textContent).toContain('Nuts (cannot be removed)');
  });

  it('should render spice information and note about non-spicy preparation when canBeNonSpicy is true', () => {
    component.dish = {
      ...baseDish,
      id: 'dish-mushroom-khinkali',
      name: 'Wild Mushroom Khinkali',
      allergens: ['cilantro'],
      removableAllergens: ['cilantro'],
      isSpicy: true,
      canBeNonSpicy: true,
    };
    fixture.detectChanges();

    const dietaryInfo = fixture.nativeElement.querySelector('.dish-dietary-info');
    expect(dietaryInfo).toBeTruthy();

    const spicyRow = dietaryInfo.querySelector('.spicy-item');
    expect(spicyRow).toBeTruthy();
    expect(spicyRow.textContent).toContain('Spicy food');
    expect(spicyRow.textContent).toContain('Can be prepared non-spicy');
  });
});
