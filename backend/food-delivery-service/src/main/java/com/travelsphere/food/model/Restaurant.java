package com.travelsphere.food.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "restaurants", schema = "food_schema")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Restaurant {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String cuisine;

    private String address;
    private String city;
    private String country;

    @Column(precision = 10, scale = 7)
    private BigDecimal latitude;

    @Column(precision = 10, scale = 7)
    private BigDecimal longitude;

    private String phoneNumber;
    private String imageUrl;

    @Column(name = "avg_delivery_time_minutes")
    private int avgDeliveryTimeMinutes;

    @Column(precision = 3, scale = 1)
    private BigDecimal rating;

    @Column(name = "review_count")
    private int reviewCount;

    @Column(name = "is_active")
    private boolean isActive;

    @Column(name = "min_order_amount")
    private BigDecimal minOrderAmount;

    @Column(name = "delivery_fee")
    private BigDecimal deliveryFee;

    @Column(columnDefinition = "TEXT[]")
    private String[] tags;
}
