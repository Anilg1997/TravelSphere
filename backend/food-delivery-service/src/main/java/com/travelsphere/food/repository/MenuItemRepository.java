package com.travelsphere.food.repository;

import com.travelsphere.food.model.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem, UUID> {

    List<MenuItem> findByRestaurantIdAndIsAvailableTrue(UUID restaurantId);

    List<MenuItem> findByRestaurantIdAndCategoryIgnoreCaseAndIsAvailableTrue(UUID restaurantId, String category);

    List<MenuItem> findByRestaurantId(UUID restaurantId);
}
