package com.travelsphere.food.service;

import com.travelsphere.food.dto.*;

import java.util.List;

public interface FoodDeliveryService {

    List<RestaurantResponse> searchRestaurants(RestaurantSearchRequest request);

    RestaurantResponse getRestaurantById(String id);

    List<RestaurantResponse> getRestaurantsByCity(String city);

    List<RestaurantResponse> getRestaurantsByCuisine(String cuisine);

    List<MenuItemResponse> getMenuItems(String restaurantId);

    List<MenuItemResponse> getMenuItemsByCategory(String restaurantId, String category);

    OrderResponse placeOrder(PlaceOrderRequest request, String userId);

    OrderResponse getOrder(String orderRef);

    List<OrderResponse> getUserOrders(String userId);

    OrderResponse updateOrderStatus(String orderRef, String status);

    OrderResponse cancelOrder(String orderRef);
}
