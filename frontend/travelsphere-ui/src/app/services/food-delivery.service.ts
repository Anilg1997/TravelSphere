import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Restaurant, MenuItem, FoodOrderRequest, FoodOrderResponse } from '../models/food-delivery.model';

@Injectable({ providedIn: 'root' })
export class FoodDeliveryService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/food`;

  searchRestaurants(city?: string, cuisine?: string): Observable<Restaurant[]> {
    let params = new HttpParams();
    if (city) params = params.set('city', city);
    if (cuisine) params = params.set('cuisine', cuisine);
    return this.http.get<ApiResponse<Restaurant[]>>(`${this.baseUrl}/restaurants/search`, { params })
      .pipe(map(r => r.data || []));
  }

  getRestaurant(id: string): Observable<Restaurant> {
    return this.http.get<ApiResponse<Restaurant>>(`${this.baseUrl}/restaurants/${id}`)
      .pipe(map(r => r.data!));
  }

  getRestaurantsByCity(city: string): Observable<Restaurant[]> {
    return this.http.get<ApiResponse<Restaurant[]>>(`${this.baseUrl}/restaurants/city/${city}`)
      .pipe(map(r => r.data || []));
  }

  getRestaurantsByCuisine(cuisine: string): Observable<Restaurant[]> {
    return this.http.get<ApiResponse<Restaurant[]>>(`${this.baseUrl}/restaurants/cuisine/${cuisine}`)
      .pipe(map(r => r.data || []));
  }

  getMenuItems(restaurantId: string): Observable<MenuItem[]> {
    return this.http.get<ApiResponse<MenuItem[]>>(`${this.baseUrl}/restaurants/${restaurantId}/menu`)
      .pipe(map(r => r.data || []));
  }

  getMenuItemsByCategory(restaurantId: string, category: string): Observable<MenuItem[]> {
    return this.http.get<ApiResponse<MenuItem[]>>(`${this.baseUrl}/restaurants/${restaurantId}/menu/category/${category}`)
      .pipe(map(r => r.data || []));
  }

  placeOrder(request: FoodOrderRequest): Observable<FoodOrderResponse> {
    return this.http.post<ApiResponse<FoodOrderResponse>>(`${this.baseUrl}/orders`, request)
      .pipe(map(r => r.data!));
  }

  getOrder(ref: string): Observable<FoodOrderResponse> {
    return this.http.get<ApiResponse<FoodOrderResponse>>(`${this.baseUrl}/orders/${ref}`)
      .pipe(map(r => r.data!));
  }

  getUserOrders(userId: string): Observable<FoodOrderResponse[]> {
    return this.http.get<ApiResponse<FoodOrderResponse[]>>(`${this.baseUrl}/orders/user/${userId}`)
      .pipe(map(r => r.data || []));
  }

  updateOrderStatus(ref: string, status: string): Observable<FoodOrderResponse> {
    return this.http.put<ApiResponse<FoodOrderResponse>>(`${this.baseUrl}/orders/${ref}/status`, null, { params: { status } })
      .pipe(map(r => r.data!));
  }

  cancelOrder(ref: string): Observable<FoodOrderResponse> {
    return this.http.put<ApiResponse<FoodOrderResponse>>(`${this.baseUrl}/orders/${ref}/cancel`, {})
      .pipe(map(r => r.data!));
  }
}
