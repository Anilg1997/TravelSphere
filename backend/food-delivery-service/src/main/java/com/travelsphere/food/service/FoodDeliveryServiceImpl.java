package com.travelsphere.food.service;

import com.travelsphere.food.dto.*;
import com.travelsphere.food.model.FoodOrder;
import com.travelsphere.food.model.MenuItem;
import com.travelsphere.food.model.OrderItem;
import com.travelsphere.food.model.Restaurant;
import com.travelsphere.food.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FoodDeliveryServiceImpl implements FoodDeliveryService {

    private final RestaurantRepository restaurantRepository;
    private final MenuItemRepository menuItemRepository;
    private final FoodOrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    private static final BigDecimal TAX_RATE = new BigDecimal("0.05"); // 5% tax

    @Override
    public List<RestaurantResponse> searchRestaurants(RestaurantSearchRequest request) {
        List<Restaurant> restaurants;

        if (request.getCity() != null && request.getCuisine() != null) {
            restaurants = restaurantRepository.findByCityIgnoreCaseAndCuisineIgnoreCaseAndIsActiveTrue(
                    request.getCity(), request.getCuisine());
        } else if (request.getCity() != null) {
            restaurants = restaurantRepository.findByCityIgnoreCaseAndIsActiveTrue(request.getCity());
        } else if (request.getCuisine() != null) {
            restaurants = restaurantRepository.findByCuisineIgnoreCaseAndIsActiveTrue(request.getCuisine());
        } else {
            restaurants = restaurantRepository.findByIsActiveTrue();
        }

        return restaurants.stream()
                .map(this::toRestaurantResponse)
                .collect(Collectors.toList());
    }

    @Override
    public RestaurantResponse getRestaurantById(String id) {
        Restaurant restaurant = restaurantRepository.findById(UUID.fromString(id))
                .orElseThrow(() -> new IllegalArgumentException("Restaurant not found with id: " + id));
        RestaurantResponse response = toRestaurantResponse(restaurant);
        List<MenuItem> menuItems = menuItemRepository.findByRestaurantIdAndIsAvailableTrue(restaurant.getId());
        response.setMenuItems(menuItems.stream()
                .map(this::toMenuItemResponse)
                .collect(Collectors.toList()));
        return response;
    }

    @Override
    public List<RestaurantResponse> getRestaurantsByCity(String city) {
        return restaurantRepository.findByCityIgnoreCaseAndIsActiveTrue(city).stream()
                .map(this::toRestaurantResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<RestaurantResponse> getRestaurantsByCuisine(String cuisine) {
        return restaurantRepository.findByCuisineIgnoreCaseAndIsActiveTrue(cuisine).stream()
                .map(this::toRestaurantResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<MenuItemResponse> getMenuItems(String restaurantId) {
        UUID restId = UUID.fromString(restaurantId);
        restaurantRepository.findById(restId)
                .orElseThrow(() -> new IllegalArgumentException("Restaurant not found"));
        return menuItemRepository.findByRestaurantIdAndIsAvailableTrue(restId).stream()
                .map(this::toMenuItemResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<MenuItemResponse> getMenuItemsByCategory(String restaurantId, String category) {
        UUID restId = UUID.fromString(restaurantId);
        restaurantRepository.findById(restId)
                .orElseThrow(() -> new IllegalArgumentException("Restaurant not found"));
        return menuItemRepository.findByRestaurantIdAndCategoryIgnoreCaseAndIsAvailableTrue(restId, category).stream()
                .map(this::toMenuItemResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public OrderResponse placeOrder(PlaceOrderRequest request, String userId) {
        Restaurant restaurant = restaurantRepository.findById(request.getRestaurantId())
                .orElseThrow(() -> new IllegalArgumentException("Restaurant not found"));

        if (!restaurant.isActive()) {
            throw new IllegalStateException("Restaurant is currently not accepting orders");
        }

        // Validate and calculate item prices
        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal subtotal = BigDecimal.ZERO;

        for (var itemReq : request.getItems()) {
            MenuItem menuItem = menuItemRepository.findById(itemReq.getMenuItemId())
                    .orElseThrow(() -> new IllegalArgumentException("Menu item not found: " + itemReq.getMenuItemId()));

            if (!menuItem.isAvailable()) {
                throw new IllegalStateException("Item is currently unavailable: " + menuItem.getName());
            }

            if (!menuItem.getRestaurantId().equals(restaurant.getId())) {
                throw new IllegalArgumentException("Menu item does not belong to this restaurant");
            }

            BigDecimal itemTotal = menuItem.getPrice().multiply(BigDecimal.valueOf(itemReq.getQuantity()));

            OrderItem orderItem = OrderItem.builder()
                    .menuItemId(menuItem.getId())
                    .itemName(menuItem.getName())
                    .quantity(itemReq.getQuantity())
                    .unitPrice(menuItem.getPrice())
                    .totalPrice(itemTotal)
                    .specialInstructions(itemReq.getSpecialInstructions())
                    .build();

            orderItems.add(orderItem);
            subtotal = subtotal.add(itemTotal);
        }

        // Check minimum order amount
        if (restaurant.getMinOrderAmount() != null && subtotal.compareTo(restaurant.getMinOrderAmount()) < 0) {
            throw new IllegalArgumentException("Minimum order amount is " + restaurant.getMinOrderAmount());
        }

        BigDecimal deliveryFee = restaurant.getDeliveryFee() != null ? restaurant.getDeliveryFee() : BigDecimal.ZERO;
        BigDecimal tax = subtotal.multiply(TAX_RATE).setScale(2, RoundingMode.HALF_UP);
        BigDecimal totalAmount = subtotal.add(deliveryFee).add(tax);

        String orderRef = "TS-FD-" + System.currentTimeMillis() % 1000000;

        FoodOrder order = FoodOrder.builder()
                .orderRef(orderRef)
                .userId(userId != null ? UUID.fromString(userId) : null)
                .restaurantId(restaurant.getId())
                .restaurantName(restaurant.getName())
                .deliveryAddress(request.getDeliveryAddress())
                .deliveryLatitude(request.getDeliveryLatitude())
                .deliveryLongitude(request.getDeliveryLongitude())
                .subtotal(subtotal)
                .deliveryFee(deliveryFee)
                .tax(tax)
                .totalAmount(totalAmount)
                .status("PLACED")
                .specialInstructions(request.getSpecialInstructions())
                .estimatedDeliveryTime(LocalDateTime.now().plusMinutes(restaurant.getAvgDeliveryTimeMinutes()))
                .orderedAt(LocalDateTime.now())
                .paymentMethod(request.getPaymentMethod())
                .build();

        order = orderRepository.save(order);

        // Save order items
        for (OrderItem item : orderItems) {
            item.setOrderId(order.getId());
        }
        orderItemRepository.saveAll(orderItems);

        kafkaTemplate.send("ts.food.order.placed", orderRef, order);

        return toOrderResponse(order, orderItems);
    }

    @Override
    public OrderResponse getOrder(String orderRef) {
        FoodOrder order = orderRepository.findByOrderRef(orderRef)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderRef));
        List<OrderItem> items = orderItemRepository.findByOrderId(order.getId());
        return toOrderResponse(order, items);
    }

    @Override
    public List<OrderResponse> getUserOrders(String userId) {
        return orderRepository.findByUserIdOrderByOrderedAtDesc(UUID.fromString(userId)).stream()
                .map(order -> {
                    List<OrderItem> items = orderItemRepository.findByOrderId(order.getId());
                    return toOrderResponse(order, items);
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public OrderResponse updateOrderStatus(String orderRef, String status) {
        FoodOrder order = orderRepository.findByOrderRef(orderRef)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderRef));

        order.setStatus(status);
        if ("DELIVERED".equals(status)) {
            order.setDeliveredAt(LocalDateTime.now());
        }

        order = orderRepository.save(order);
        List<OrderItem> items = orderItemRepository.findByOrderId(order.getId());

        kafkaTemplate.send("ts.food.order.status", orderRef, order);

        return toOrderResponse(order, items);
    }

    @Override
    @Transactional
    public OrderResponse cancelOrder(String orderRef) {
        FoodOrder order = orderRepository.findByOrderRef(orderRef)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderRef));

        String currentStatus = order.getStatus();
        if ("DELIVERED".equals(currentStatus) || "CANCELLED".equals(currentStatus)) {
            throw new IllegalStateException("Cannot cancel an order that is " + currentStatus);
        }

        order.setStatus("CANCELLED");
        order = orderRepository.save(order);
        List<OrderItem> items = orderItemRepository.findByOrderId(order.getId());

        kafkaTemplate.send("ts.food.order.cancelled", orderRef, order);

        return toOrderResponse(order, items);
    }

    private RestaurantResponse toRestaurantResponse(Restaurant restaurant) {
        return RestaurantResponse.builder()
                .id(restaurant.getId().toString())
                .name(restaurant.getName())
                .description(restaurant.getDescription())
                .cuisine(restaurant.getCuisine())
                .address(restaurant.getAddress())
                .city(restaurant.getCity())
                .country(restaurant.getCountry())
                .latitude(restaurant.getLatitude())
                .longitude(restaurant.getLongitude())
                .phoneNumber(restaurant.getPhoneNumber())
                .imageUrl(restaurant.getImageUrl())
                .avgDeliveryTimeMinutes(restaurant.getAvgDeliveryTimeMinutes())
                .rating(restaurant.getRating())
                .reviewCount(restaurant.getReviewCount())
                .minOrderAmount(restaurant.getMinOrderAmount())
                .deliveryFee(restaurant.getDeliveryFee())
                .tags(restaurant.getTags() != null ? List.of(restaurant.getTags()) : List.of())
                .build();
    }

    private MenuItemResponse toMenuItemResponse(MenuItem item) {
        return MenuItemResponse.builder()
                .id(item.getId().toString())
                .restaurantId(item.getRestaurantId().toString())
                .name(item.getName())
                .description(item.getDescription())
                .category(item.getCategory())
                .price(item.getPrice())
                .imageUrl(item.getImageUrl())
                .isAvailable(item.isAvailable())
                .isVegetarian(item.isVegetarian())
                .isVegan(item.isVegan())
                .isGlutenFree(item.isGlutenFree())
                .spiceLevel(item.getSpiceLevel())
                .prepTimeMinutes(item.getPrepTimeMinutes())
                .build();
    }

    private OrderResponse toOrderResponse(FoodOrder order, List<OrderItem> items) {
        List<OrderItemResponse> itemResponses = items.stream()
                .map(item -> OrderItemResponse.builder()
                        .id(item.getId().toString())
                        .itemName(item.getItemName())
                        .quantity(item.getQuantity())
                        .unitPrice(item.getUnitPrice())
                        .totalPrice(item.getTotalPrice())
                        .specialInstructions(item.getSpecialInstructions())
                        .build())
                .collect(Collectors.toList());

        return OrderResponse.builder()
                .orderRef(order.getOrderRef())
                .restaurantId(order.getRestaurantId().toString())
                .restaurantName(order.getRestaurantName())
                .deliveryAddress(order.getDeliveryAddress())
                .items(itemResponses)
                .subtotal(order.getSubtotal())
                .deliveryFee(order.getDeliveryFee())
                .tax(order.getTax())
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus())
                .specialInstructions(order.getSpecialInstructions())
                .estimatedDeliveryTime(order.getEstimatedDeliveryTime())
                .orderedAt(order.getOrderedAt())
                .deliveredAt(order.getDeliveredAt())
                .paymentMethod(order.getPaymentMethod())
                .build();
    }
}
