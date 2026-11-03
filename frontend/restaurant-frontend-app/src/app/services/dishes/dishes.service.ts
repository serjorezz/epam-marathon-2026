import { inject, Injectable } from '@angular/core';
import { API_BASE_URL } from '@app/shared/config/api-base-url.token';
import { DishListResponse } from '@app/models/dishes/dish-list-response.model';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';

export interface FavoriteResponse {
  message: string;
  dishId: string;
  isFavorite: boolean;
}

export interface FavoriteDishIdsResponse {
  dishIds: string[];
}

@Injectable({ providedIn: 'root' })
export class DishesService {
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly http = inject(HttpClient);

  getPopularDishes(): Observable<DishListResponse[]> {
    return this.http.get<DishListResponse[]>(`${this.baseUrl}/dishes/popular`);
  }

  // /dishes
  // /dishes?dishType=MainCourse&sortBy=PriceDescending&name=Spaghetti
  getDishes(dishType?: string, sortBy?: string, name?: string): Observable<DishListResponse[]> {
    let params = new HttpParams();

    if (dishType) {
      params = params.set('dishType', dishType);
    }
    if (sortBy) {
      params = params.set('sortBy', sortBy);
    }
    if (name) {
      params = params.set('name', name);
    }

    return this.http.get<DishListResponse[]>(`${this.baseUrl}/dishes`, { params });
  }

  addFavorite(dishId: string): Observable<FavoriteResponse> {
    return this.http.post<FavoriteResponse>(`${this.baseUrl}/dishes/${dishId}/favorite`, {});
  }

  removeFavorite(dishId: string): Observable<FavoriteResponse> {
    return this.http.delete<FavoriteResponse>(`${this.baseUrl}/dishes/${dishId}/favorite`);
  }

  getFavorites(): Observable<FavoriteDishIdsResponse> {
    return this.http.get<FavoriteDishIdsResponse>(`${this.baseUrl}/dishes/favorites`);
  }
}
