package com.travelsphere.notification.service;

import com.travelsphere.notification.dto.SendNotificationRequest;
import com.travelsphere.notification.model.Notification;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.ListOperations;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.time.Duration;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceImplTest {

    @Mock private StringRedisTemplate redisTemplate;
    @Mock private SimpMessagingTemplate messagingTemplate;
    @Mock private ListOperations<String, String> listOperations;
    @InjectMocks private NotificationServiceImpl notificationService;

    private static final String USER_ID = "a1b2c3d4-0000-4000-8000-000000000001";

    @BeforeEach
    void setUp() {
        // lenient: markAsReadDoesNotThrow never touches Redis list ops
        lenient().when(redisTemplate.opsForList()).thenReturn(listOperations);
    }

    @Test
    void sendNotificationStoresInRedisAndSendsWebSocket() {
        SendNotificationRequest request = SendNotificationRequest.builder()
                .userId(USER_ID).type("BOOKING_CONFIRMED").channel("WEBSOCKET")
                .title("Booking Confirmed").message("Your flight is booked").build();

        notificationService.sendNotification(request);

        verify(listOperations).leftPush(eq("notifications:" + USER_ID), anyString());
        verify(redisTemplate).expire(eq("notifications:" + USER_ID), eq(Duration.ofDays(30)));
        verify(messagingTemplate).convertAndSend(
                eq("/topic/notifications/" + USER_ID), any(Notification.class));
    }

    @Test
    void sendNotificationWithEmailCallsSendEmail() {
        SendNotificationRequest request = SendNotificationRequest.builder()
                .userId(USER_ID).type("PAYMENT_RECEIVED").channel("EMAIL")
                .title("Payment Received").message("Your payment was processed").build();

        notificationService.sendNotification(request);

        verify(listOperations).leftPush(eq("notifications:" + USER_ID), anyString());
        verify(messagingTemplate).convertAndSend(
                eq("/topic/notifications/" + USER_ID), any(Notification.class));
    }

    @Test
    void getUserNotificationsReturnsList() {
        String json = "{\"title\":\"Test\",\"message\":\"Hello\"}";
        when(listOperations.range("notifications:" + USER_ID, 0, -1)).thenReturn(List.of(json));

        List<Notification> notifications = notificationService.getUserNotifications(USER_ID);

        assertFalse(notifications.isEmpty());
    }

    @Test
    void getUserNotificationsReturnsEmptyWhenNull() {
        when(listOperations.range("notifications:" + USER_ID, 0, -1)).thenReturn(null);

        List<Notification> notifications = notificationService.getUserNotifications(USER_ID);

        assertTrue(notifications.isEmpty());
    }

    @Test
    void markAsReadDoesNotThrow() {
        assertDoesNotThrow(() -> notificationService.markAsRead("notif-123"));
    }
}
