package com.travelsphere.food.repository;

import com.travelsphere.food.model.FoodOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FoodOrderRepository extends JpaRepository<FoodOrder, UUID> {

    Optional<FoodOrder> findByOrderRef(String orderRef);

    List<FoodOrder> findByUserIdOrderByOrderedAtDesc(UUID userId);

    List<FoodOrder> findByUserIdAndStatusOrderByOrderedAtDesc(UUID userId, String status);

    List<FoodOrder> findByRestaurantIdOrderByOrderedAtDesc(UUID restaurantId);
}
