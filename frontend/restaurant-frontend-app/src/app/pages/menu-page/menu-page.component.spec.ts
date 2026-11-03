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

    authServiceSpy = jasmine.createSpyObj('AuthenticationService', ['getTokens']);
    authServiceSpy.getTokens.and.returnValue(mockTokens);

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

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load dishes along with their favorite status', () => {
    expect(dishesServiceSpy.getDishes).toHaveBeenCalled();
    expect(component.dishes.length).toBe(2);
    expect(component.dishes[0].isFavorite).toBeTrue();
    expect(component.dishes[1].isFavorite).toBeFalse();
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
});
