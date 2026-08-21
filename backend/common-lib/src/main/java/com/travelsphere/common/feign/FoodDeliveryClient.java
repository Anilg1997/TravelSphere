package com.travelsphere.common.feign;

import com.travelsphere.common.dto.ApiResponse;
import com.travelsphere.common.feign.fallback.FoodDeliveryClientFallbackFactory;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@FeignClient(name = "food-delivery-service", path = "/api/v1/food", fallbackFactory = FoodDeliveryClientFallbackFactory.class)
public interface FoodDeliveryClient {

    @GetMapping("/restaurants/search")
    ApiResponse<Map<String, Object>> searchRestaurants(
            @RequestParam(value = "city", required = false) String city,
            @RequestParam(value = "cuisine", required = false) String cuisine);

    @GetMapping("/restaurants/{id}")
    ApiResponse<Map<String, Object>> getRestaurant(@PathVariable("id") String id);

    @GetMapping("/restaurants/city/{city}")
    ApiResponse<Map<String, Object>> getRestaurantsByCity(@PathVariable("city") String city);

    @GetMapping("/restaurants/{id}/menu")
    ApiResponse<Map<String, Object>> getMenuItems(@PathVariable("id") String id);

    @PostMapping("/orders")
    ApiResponse<Map<String, Object>> placeOrder(@RequestBody Map<String, Object> request,
                                                @RequestHeader(value = "X-User-Id", required = false) String userId);

    @GetMapping("/orders/{ref}")
    ApiResponse<Map<String, Object>> getOrder(@PathVariable("ref") String ref);

    @GetMapping("/orders/user/{userId}")
    ApiResponse<Map<String, Object>> getUserOrders(@PathVariable("userId") String userId);

    @PutMapping("/orders/{ref}/status")
    ApiResponse<Map<String, Object>> updateOrderStatus(@PathVariable("ref") String ref,
                                                        @RequestParam("status") String status);

    @PutMapping("/orders/{ref}/cancel")
    ApiResponse<Map<String, Object>> cancelOrder(@PathVariable("ref") String ref);
}
