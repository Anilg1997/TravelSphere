package com.travelsphere.food.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RestaurantResponse {
    private String id;
    private String name;
    private String description;
    private String cuisine;
    private String address;
    private String city;
    private String country;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private String phoneNumber;
    private String imageUrl;
    private int avgDeliveryTimeMinutes;
    private BigDecimal rating;
    private int reviewCount;
    private BigDecimal minOrderAmount;
    private BigDecimal deliveryFee;
    private List<String> tags;
    private List<MenuItemResponse> menuItems;
}
