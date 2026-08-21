package com.travelsphere.food.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MenuItemResponse {
    private String id;
    private String restaurantId;
    private String name;
    private String description;
    private String category;
    private BigDecimal price;
    private String imageUrl;
    private boolean isAvailable;
    private boolean isVegetarian;
    private boolean isVegan;
    private boolean isGlutenFree;
    private String spiceLevel;
    private BigDecimal prepTimeMinutes;
}
