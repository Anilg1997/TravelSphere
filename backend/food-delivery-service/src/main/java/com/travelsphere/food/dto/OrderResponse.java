package com.travelsphere.food.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {
    private String orderRef;
    private String restaurantId;
    private String restaurantName;
    private String deliveryAddress;
    private List<OrderItemResponse> items;
    private BigDecimal subtotal;
    private BigDecimal deliveryFee;
    private BigDecimal tax;
    private BigDecimal totalAmount;
    private String status;
    private String specialInstructions;
    private LocalDateTime estimatedDeliveryTime;
    private LocalDateTime orderedAt;
    private LocalDateTime deliveredAt;
    private String paymentMethod;
}
