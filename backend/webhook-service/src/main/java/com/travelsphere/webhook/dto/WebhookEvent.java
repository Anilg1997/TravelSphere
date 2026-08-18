package com.travelsphere.webhook.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WebhookEvent {

    @Builder.Default
    private String eventId = UUID.randomUUID().toString();

    private String eventType;

    private String source;

    private String userId;

    private String bookingRef;

    private String paymentRef;

    private String serviceType;

    private Map<String, Object> data;

    @Builder.Default
    private Instant timestamp = Instant.now();

    // Static factory methods for common events
    public static WebhookEvent bookingCreated(String userId, String bookingRef, String serviceType, Map<String, Object> data) {
        return WebhookEvent.builder()
                .eventType("BOOKING_CREATED")
                .source("payment-service")
                .userId(userId)
                .bookingRef(bookingRef)
                .serviceType(serviceType)
                .data(data)
                .build();
    }

    public static WebhookEvent paymentCompleted(String userId, String paymentRef, String bookingRef, Map<String, Object> data) {
        return WebhookEvent.builder()
                .eventType("PAYMENT_COMPLETED")
                .source("payment-service")
                .userId(userId)
                .paymentRef(paymentRef)
                .bookingRef(bookingRef)
                .data(data)
                .build();
    }

    public static WebhookEvent paymentFailed(String userId, String paymentRef, String reason) {
        return WebhookEvent.builder()
                .eventType("PAYMENT_FAILED")
                .source("payment-service")
                .userId(userId)
                .paymentRef(paymentRef)
                .data(Map.of("reason", reason))
                .build();
    }

    public static WebhookEvent refundProcessed(String userId, String paymentRef, String refundRef) {
        return WebhookEvent.builder()
                .eventType("REFUND_PROCESSED")
                .source("payment-service")
                .userId(userId)
                .paymentRef(paymentRef)
                .data(Map.of("refundRef", refundRef))
                .build();
    }

    public static WebhookEvent journeyStarted(String userId, String bookingRef, Map<String, Object> data) {
        return WebhookEvent.builder()
                .eventType("JOURNEY_STARTED")
                .source("journey-service")
                .userId(userId)
                .bookingRef(bookingRef)
                .data(data)
                .build();
    }

    public static WebhookEvent journeyUpdate(String userId, String bookingRef, Map<String, Object> data) {
        return WebhookEvent.builder()
                .eventType("JOURNEY_UPDATE")
                .source("journey-service")
                .userId(userId)
                .bookingRef(bookingRef)
                .data(data)
                .build();
    }

    public static WebhookEvent journeyCompleted(String userId, String bookingRef, Map<String, Object> data) {
        return WebhookEvent.builder()
                .eventType("JOURNEY_COMPLETED")
                .source("journey-service")
                .userId(userId)
                .bookingRef(bookingRef)
                .data(data)
                .build();
    }

    public static WebhookEvent foodOrdered(String userId, String bookingRef, Map<String, Object> data) {
        return WebhookEvent.builder()
                .eventType("FOOD_ORDERED")
                .source("food-service")
                .userId(userId)
                .bookingRef(bookingRef)
                .data(data)
                .build();
    }
}
