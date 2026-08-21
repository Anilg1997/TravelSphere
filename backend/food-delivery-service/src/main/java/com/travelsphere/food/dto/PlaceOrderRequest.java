package com.travelsphere.food.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlaceOrderRequest {
    @NotNull
    private UUID restaurantId;

    @NotBlank
    private String deliveryAddress;

    private BigDecimal deliveryLatitude;
    private BigDecimal deliveryLongitude;

    @NotNull
    private List<OrderItemRequest> items;

    private String specialInstructions;
    private String paymentMethod;
}

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
class OrderItemRequest {
    @NotNull
    private UUID menuItemId;

    @NotBlank
    private String itemName;

    @Min(1)
    private int quantity;

    private String specialInstructions;
}
