package com.travelsphere.common.feign.fallback;

import com.travelsphere.common.dto.ApiResponse;
import com.travelsphere.common.feign.FoodDeliveryClient;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.openfeign.FallbackFactory;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@Slf4j
public class FoodDeliveryClientFallbackFactory implements FallbackFactory<FoodDeliveryClient> {

    @Override
    public FoodDeliveryClient create(Throwable cause) {
        log.error("Food delivery service is unavailable. Cause: {}", cause.getMessage());
        return new FoodDeliveryClient() {
            @Override
            public ApiResponse<Map<String, Object>> searchRestaurants(String city, String cuisine) {
                log.warn("Fallback: searchRestaurants - service unavailable");
                return ApiResponse.error("Food delivery service is currently unavailable. Please try again later.");
            }

            @Override
            public ApiResponse<Map<String, Object>> getRestaurant(String id) {
                log.warn("Fallback: getRestaurant({}) - service unavailable", id);
                return ApiResponse.error("Food delivery service is currently unavailable.");
            }

            @Override
            public ApiResponse<Map<String, Object>> getRestaurantsByCity(String city) {
                log.warn("Fallback: getRestaurantsByCity({}) - service unavailable", city);
                return ApiResponse.error("Food delivery service is currently unavailable.");
            }

            @Override
            public ApiResponse<Map<String, Object>> getMenuItems(String id) {
                log.warn("Fallback: getMenuItems({}) - service unavailable", id);
                return ApiResponse.error("Food delivery service is currently unavailable.");
            }

            @Override
            public ApiResponse<Map<String, Object>> placeOrder(Map<String, Object> request, String userId) {
                log.warn("Fallback: placeOrder - food delivery service unavailable");
                return ApiResponse.error("Food delivery service is currently unavailable. Please try again later.");
            }

            @Override
            public ApiResponse<Map<String, Object>> getOrder(String ref) {
                log.warn("Fallback: getOrder({}) - service unavailable", ref);
                return ApiResponse.error("Food delivery service is currently unavailable.");
            }

            @Override
            public ApiResponse<Map<String, Object>> getUserOrders(String userId) {
                log.warn("Fallback: getUserOrders({}) - service unavailable", userId);
                return ApiResponse.error("Food delivery service is currently unavailable.");
            }

            @Override
            public ApiResponse<Map<String, Object>> updateOrderStatus(String ref, String status) {
                log.warn("Fallback: updateOrderStatus({}) - service unavailable", ref);
                return ApiResponse.error("Food delivery service is currently unavailable.");
            }

            @Override
            public ApiResponse<Map<String, Object>> cancelOrder(String ref) {
                log.warn("Fallback: cancelOrder({}) - service unavailable", ref);
                return ApiResponse.error("Food delivery service is currently unavailable.");
            }
        };
    }
}
