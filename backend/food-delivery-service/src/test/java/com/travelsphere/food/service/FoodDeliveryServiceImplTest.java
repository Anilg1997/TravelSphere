package com.travelsphere.food.service;

import com.travelsphere.food.dto.*;
import com.travelsphere.food.model.FoodOrder;
import com.travelsphere.food.model.MenuItem;
import com.travelsphere.food.model.OrderItem;
import com.travelsphere.food.model.Restaurant;
import com.travelsphere.food.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.kafka.core.KafkaTemplate;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FoodDeliveryServiceImplTest {

    @Mock private RestaurantRepository restaurantRepository;
    @Mock private MenuItemRepository menuItemRepository;
    @Mock private FoodOrderRepository orderRepository;
    @Mock private OrderItemRepository orderItemRepository;
    @Mock private KafkaTemplate<String, Object> kafkaTemplate;

    @InjectMocks private FoodDeliveryServiceImpl foodDeliveryService;

    private UUID restaurantId;
    private UUID menuItemId;
    private UUID orderId;
    private Restaurant restaurant;
    private MenuItem menuItem;

    @BeforeEach
    void setUp() {
        restaurantId = UUID.randomUUID();
        menuItemId = UUID.randomUUID();
        orderId = UUID.randomUUID();

        restaurant = Restaurant.builder()
                .id(restaurantId)
                .name("Spice Garden")
                .description("Indian cuisine restaurant")
                .cuisine("Indian")
                .address("123 MG Road")
                .city("Mumbai")
                .country("India")
                .isActive(true)
                .avgDeliveryTimeMinutes(30)
                .rating(4.5)
                .reviewCount(120)
                .minOrderAmount(new BigDecimal("200"))
                .deliveryFee(new BigDecimal("40"))
                .build();

        menuItem = MenuItem.builder()
                .id(menuItemId)
                .restaurantId(restaurantId)
                .name("Butter Chicken")
                .description("Creamy tomato-based curry")
                .category("Main Course")
                .price(new BigDecimal("350"))
                .isAvailable(true)
                .isVegetarian(false)
                .build();
    }

    // ── Search Tests ──────────────────────────────────────

    @Test
    void searchRestaurantsByCity() {
        when(restaurantRepository.findByCityIgnoreCaseAndIsActiveTrue("Mumbai"))
                .thenReturn(List.of(restaurant));

        RestaurantSearchRequest request = RestaurantSearchRequest.builder().city("Mumbai").build();
        List<RestaurantResponse> results = foodDeliveryService.searchRestaurants(request);

        assertEquals(1, results.size());
        assertEquals("Spice Garden", results.get(0).getName());
    }

    @Test
    void searchRestaurantsByCuisine() {
        when(restaurantRepository.findByCuisineIgnoreCaseAndIsActiveTrue("Indian"))
                .thenReturn(List.of(restaurant));

        RestaurantSearchRequest request = RestaurantSearchRequest.builder().cuisine("Indian").build();
        List<RestaurantResponse> results = foodDeliveryService.searchRestaurants(request);

        assertEquals(1, results.size());
        assertEquals("Indian", results.get(0).getCuisine());
    }

    @Test
    void searchRestaurantsByCityAndCuisine() {
        when(restaurantRepository.findByCityIgnoreCaseAndCuisineIgnoreCaseAndIsActiveTrue("Mumbai", "Indian"))
                .thenReturn(List.of(restaurant));

        RestaurantSearchRequest request = RestaurantSearchRequest.builder()
                .city("Mumbai").cuisine("Indian").build();
        List<RestaurantResponse> results = foodDeliveryService.searchRestaurants(request);

        assertEquals(1, results.size());
    }

    @Test
    void searchRestaurantsNoFilters() {
        when(restaurantRepository.findByIsActiveTrue()).thenReturn(List.of(restaurant));

        RestaurantSearchRequest request = RestaurantSearchRequest.builder().build();
        List<RestaurantResponse> results = foodDeliveryService.searchRestaurants(request);

        assertEquals(1, results.size());
    }

    @Test
    void searchRestaurantsNoResults() {
        when(restaurantRepository.findByCityIgnoreCaseAndIsActiveTrue("Delhi"))
                .thenReturn(List.of());

        RestaurantSearchRequest request = RestaurantSearchRequest.builder().city("Delhi").build();
        List<RestaurantResponse> results = foodDeliveryService.searchRestaurants(request);

        assertTrue(results.isEmpty());
    }

    // ── Get Restaurant Tests ──────────────────────────────

    @Test
    void getRestaurantByIdSuccess() {
        when(restaurantRepository.findById(restaurantId)).thenReturn(Optional.of(restaurant));
        when(menuItemRepository.findByRestaurantIdAndIsAvailableTrue(restaurantId))
                .thenReturn(List.of(menuItem));

        RestaurantResponse response = foodDeliveryService.getRestaurantById(restaurantId.toString());

        assertEquals("Spice Garden", response.getName());
        assertNotNull(response.getMenuItems());
        assertEquals(1, response.getMenuItems().size());
        assertEquals("Butter Chicken", response.getMenuItems().get(0).getName());
    }

    @Test
    void getRestaurantByIdNotFoundThrows() {
        when(restaurantRepository.findById(any())).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class,
                () -> foodDeliveryService.getRestaurantById(UUID.randomUUID().toString()));
    }

    // ── Place Order Tests ────────────────────────────────

    @Test
    void placeOrderSuccess() {
        when(restaurantRepository.findById(restaurantId)).thenReturn(Optional.of(restaurant));
        when(menuItemRepository.findById(menuItemId)).thenReturn(Optional.of(menuItem));
        when(orderRepository.save(any(FoodOrder.class))).thenAnswer(inv -> {
            FoodOrder order = inv.getArgument(0);
            order.setId(orderId);
            return order;
        });
        when(orderItemRepository.saveAll(any())).thenReturn(List.of());

        PlaceOrderRequest request = PlaceOrderRequest.builder()
                .restaurantId(restaurantId)
                .deliveryAddress("456 Park Lane, Mumbai")
                .items(List.of(
                        PlaceOrderRequest.OrderItemRequest.builder()
                                .menuItemId(menuItemId)
                                .quantity(2)
                                .build()
                ))
                .build();

        OrderResponse response = foodDeliveryService.placeOrder(request, UUID.randomUUID().toString());

        assertNotNull(response);
        assertEquals("PLACED", response.getStatus());
        assertEquals("Spice Garden", response.getRestaurantName());
        assertNotNull(response.getOrderRef());
        assertTrue(response.getOrderRef().startsWith("TS-FD-"));
        assertEquals(0, response.getSubtotal().compareTo(new BigDecimal("700"))); // 350 * 2
        assertEquals(0, response.getDeliveryFee().compareTo(new BigDecimal("40")));
        // Tax: 700 * 0.05 = 35
        assertEquals(0, response.getTax().compareTo(new BigDecimal("35.00")));
        // Total: 700 + 40 + 35 = 775
        assertEquals(0, response.getTotalAmount().compareTo(new BigDecimal("775.00")));

        verify(kafkaTemplate).send(eq("ts.food.order.placed"), anyString(), any());
    }

    @Test
    void placeOrderRestaurantNotFoundThrows() {
        when(restaurantRepository.findById(any())).thenReturn(Optional.empty());

        PlaceOrderRequest request = PlaceOrderRequest.builder()
                .restaurantId(UUID.randomUUID())
                .build();

        assertThrows(IllegalArgumentException.class,
                () -> foodDeliveryService.placeOrder(request, UUID.randomUUID().toString()));
    }

    @Test
    void placeOrderRestaurantInactiveThrows() {
        restaurant.setActive(false);
        when(restaurantRepository.findById(restaurantId)).thenReturn(Optional.of(restaurant));

        PlaceOrderRequest request = PlaceOrderRequest.builder()
                .restaurantId(restaurantId)
                .build();

        assertThrows(IllegalStateException.class,
                () -> foodDeliveryService.placeOrder(request, UUID.randomUUID().toString()));
    }

    @Test
    void placeOrderMenuItemUnavailableThrows() {
        menuItem.setAvailable(false);
        when(restaurantRepository.findById(restaurantId)).thenReturn(Optional.of(restaurant));
        when(menuItemRepository.findById(menuItemId)).thenReturn(Optional.of(menuItem));

        PlaceOrderRequest request = PlaceOrderRequest.builder()
                .restaurantId(restaurantId)
                .items(List.of(
                        PlaceOrderRequest.OrderItemRequest.builder()
                                .menuItemId(menuItemId)
                                .quantity(1)
                                .build()
                ))
                .build();

        assertThrows(IllegalStateException.class,
                () -> foodDeliveryService.placeOrder(request, UUID.randomUUID().toString()));
    }

    @Test
    void placeOrderBelowMinimumAmountThrows() {
        restaurant.setMinOrderAmount(new BigDecimal("1000"));
        when(restaurantRepository.findById(restaurantId)).thenReturn(Optional.of(restaurant));
        when(menuItemRepository.findById(menuItemId)).thenReturn(Optional.of(menuItem));

        PlaceOrderRequest request = PlaceOrderRequest.builder()
                .restaurantId(restaurantId)
                .items(List.of(
                        PlaceOrderRequest.OrderItemRequest.builder()
                                .menuItemId(menuItemId)
                                .quantity(1) // 350 < 1000 minimum
                                .build()
                ))
                .build();

        assertThrows(IllegalArgumentException.class,
                () -> foodDeliveryService.placeOrder(request, UUID.randomUUID().toString()));
    }

    // ── Get Order Tests ──────────────────────────────────

    @Test
    void getOrderSuccess() {
        FoodOrder order = FoodOrder.builder()
                .id(orderId).orderRef("TS-FD-123456")
                .restaurantId(restaurantId).restaurantName("Spice Garden")
                .status("PLACED").subtotal(new BigDecimal("700"))
                .deliveryFee(new BigDecimal("40")).tax(new BigDecimal("35"))
                .totalAmount(new BigDecimal("775"))
                .orderedAt(LocalDateTime.now())
                .build();

        OrderItem item = OrderItem.builder()
                .id(UUID.randomUUID()).orderId(orderId)
                .menuItemId(menuItemId).itemName("Butter Chicken")
                .quantity(2).unitPrice(new BigDecimal("350"))
                .totalPrice(new BigDecimal("700"))
                .build();

        when(orderRepository.findByOrderRef("TS-FD-123456")).thenReturn(Optional.of(order));
        when(orderItemRepository.findByOrderId(orderId)).thenReturn(List.of(item));

        OrderResponse response = foodDeliveryService.getOrder("TS-FD-123456");

        assertNotNull(response);
        assertEquals("TS-FD-123456", response.getOrderRef());
        assertEquals(1, response.getItems().size());
    }

    @Test
    void getOrderNotFoundThrows() {
        when(orderRepository.findByOrderRef("INVALID")).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class,
                () -> foodDeliveryService.getOrder("INVALID"));
    }

    // ── Cancel Order Tests ──────────────────────────────

    @Test
    void cancelOrderSuccess() {
        FoodOrder order = FoodOrder.builder()
                .id(orderId).orderRef("TS-FD-123456")
                .status("PLACED")
                .build();

        when(orderRepository.findByOrderRef("TS-FD-123456")).thenReturn(Optional.of(order));
        when(orderRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(orderItemRepository.findByOrderId(orderId)).thenReturn(List.of());

        OrderResponse response = foodDeliveryService.cancelOrder("TS-FD-123456");

        assertEquals("CANCELLED", response.getStatus());
        verify(kafkaTemplate).send(eq("ts.food.order.cancelled"), anyString(), any());
    }

    @Test
    void cancelOrderAlreadyDeliveredThrows() {
        FoodOrder order = FoodOrder.builder()
                .id(orderId).orderRef("TS-FD-123456")
                .status("DELIVERED")
                .build();

        when(orderRepository.findByOrderRef("TS-FD-123456")).thenReturn(Optional.of(order));

        assertThrows(IllegalStateException.class,
                () -> foodDeliveryService.cancelOrder("TS-FD-123456"));
    }

    @Test
    void cancelOrderAlreadyCancelledThrows() {
        FoodOrder order = FoodOrder.builder()
                .id(orderId).orderRef("TS-FD-123456")
                .status("CANCELLED")
                .build();

        when(orderRepository.findByOrderRef("TS-FD-123456")).thenReturn(Optional.of(order));

        assertThrows(IllegalStateException.class,
                () -> foodDeliveryService.cancelOrder("TS-FD-123456"));
    }

    // ── Update Order Status Tests ───────────────────────

    @Test
    void updateOrderStatusSuccess() {
        FoodOrder order = FoodOrder.builder()
                .id(orderId).orderRef("TS-FD-123456")
                .status("PLACED")
                .build();

        when(orderRepository.findByOrderRef("TS-FD-123456")).thenReturn(Optional.of(order));
        when(orderRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(orderItemRepository.findByOrderId(orderId)).thenReturn(List.of());

        OrderResponse response = foodDeliveryService.updateOrderStatus("TS-FD-123456", "PREPARING");

        assertEquals("PREPARING", response.getStatus());
        verify(kafkaTemplate).send(eq("ts.food.order.status"), anyString(), any());
    }

    @Test
    void updateOrderStatusToDeliveredSetsDeliveredAt() {
        FoodOrder order = FoodOrder.builder()
                .id(orderId).orderRef("TS-FD-123456")
                .status("OUT_FOR_DELIVERY")
                .build();

        when(orderRepository.findByOrderRef("TS-FD-123456")).thenReturn(Optional.of(order));
        when(orderRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(orderItemRepository.findByOrderId(orderId)).thenReturn(List.of());

        OrderResponse response = foodDeliveryService.updateOrderStatus("TS-FD-123456", "DELIVERED");

        assertEquals("DELIVERED", response.getStatus());
        assertNotNull(response.getDeliveredAt());
    }

    // ── Get User Orders Tests ───────────────────────────

    @Test
    void getUserOrdersReturnsList() {
        UUID userId = UUID.randomUUID();
        FoodOrder order = FoodOrder.builder()
                .id(orderId).orderRef("TS-FD-123456")
                .userId(userId).restaurantId(restaurantId)
                .restaurantName("Spice Garden").status("PLACED")
                .subtotal(new BigDecimal("700"))
                .orderedAt(LocalDateTime.now())
                .build();

        when(orderRepository.findByUserIdOrderByOrderedAtDesc(userId))
                .thenReturn(List.of(order));
        when(orderItemRepository.findByOrderId(orderId)).thenReturn(List.of());

        List<OrderResponse> orders = foodDeliveryService.getUserOrders(userId.toString());

        assertEquals(1, orders.size());
        assertEquals("TS-FD-123456", orders.get(0).getOrderRef());
    }

    @Test
    void getUserOrdersEmptyList() {
        UUID userId = UUID.randomUUID();
        when(orderRepository.findByUserIdOrderByOrderedAtDesc(userId))
                .thenReturn(List.of());

        List<OrderResponse> orders = foodDeliveryService.getUserOrders(userId.toString());

        assertTrue(orders.isEmpty());
    }
}
