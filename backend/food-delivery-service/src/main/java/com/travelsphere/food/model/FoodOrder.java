package com.travelsphere.food.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "food_orders", schema = "food_schema")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FoodOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "order_ref", unique = true)
    private String orderRef;

    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "restaurant_id")
    private UUID restaurantId;

    @Column(name = "restaurant_name")
    private String restaurantName;

    @Column(name = "delivery_address", columnDefinition = "TEXT")
    private String deliveryAddress;

    @Column(name = "delivery_latitude", precision = 10, scale = 7)
    private BigDecimal deliveryLatitude;

    @Column(name = "delivery_longitude", precision = 10, scale = 7)
    private BigDecimal deliveryLongitude;

    @Column(name = "subtotal")
    private BigDecimal subtotal;

    @Column(name = "delivery_fee")
    private BigDecimal deliveryFee;

    @Column(name = "tax")
    private BigDecimal tax;

    @Column(name = "total_amount")
    private BigDecimal totalAmount;

    private String status;

    @Column(name = "special_instructions", columnDefinition = "TEXT")
    private String specialInstructions;

    @Column(name = "estimated_delivery_time")
    private LocalDateTime estimatedDeliveryTime;

    @Column(name = "ordered_at")
    private LocalDateTime orderedAt;

    @Column(name = "delivered_at")
    private LocalDateTime deliveredAt;

    @Column(name = "payment_method")
    private String paymentMethod;
}
