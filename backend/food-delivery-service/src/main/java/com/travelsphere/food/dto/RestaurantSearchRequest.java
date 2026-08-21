package com.travelsphere.food.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RestaurantSearchRequest {
    private String city;
    private String cuisine;
    private Double latitude;
    private Double longitude;
    private Double maxDistanceKm;
    private String sortBy; // rating, deliveryTime, distance
    private Integer limit;
    private Integer offset;
}
