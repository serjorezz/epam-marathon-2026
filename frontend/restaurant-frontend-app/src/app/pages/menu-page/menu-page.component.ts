import { evaluateHappyHours } from '@app/shared/helpers/happy-hours.helper';
import { TranslatePipe } from "@app/shared/pipes/translate.pipe";
import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { DishCardComponent } from '@app/shared/custom-components/dish-card/dish-card.component';
import { SkeletonDishCardComponent } from '@app/shared/custom-components/skeleton';
import { DishesService } from '@app/services/dishes/dishes.service';
import { DishListResponse } from '@app/models/dishes/dish-list-response.model';
import { MainCoverImageComponent } from '@app/shared/custom-components/main-cover-image/main-cover-image.component';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { DishSort } from '@app/models/enums/dish-sort.model';
import { DishType } from '@app/models/enums/dish-type.model';
import { DishSortingLabels, DishTypeLabels } from '@app/shared/mappers/dish-enum.mapper';
import { DishModalComponent } from '@app/components/dish-modal/dish-modal.component';
import { PreOrdersService } from '@app/services/pre-orders/pre-orders.service';
import { ToastService } from '@app/services/toast/toast.service';
import { AuthenticationService } from '@app/auth/services/authentication.service';

const FAVORITES_STORAGE_KEY = 'gt_favorite_dishes';

@Component({
  selector: 'app-menu-page',
  standalone: true,
  imports: [
    RouterModule,
    DishCardComponent,
    SkeletonDishCardComponent,
    MainCoverImageComponent,
    DishModalComponent,
    TranslatePipe,
  ],
  templateUrl: './menu-page.component.html',
  styleUrl: './menu-page.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  providers: [DishesService],
})
export class MenuPageComponent implements OnInit, OnDestroy {
  private readonly toast = inject(ToastService);
  private readonly authService = inject(AuthenticationService);
  private readonly dishesService = inject(DishesService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly orderService = inject(PreOrdersService);

  isLoading = true;
  dishes: DishListResponse[] = [];
  filteredDishes: DishListResponse[] = [];

  /** Popularity rank of each dish (backend returns dishes sorted by popularity desc by default). */
  private popularityRank = new Map<string, number>();
  private dishesLoaded = false;

  isPreOrderEnabled = false;
  preOrderReservationId?: string;
  preOrderReservationLabel?: string;
  isHappyHourActive = false;
  happyHourDiscount: number | null = null;

  sortOptions = Object.values(DishSort);
  sortLabels = DishSortingLabels;

  menuCategories = Object.values(DishType);
  menuCategoryLabels = DishTypeLabels;

  selectedCategory: DishType | null = null; // initially show all
  selectedSort: DishSort = DishSort.PopularityDescending;
  onlyFavorites = false;
  private authSubscription?: Subscription;

  get isCustomerLoggedIn(): boolean {
    const tokens = this.authService.getTokens();
    if (!tokens?.idToken) {
      return false;
    }
    const user = typeof this.authService.getUser === 'function' ? this.authService.getUser() : null;
    if (user?.role && user.role !== 'Customer') {
      return false;
    }
    return true;
  }

  get favoritesCount(): number {
    return this.dishes.filter((dish) => dish.isFavorite).length;
  }

  ngOnInit(): void {
    this.authSubscription = this.authService.isAuthorised$.subscribe((isAuth) => {
      if (!isAuth) {
        if (this.onlyFavorites) {
          this.onlyFavorites = false;
        }
        for (const dish of this.dishes) {
          dish.isFavorite = false;
        }
        this.applyFilters();
      }

      // Favorites are auth-dependent — refetch when login state changes
      if (this.dishesLoaded) {
        this.dishesLoaded = false;
        this.loadDishes();
      }
    });

    this.route.queryParams.subscribe((params) => {
      const preOrder = params['preOrder'];
      this.isPreOrderEnabled = !!preOrder;
      if (this.isPreOrderEnabled) {
        this.preOrderReservationId = params['reservationId'];
        this.preOrderReservationLabel = params['reservationLabel'];
        if (this.preOrderReservationLabel) {
          this.preOrderReservationLabel = this.preOrderReservationLabel
            .replace(
              /^(?:You are making a pre-order for (?:a|the) reservation|Ви робите попереднє замовлення для бронювання|თქვენ აკეთებთ წინასწარ შეკვეთას ჯავშნისთვის)\s*/i,
              ''
            )
            .replace(/\.$/, '')
            .trim();
        }

        const happyHoursEval = evaluateHappyHours({
          locationId: params['locationId'],
          startTime: params['startTime'],
          reservationLabel: params['reservationLabel'],
        });
        this.isHappyHourActive = happyHoursEval.isHappyHour;
        this.happyHourDiscount = this.isHappyHourActive ? happyHoursEval.discountPercentage : null;

        if (!this.preOrderReservationId) {
          console.error('Pre-order is enabled but no reservation ID provided.');
          this.toast.error('Pre-order is enabled but no reservation ID provided.', 'Error');
          this.isPreOrderEnabled = false;
        }
      } else {
        this.isHappyHourActive = false;
        this.happyHourDiscount = null;
      }

      const category = params['category'] as DishType;
      const sort = params['sort'] as DishSort;
      const favorites = params['favorites'] === 'true';

      this.selectedCategory =
        category && Object.values(DishType).includes(category) ? category : null;
      this.selectedSort =
        sort && Object.values(DishSort).includes(sort) ? sort : DishSort.PopularityDescending;
      this.onlyFavorites = this.isCustomerLoggedIn && favorites;

      // Fetch the full catalog once — category/sort/favorites are applied client-side.
      this.loadDishes();
      this.applyFilters();
    });
  }

  ngOnDestroy(): void {
    this.authSubscription?.unsubscribe();
  }

  loadDishes(): void {
    if (this.dishesLoaded) {
      return;
    }

    this.isLoading = true;

    // Fetch the whole catalog once — no category/sort params, so filtering
    // and sorting happen client-side without extra backend requests.
    this.dishesService.getDishes().subscribe({
      next: (data) => {
      const localFavorites = this.isCustomerLoggedIn ? this.getLocalFavorites() : new Set<string>();

      this.dishes = data.map((dish) => ({
        ...dish,
        imageUrl: dish.imageUrl || 'assets/img/dish.png',
        name: dish.name || 'Unknown Dish',
        price: dish.price || 0,
        weight: dish.weight || 'N/A',
        description: dish.description || 'N/A',
        state: dish.state || 'N/A',
        dishType: dish.dishType || 'N/A',
        calories: dish.calories || '0',
        proteins: dish.proteins || '0',
        fats: dish.fats || '0',
        carbohydrates: dish.carbohydrates || '0',
        vitamins: dish.vitamins || '0',
        isFavorite: this.isCustomerLoggedIn
          ? (dish.isFavorite !== undefined ? dish.isFavorite : localFavorites.has(dish.id))
          : false,
      }));

      // The backend returns dishes sorted by popularity desc by default —
      // remember that order as the popularity ranking for client-side sorts.
      this.popularityRank = new Map(
        this.dishes.map((dish, index) => [dish.id, index]),
      );
      this.dishesLoaded = true;

      this.applyFilters();
      this.isLoading = false;
    },
    error: () => {
      this.isLoading = false;
    }});
  }

  applyFilters(): void {
    let result = this.dishes;

    if (this.selectedCategory) {
      result = result.filter((dish) => dish.dishType === this.selectedCategory);
    }

    if (this.onlyFavorites && this.isCustomerLoggedIn) {
      result = result.filter((dish) => dish.isFavorite);
    }

    this.filteredDishes = this.sortDishes(result);
  }

  private sortDishes(dishes: DishListResponse[]): DishListResponse[] {
    const rankOf = (dish: DishListResponse) => this.popularityRank.get(dish.id) ?? 0;
    const byPopularity = (a: DishListResponse, b: DishListResponse) => rankOf(a) - rankOf(b);

    switch (this.selectedSort) {
      case DishSort.PriceAscending:
        return [...dishes].sort(
          (a, b) => a.price - b.price || byPopularity(a, b),
        );
      case DishSort.PriceDescending:
        return [...dishes].sort(
          (a, b) => b.price - a.price || byPopularity(a, b),
        );
      case DishSort.PopularityAscending:
        return [...dishes].sort((a, b) => byPopularity(b, a));
      case DishSort.PopularityDescending:
      default:
        return [...dishes].sort(byPopularity);
    }
  }

  onToggleFavoritesFilter(): void {
    if (!this.isCustomerLoggedIn) {
      return;
    }
    this.onlyFavorites = !this.onlyFavorites;
    this.applyFilters();

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        category: this.selectedCategory || null,
        sort: this.selectedSort,
        favorites: this.onlyFavorites ? 'true' : null,
      },
      queryParamsHandling: 'merge',
    });
  }

  onFavoriteToggle(event: { dish: DishListResponse; isFavorite: boolean }): void {
    if (!this.isCustomerLoggedIn) {
      this.toast.error('Please log in to add dishes to your favorites.', 'Unauthorized');
      event.dish.isFavorite = !event.isFavorite;
      return;
    }

    // Apply optimistic update immediately
    event.dish.isFavorite = event.isFavorite;
    this.saveLocalFavorite(event.dish.id, event.isFavorite);
    if (this.onlyFavorites) {
      this.applyFilters();
    }

    const operation$ = event.isFavorite
      ? this.dishesService.addFavorite(event.dish.id)
      : this.dishesService.removeFavorite(event.dish.id);

    operation$.subscribe({
      next: () => {
        // Successfully synchronized with backend database
      },
      error: () => {
        // Revert on error
        event.dish.isFavorite = !event.isFavorite;
        this.saveLocalFavorite(event.dish.id, event.dish.isFavorite);
        if (this.onlyFavorites) {
          this.applyFilters();
        }
        this.toast.error(
          event.isFavorite ? 'Failed to add to favorites' : 'Failed to remove from favorites',
          'Error'
        );
      },
    });
  }

  private getLocalFavorites(): Set<string> {
    try {
      const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return new Set<string>(parsed);
        }
      }
    } catch {
      // Storage unavailable or invalid JSON
    }
    return new Set<string>();
  }

  private saveLocalFavorite(dishId: string, isFavorite: boolean): void {
    try {
      const favorites = this.getLocalFavorites();
      if (isFavorite) {
        favorites.add(dishId);
      } else {
        favorites.delete(dishId);
      }
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify([...favorites]));
    } catch {
      // Storage unavailable
    }
  }

  onCategorySelected(category: DishType): void {
    this.selectedCategory = this.selectedCategory === category ? null : category;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        category: this.selectedCategory || null,
        sort: this.selectedSort,
        favorites: this.onlyFavorites ? 'true' : null,
      },
      queryParamsHandling: 'merge',
    });
  }

  onSortChanged(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const sort = selectElement.value as DishSort;
    this.selectedSort = sort;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        category: this.selectedCategory || null,
        sort: this.selectedSort,
        favorites: this.onlyFavorites ? 'true' : null,
      },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  selectedDish: DishListResponse | null = null;

  openModal(dish: DishListResponse) {
    this.selectedDish = dish;
  }

  closeModal() {
    this.selectedDish = null;
  }

  addDishToCart(dish: DishListResponse): void {
    this.orderService
      .addDishToPreOrderByReservationId(this.preOrderReservationId!, dish, 1)
      .subscribe({
        next: () => {
          this.toast.success('Dish added to cart successfully!', 'Success');
        },
        error: (err) => {
          console.error('Failed to add dish to pre-order:', err);
        },
      });
  }
}
