package com.travelsphere.food.controller;

import com.travelsphere.common.dto.ApiResponse;
import com.travelsphere.food.dto.*;
import com.travelsphere.food.service.FoodDeliveryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/food")
@RequiredArgsConstructor
@Tag(name = "Food Delivery", description = "Restaurant search, menu, ordering, and delivery tracking APIs")
public class FoodDeliveryController {

    private final FoodDeliveryService foodDeliveryService;

    @GetMapping("/restaurants/search")
    @Operation(summary = "Search restaurants by city, cuisine, and filters")
    public ResponseEntity<ApiResponse<List<RestaurantResponse>>> searchRestaurants(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String cuisine) {
        RestaurantSearchRequest request = RestaurantSearchRequest.builder()
                .city(city)
                .cuisine(cuisine)
                .build();
        List<RestaurantResponse> results = foodDeliveryService.searchRestaurants(request);
        return ResponseEntity.ok(ApiResponse.success(results, "Restaurants found"));
    }

    @GetMapping("/restaurants/{id}")
    @Operation(summary = "Get restaurant details with full menu")
    public ResponseEntity<ApiResponse<RestaurantResponse>> getRestaurant(@PathVariable String id) {
        RestaurantResponse restaurant = foodDeliveryService.getRestaurantById(id);
        return ResponseEntity.ok(ApiResponse.success(restaurant));
    }

    @GetMapping("/restaurants/city/{city}")
    @Operation(summary = "Get restaurants by city")
    public ResponseEntity<ApiResponse<List<RestaurantResponse>>> getRestaurantsByCity(@PathVariable String city) {
        List<RestaurantResponse> restaurants = foodDeliveryService.getRestaurantsByCity(city);
        return ResponseEntity.ok(ApiResponse.success(restaurants, "Restaurants found in " + city));
    }

    @GetMapping("/restaurants/cuisine/{cuisine}")
    @Operation(summary = "Get restaurants by cuisine type")
    public ResponseEntity<ApiResponse<List<RestaurantResponse>>> getRestaurantsByCuisine(@PathVariable String cuisine) {
        List<RestaurantResponse> restaurants = foodDeliveryService.getRestaurantsByCuisine(cuisine);
        return ResponseEntity.ok(ApiResponse.success(restaurants, "Restaurants found for " + cuisine));
    }

    @GetMapping("/restaurants/{id}/menu")
    @Operation(summary = "Get menu items for a restaurant")
    public ResponseEntity<ApiResponse<List<MenuItemResponse>>> getMenuItems(@PathVariable String id) {
        List<MenuItemResponse> items = foodDeliveryService.getMenuItems(id);
        return ResponseEntity.ok(ApiResponse.success(items));
    }

    @GetMapping("/restaurants/{id}/menu/category/{category}")
    @Operation(summary = "Get menu items by category")
    public ResponseEntity<ApiResponse<List<MenuItemResponse>>> getMenuItemsByCategory(
            @PathVariable String id, @PathVariable String category) {
        List<MenuItemResponse> items = foodDeliveryService.getMenuItemsByCategory(id, category);
        return ResponseEntity.ok(ApiResponse.success(items));
    }

    @PostMapping("/orders")
    @Operation(summary = "Place a food order")
    public ResponseEntity<ApiResponse<OrderResponse>> placeOrder(
            @Valid @RequestBody PlaceOrderRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        OrderResponse order = foodDeliveryService.placeOrder(request, userId);
        return ResponseEntity.ok(ApiResponse.success(order, "Order placed successfully"));
    }

    @GetMapping("/orders/{ref}")
    @Operation(summary = "Get order details by reference")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrder(@PathVariable String ref) {
        OrderResponse order = foodDeliveryService.getOrder(ref);
        return ResponseEntity.ok(ApiResponse.success(order));
    }

    @GetMapping("/orders/user/{userId}")
    @Operation(summary = "Get all orders for a user")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getUserOrders(@PathVariable String userId) {
        List<OrderResponse> orders = foodDeliveryService.getUserOrders(userId);
        return ResponseEntity.ok(ApiResponse.success(orders));
    }

    @PutMapping("/orders/{ref}/status")
    @Operation(summary = "Update order status")
    public ResponseEntity<ApiResponse<OrderResponse>> updateOrderStatus(
            @PathVariable String ref,
            @RequestParam String status) {
        OrderResponse order = foodDeliveryService.updateOrderStatus(ref, status);
        return ResponseEntity.ok(ApiResponse.success(order, "Order status updated"));
    }

    @PutMapping("/orders/{ref}/cancel")
    @Operation(summary = "Cancel a food order")
    public ResponseEntity<ApiResponse<OrderResponse>> cancelOrder(@PathVariable String ref) {
        OrderResponse order = foodDeliveryService.cancelOrder(ref);
        return ResponseEntity.ok(ApiResponse.success(order, "Order cancelled successfully"));
    }
}
