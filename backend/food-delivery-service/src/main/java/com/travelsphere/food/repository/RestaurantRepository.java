package com.travelsphere.food.repository;

import com.travelsphere.food.model.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RestaurantRepository extends JpaRepository<Restaurant, UUID> {

    List<Restaurant> findByCityIgnoreCaseAndIsActiveTrue(String city);

    List<Restaurant> findByCuisineIgnoreCaseAndIsActiveTrue(String cuisine);

    List<Restaurant> findByCityIgnoreCaseAndCuisineIgnoreCaseAndIsActiveTrue(String city, String cuisine);

    List<Restaurant> findByIsActiveTrue();

    @Query("SELECT r FROM Restaurant r WHERE r.isActive = true AND r.city ILIKE %:city% AND r.cuisine ILIKE %:cuisine% ORDER BY r.rating DESC")
    List<Restaurant> search(@Param("city") String city, @Param("cuisine") String cuisine);

    @Query("SELECT r FROM Restaurant r WHERE r.isActive = true AND r.rating >= :minRating ORDER BY r.rating DESC")
    List<Restaurant> findTopRated(@Param("minRating") double minRating);
}
