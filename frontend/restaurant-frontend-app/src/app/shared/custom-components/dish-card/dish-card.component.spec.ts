import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DishCardComponent } from './dish-card.component';
import { DishListResponse } from '@app/models/dishes/dish-list-response.model';
import { DishState } from '@app/models/enums/dish-state.model';

describe('DishCardComponent', () => {
  let component: DishCardComponent;
  let fixture: ComponentFixture<DishCardComponent>;

  const dish: DishListResponse = {
    id: 'dish-1',
    name: 'Khachapuri',
    imageUrl: 'assets/img/dish.png',
    price: 15,
    state: DishState.Available,
    weight: '350',
    dishType: 'MainCourse',
    description: 'Georgian cheese bread',
    calories: '500',
    proteins: '20',
    carbohydrates: '45',
    fats: '25',
    vitamins: 'A, B',
    isFavorite: false,
    allergens: [],
    isSpicy: false,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DishCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DishCardComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('dish', dish);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render favorite star button and tooltip in idle state', () => {
    const favoriteBtn = fixture.nativeElement.querySelector('.favorite-btn');
    expect(favoriteBtn).toBeTruthy();
    expect(favoriteBtn.classList.contains('is-favorite')).toBeFalse();

    const tooltip = fixture.nativeElement.querySelector('.favorite-tooltip');
    expect(tooltip).toBeTruthy();
    expect(tooltip.textContent.trim()).toBe('Add to favorite');
    expect(favoriteBtn.getAttribute('aria-label')).toBe('Add to favorite');
  });

  it('should render filled golden star and "In favorite" when dish is already a favorite', () => {
    const favDish: DishListResponse = { ...dish, isFavorite: true };
    fixture.componentRef.setInput('dish', favDish);
    fixture.detectChanges();

    const favoriteBtn = fixture.nativeElement.querySelector('.favorite-btn');
    expect(favoriteBtn.classList.contains('is-favorite')).toBeTrue();

    const tooltip = fixture.nativeElement.querySelector('.favorite-tooltip');
    expect(tooltip).toBeTruthy();
    expect(tooltip.textContent.trim()).toBe('In favorite');
    expect(favoriteBtn.getAttribute('aria-label')).toBe('In favorite');
  });

  it('should toggle favorite on click, update tooltip to "In favorite", emit favoriteToggle, and stop propagation', () => {
    let emitted: { dish: DishListResponse; isFavorite: boolean } | null = null;
    component.favoriteToggle.subscribe((val) => (emitted = val));

    let cardClicked = false;
    component.dishClicked.subscribe(() => (cardClicked = true));

    const favoriteBtn = fixture.nativeElement.querySelector('.favorite-btn') as HTMLButtonElement;
    favoriteBtn.click();
    fixture.detectChanges();

    expect(component.isFavorite()).toBeTrue();
    expect(emitted).toEqual(jasmine.objectContaining({ dish, isFavorite: true }));
    expect(cardClicked).toBeFalse();

    expect(favoriteBtn.classList.contains('is-favorite')).toBeTrue();
    const tooltip = fixture.nativeElement.querySelector('.favorite-tooltip');
    expect(tooltip.textContent.trim()).toBe('In favorite');
  });

  it('should untoggle favorite on second click, update tooltip back to "Add to favorite", and emit removal', () => {
    const favDish: DishListResponse = { ...dish, isFavorite: true };
    fixture.componentRef.setInput('dish', favDish);
    fixture.detectChanges();

    let emitted: { dish: DishListResponse; isFavorite: boolean } | null = null;
    component.favoriteToggle.subscribe((val) => (emitted = val));

    const favoriteBtn = fixture.nativeElement.querySelector('.favorite-btn') as HTMLButtonElement;
    favoriteBtn.click();
    fixture.detectChanges();

    expect(component.isFavorite()).toBeFalse();
    expect(emitted).toEqual(jasmine.objectContaining({ dish: favDish, isFavorite: false }));

    expect(favoriteBtn.classList.contains('is-favorite')).toBeFalse();
    const tooltip = fixture.nativeElement.querySelector('.favorite-tooltip');
    expect(tooltip.textContent.trim()).toBe('Add to favorite');
  });

  it('should NOT render favorite button when showFavorite is false', () => {
    fixture.componentRef.setInput('showFavorite', false);
    fixture.detectChanges();

    const favoriteBtn = fixture.nativeElement.querySelector('.favorite-btn');
    expect(favoriteBtn).toBeNull();
  });

  it('should not emit favoriteToggle when onFavoriteClick is called and showFavorite is false', () => {
    fixture.componentRef.setInput('showFavorite', false);
    fixture.detectChanges();

    let emitted = false;
    component.favoriteToggle.subscribe(() => (emitted = true));

    const fakeEvent = new MouseEvent('click');
    component.onFavoriteClick(fakeEvent);

    expect(emitted).toBeFalse();
  });

  it('should render nut circular badge in top left when dish contains allergens', () => {
    const dishWithNuts: DishListResponse = {
      ...dish,
      allergens: ['nuts'],
      isSpicy: false,
    };
    fixture.componentRef.setInput('dish', dishWithNuts);
    fixture.detectChanges();

    const allergenBadge = fixture.nativeElement.querySelector('.allergen-badge');
    expect(allergenBadge).toBeTruthy();
    expect(allergenBadge.getAttribute('aria-label')).toBe('Contains allergy ingredients');

    const tooltip = allergenBadge.querySelector('.dietary-tooltip');
    expect(tooltip).toBeTruthy();
    expect(tooltip.textContent.trim()).toBe('Contains allergy ingredients');

    const spicyBadge = fixture.nativeElement.querySelector('.spicy-badge');
    expect(spicyBadge).toBeNull();
  });

  it('should render flame circular badge in top left when dish is spicy', () => {
    const spicyDish: DishListResponse = {
      ...dish,
      allergens: [],
      isSpicy: true,
    };
    fixture.componentRef.setInput('dish', spicyDish);
    fixture.detectChanges();

    const spicyBadge = fixture.nativeElement.querySelector('.spicy-badge');
    expect(spicyBadge).toBeTruthy();
    expect(spicyBadge.getAttribute('aria-label')).toBe('Spicy food');

    const tooltip = spicyBadge.querySelector('.dietary-tooltip');
    expect(tooltip).toBeTruthy();
    expect(tooltip.textContent.trim()).toBe('Spicy food');

    const allergenBadge = fixture.nativeElement.querySelector('.allergen-badge');
    expect(allergenBadge).toBeNull();
  });

  it('should render both circular badges when dish has allergens and is spicy', () => {
    const bothDish: DishListResponse = {
      ...dish,
      allergens: ['nuts', 'cilantro'],
      isSpicy: true,
    };
    fixture.componentRef.setInput('dish', bothDish);
    fixture.detectChanges();

    const allergenBadge = fixture.nativeElement.querySelector('.allergen-badge');
    const spicyBadge = fixture.nativeElement.querySelector('.spicy-badge');

    expect(allergenBadge).toBeTruthy();
    expect(spicyBadge).toBeTruthy();
  });

  it('should render regular price when happyHourDiscount is not provided', () => {
    const priceText = fixture.nativeElement.querySelector('.dish-price');
    expect(priceText).toBeTruthy();
    expect(priceText.textContent).toContain('$15.00');
    expect(fixture.nativeElement.querySelector('.old-price')).toBeNull();
  });

  it('should render crossed-out red old price with discount percentage and lower price under it when happyHourDiscount > 0', () => {
    fixture.componentRef.setInput('happyHourDiscount', 10);
    fixture.detectChanges();

    const oldPrice = fixture.nativeElement.querySelector('.old-price');
    expect(oldPrice).toBeTruthy();
    expect(oldPrice.textContent).toContain('$15.00');

    const discountBadge = fixture.nativeElement.querySelector('.discount-badge');
    expect(discountBadge).toBeTruthy();
    expect(discountBadge.textContent).toContain('-10%');

    const discountedPrice = fixture.nativeElement.querySelector('.discounted-price');
    expect(discountedPrice).toBeTruthy();
    expect(discountedPrice.textContent).toContain('$13.50');
  });

  it("should render 'Sold out' badge replacing price when dish is OutOfStock", () => {
    const soldOutDish: DishListResponse = { ...dish, state: DishState.OutOfStock };
    fixture.componentRef.setInput("dish", soldOutDish);
    fixture.detectChanges();

    const card = fixture.nativeElement.querySelector(".dish-card");
    expect(card.classList.contains("unavailable")).toBeTrue();

    const soldOutBadge = fixture.nativeElement.querySelector(".sold-out-badge");
    expect(soldOutBadge).toBeTruthy();
    expect(soldOutBadge.textContent.trim()).toBe('Sold out');
    expect(fixture.nativeElement.querySelector(".dish-price")).toBeNull();
  });

  it("should treat Rkatsiteli Qvevri Amber Wine as sold out", () => {
    const rkatsiteli: DishListResponse = {
      ...dish,
      id: "dish-rkatsiteli-wine",
      name: "Rkatsiteli Qvevri Amber Wine",
      state: "Available",
    };
    fixture.componentRef.setInput("dish", rkatsiteli);
    fixture.detectChanges();

    expect(component.isUnavailable()).toBeTrue();
    const soldOutBadge = fixture.nativeElement.querySelector(".sold-out-badge");
    expect(soldOutBadge).toBeTruthy();
    expect(soldOutBadge.textContent.trim()).toBe('Sold out');
  });

  it("should still emit dishClicked on sold-out card click when pre-order is disabled", () => {
    const soldOutDish: DishListResponse = { ...dish, state: DishState.OutOfStock };
    fixture.componentRef.setInput("dish", soldOutDish);
    fixture.detectChanges();

    let clicked = false;
    component.dishClicked.subscribe(() => (clicked = true));

    const card = fixture.nativeElement.querySelector(".dish-card");
    card.click();

    expect(clicked).toBeTrue();
  });
});