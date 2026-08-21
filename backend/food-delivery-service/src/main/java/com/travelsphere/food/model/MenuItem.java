package com.travelsphere.food.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "menu_items", schema = "food_schema")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MenuItem {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "restaurant_id")
    private UUID restaurantId;

    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String category;

    @Column(precision = 8, scale = 2)
    private BigDecimal price;

    private String imageUrl;

    @Column(name = "is_available")
    private boolean isAvailable;

    @Column(name = "is_vegetarian")
    private boolean isVegetarian;

    @Column(name = "is_vegan")
    private boolean isVegan;

    @Column(name = "is_gluten_free")
    private boolean isGlutenFree;

    private String spiceLevel;

    @Column(precision = 5, scale = 1)
    private BigDecimal prepTimeMinutes;
}
