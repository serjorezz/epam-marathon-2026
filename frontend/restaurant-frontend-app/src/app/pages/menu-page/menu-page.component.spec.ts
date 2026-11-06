import { TranslationService } from "@app/services/translation/translation.service";
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MenuPageComponent } from './menu-page.component';
import { API_BASE_URL } from '@app/shared/config/api-base-url.token';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { DishesService } from '@app/services/dishes/dishes.service';
import { AuthenticationService } from '@app/auth/services/authentication.service';
import { ToastService } from '@app/services/toast/toast.service';
import { DishListResponse } from '@app/models/dishes/dish-list-response.model';
import { DishState } from '@app/models/enums/dish-state.model';
import { Tokens } from '@app/auth/models/tokens.model';

describe('MenuPageComponent', () => {
  let component: MenuPageComponent;
  let fixture: ComponentFixture<MenuPageComponent>;
  let dishesServiceSpy: jasmine.SpyObj<DishesService>;
  let authServiceSpy: jasmine.SpyObj<AuthenticationService>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;

  const mockDishes: DishListResponse[] = [
    {
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
      isFavorite: true,
    },
    {
      id: 'dish-2',
      name: 'Khinkali',
      imageUrl: 'assets/img/dish.png',
      price: 12,
      state: DishState.Available,
      weight: '300',
      dishType: 'MainCourse',
      description: 'Meat dumplings',
      calories: '400',
      proteins: '18',
      carbohydrates: '40',
      fats: '15',
      vitamins: 'B',
      isFavorite: false,
    },
  ];

  const mockTokens: Tokens = {
    idToken: 'mock-token',
    accessToken: 'mock-access',
  };

  beforeEach(async () => {
    dishesServiceSpy = jasmine.createSpyObj('DishesService', [
      'getDishes',
      'addFavorite',
      'removeFavorite',
    ]);
    dishesServiceSpy.getDishes.and.returnValue(of(mockDishes));
    dishesServiceSpy.addFavorite.and.returnValue(
      of({ message: 'Added', dishId: 'dish-2', isFavorite: true })
    );
    dishesServiceSpy.removeFavorite.and.returnValue(
      of({ message: 'Removed', dishId: 'dish-1', isFavorite: false })
    );

    authServiceSpy = jasmine.createSpyObj('AuthenticationService', ['getTokens', 'getUser'], {
      isAuthorised$: of(true),
    });
    authServiceSpy.getTokens.and.returnValue(mockTokens);
    authServiceSpy.getUser.and.returnValue({
      id: 'user-1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      role: 'Customer',
    });

    toastServiceSpy = jasmine.createSpyObj('ToastService', ['error', 'success']);

    await TestBed.configureTestingModule({
      providers: [
        { provide: API_BASE_URL, useValue: 'https://test.api' },
        provideRouter([]),
        provideHttpClient(),
        { provide: DishesService, useValue: dishesServiceSpy },
        { provide: AuthenticationService, useValue: authServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy },
      ],
      imports: [MenuPageComponent],
    })
      .overrideComponent(MenuPageComponent, {
        set: {
          providers: [{ provide: DishesService, useValue: dishesServiceSpy }],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(MenuPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.inject(TranslationService).setLanguage('en');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load dishes along with their favorite status', () => {
    expect(dishesServiceSpy.getDishes).toHaveBeenCalled();
    expect(component.dishes.length).toBe(2);
    expect(component.dishes[0].isFavorite).toBeTrue();
    expect(component.dishes[1].isFavorite).toBeFalse();
  });

  it('should render Favorites filter button with count of favorite dishes', () => {
    const favFilterBtn = fixture.nativeElement.querySelector('.favorites-filter-btn');
    expect(favFilterBtn).toBeTruthy();
    expect(component.favoritesCount).toBe(1);

    const badge = fixture.nativeElement.querySelector('.favorites-badge');
    expect(badge).toBeTruthy();
    expect(badge.textContent.trim()).toBe('(1)');
  });

  it('should filter dishes to only show favorites when Favorites filter is toggled', () => {
    expect(component.filteredDishes.length).toBe(2);

    component.onToggleFavoritesFilter();
    fixture.detectChanges();

    expect(component.onlyFavorites).toBeTrue();
    expect(component.filteredDishes.length).toBe(1);
    expect(component.filteredDishes[0].id).toBe('dish-1');

    const favFilterBtn = fixture.nativeElement.querySelector('.favorites-filter-btn');
    expect(favFilterBtn.classList.contains('active')).toBeTrue();
  });

  it('should restore all dishes when Favorites filter is toggled off', () => {
    component.onToggleFavoritesFilter(); // turn on
    fixture.detectChanges();
    expect(component.filteredDishes.length).toBe(1);

    component.onToggleFavoritesFilter(); // turn off
    fixture.detectChanges();
    expect(component.onlyFavorites).toBeFalse();
    expect(component.filteredDishes.length).toBe(2);
  });

  it('should update filtered dishes if a dish is unfavorited while Favorites filter is active', () => {
    component.onToggleFavoritesFilter(); // filter active
    fixture.detectChanges();
    expect(component.filteredDishes.length).toBe(1);

    const dishToUnfav = component.dishes[0];
    component.onFavoriteToggle({ dish: dishToUnfav, isFavorite: false });
    fixture.detectChanges();

    expect(component.filteredDishes.length).toBe(0);
    const emptyState = fixture.nativeElement.querySelector('.empty-favorites-state');
    expect(emptyState).toBeTruthy();
    expect(emptyState.textContent.trim()).toBe('No favorite dishes found');
  });

  it('should call addFavorite when an un-favorited dish is toggled by logged-in customer', () => {
    const dishToFav = component.dishes[1];
    component.onFavoriteToggle({ dish: dishToFav, isFavorite: true });

    expect(dishesServiceSpy.addFavorite).toHaveBeenCalledWith('dish-2');
    expect(dishToFav.isFavorite).toBeTrue();
  });

  it('should call removeFavorite when a favorited dish is toggled off by logged-in customer', () => {
    const dishToUnfav = component.dishes[0];
    component.onFavoriteToggle({ dish: dishToUnfav, isFavorite: false });

    expect(dishesServiceSpy.removeFavorite).toHaveBeenCalledWith('dish-1');
    expect(dishToUnfav.isFavorite).toBeFalse();
  });

  it('should prompt to log in and revert favorite toggle if user is unauthenticated', () => {
    authServiceSpy.getTokens.and.returnValue(null);

    const dish = component.dishes[1];
    component.onFavoriteToggle({ dish, isFavorite: true });

    expect(toastServiceSpy.error).toHaveBeenCalledWith(
      'Please log in to add dishes to your favorites.',
      'Unauthorized'
    );
    expect(dishesServiceSpy.addFavorite).not.toHaveBeenCalled();
    expect(dish.isFavorite).toBeFalse();
  });

  it('should NOT render Favorites filter button and should set isCustomerLoggedIn to false when not logged in', () => {
    authServiceSpy.getTokens.and.returnValue(null);
    fixture.detectChanges();

    expect(component.isCustomerLoggedIn).toBeFalse();
    const favFilterBtn = fixture.nativeElement.querySelector('.favorites-filter-btn');
    expect(favFilterBtn).toBeNull();
  });

  it('should not filter to favorites when customer is not logged in', () => {
    authServiceSpy.getTokens.and.returnValue(null);
    component.onlyFavorites = true;
    component.applyFilters();
    expect(component.filteredDishes.length).toBe(2);
  });

  it('should render translated pre-order notice banner in Ukrainian', () => {
    const translationService = TestBed.inject(TranslationService);
    translationService.setLanguage('uk');

    component.isPreOrderEnabled = true;
    component.preOrderReservationId = 'res-123';
    component.preOrderReservationLabel = '48 Rustaveli Avenue, Table table-r3, Вт, 03 лист. 2026, 18:00 - 19:30';
    fixture.detectChanges();

    const noticeEl = fixture.nativeElement.querySelector('.pre-order-notice');
    expect(noticeEl).toBeTruthy();
    expect(noticeEl.textContent).toContain('Ви робите попереднє замовлення для бронювання');
    expect(noticeEl.textContent).toContain('проспект Руставелі, 48');
    expect(noticeEl.textContent).toContain('Стіл table-r3');
    expect(noticeEl.textContent).toContain('Вт, 03 лист. 2026');
    expect(noticeEl.textContent).toContain('18:00 - 19:30');

    translationService.setLanguage('en');
  });

  it('should NOT refetch dishes when category or sort changes — filter the preloaded list client-side', () => {
    // Initial load already happened in beforeEach
    expect(dishesServiceSpy.getDishes).toHaveBeenCalledTimes(1);

    // Simulate user picking a category and then a sort
    component.selectedCategory = 'MainCourse' as never;
    component.applyFilters();
    component.selectedSort = 'PriceAscending' as never;
    component.applyFilters();
    component.loadDishes();

    expect(dishesServiceSpy.getDishes).toHaveBeenCalledTimes(1);
    expect(component.filteredDishes.length).toBe(2);
  });

  it('should sort preloaded dishes by price ascending client-side', () => {
    component.selectedCategory = null;
    component.selectedSort = 'PriceAscending' as never;
    component.applyFilters();

    expect(component.filteredDishes.map((d) => d.price)).toEqual([12, 15]);
    expect(dishesServiceSpy.getDishes).toHaveBeenCalledTimes(1);
  });
});
