package com.travelsphere.webhook.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.travelsphere.webhook.dto.WebhookConfigRequest;
import com.travelsphere.webhook.dto.WebhookDeliveryResponse;
import com.travelsphere.webhook.dto.WebhookEvent;
import com.travelsphere.webhook.model.WebhookConfig;
import com.travelsphere.webhook.model.WebhookDelivery;
import com.travelsphere.webhook.repository.WebhookConfigRepository;
import com.travelsphere.webhook.repository.WebhookDeliveryRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class WebhookServiceImpl implements WebhookService {

    private final WebhookConfigRepository configRepository;
    private final WebhookDeliveryRepository deliveryRepository;
    private final ObjectMapper objectMapper;
    private WebClient webClient;

    @PostConstruct
    public void init() {
        this.webClient = WebClient.builder()
                .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(2 * 1024 * 1024))
                .build();
    }

    @Override
    public WebhookConfig createConfig(WebhookConfigRequest request) {
        WebhookConfig config = WebhookConfig.builder()
                .name(request.getName())
                .webhookUrl(request.getWebhookUrl())
                .eventType(request.getEventType())
                .description(request.getDescription())
                .active(request.isActive())
                .retryCount(request.getRetryCount() > 0 ? request.getRetryCount() : 3)
                .timeoutSeconds(request.getTimeoutSeconds() > 0 ? request.getTimeoutSeconds() : 30)
                .secretHmac(request.getSecretHmac())
                .build();
        return configRepository.save(config);
    }

    @Override
    public WebhookConfig updateConfig(String id, WebhookConfigRequest request) {
        WebhookConfig config = configRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Webhook config not found: " + id));
        config.setName(request.getName());
        config.setWebhookUrl(request.getWebhookUrl());
        config.setEventType(request.getEventType());
        config.setDescription(request.getDescription());
        config.setActive(request.isActive());
        config.setRetryCount(request.getRetryCount());
        config.setTimeoutSeconds(request.getTimeoutSeconds());
        config.setSecretHmac(request.getSecretHmac());
        return configRepository.save(config);
    }

    @Override
    public void deleteConfig(String id) {
        configRepository.deleteById(id);
    }

    @Override
    public List<WebhookConfig> getAllConfigs() {
        return configRepository.findAll();
    }

    @Override
    public WebhookConfig getConfig(String id) {
        return configRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Webhook config not found: " + id));
    }

    @Override
    public void dispatchEvent(WebhookEvent event) {
        dispatchEvent(event.getEventType(), event);
    }

    @Override
    public void dispatchEvent(String eventType, WebhookEvent event) {
        List<WebhookConfig> configs = configRepository.findByEventTypeAndActiveTrue(eventType);
        if (configs.isEmpty()) {
            log.debug("No active webhook configs for event type: {}", eventType);
            return;
        }
        for (WebhookConfig config : configs) {
            deliverWebhook(config, event);
        }
    }

    @Async
    public void deliverWebhook(WebhookConfig config, WebhookEvent event) {
        String payload;
        try {
            payload = objectMapper.writeValueAsString(event);
        } catch (Exception e) {
            log.error("Failed to serialize webhook event: {}", e.getMessage());
            return;
        }

        WebhookDelivery delivery = WebhookDelivery.builder()
                .config(config)
                .eventType(event.getEventType())
                .payload(payload)
                .build();

        for (int attempt = 1; attempt <= config.getRetryCount(); attempt++) {
            delivery.setAttempt(attempt);
            try {
                log.info("Dispatching webhook [{}] to {} (attempt {}/{})",
                        event.getEventType(), config.getWebhookUrl(), attempt, config.getRetryCount());

                var requestBuilder = webClient.post()
                        .uri(config.getWebhookUrl())
                        .header("Content-Type", "application/json")
                        .header("X-Webhook-Event", event.getEventType())
                        .header("X-Webhook-Id", event.getEventId())
                        .header("X-Webhook-Source", "travelsphere");

                // Add HMAC signature if secret is configured
                if (config.getSecretHmac() != null && !config.getSecretHmac().isBlank()) {
                    String signature = computeHmac(payload, config.getSecretHmac());
                    requestBuilder.header("X-Webhook-Signature", "sha256=" + signature);
                }

                String response = requestBuilder
                        .bodyValue(payload)
                        .retrieve()
                        .bodyToMono(String.class)
                        .block();

                delivery.setSuccess(true);
                delivery.setResponse(response);
                delivery.setStatusCode(200);
                delivery.setCompletedAt(LocalDateTime.now());

                log.info("Webhook [{}] delivered successfully to {}", event.getEventType(), config.getWebhookUrl());
                break;

            } catch (Exception e) {
                log.warn("Webhook delivery failed (attempt {}/{}): {}", attempt, config.getRetryCount(), e.getMessage());
                delivery.setSuccess(false);
                delivery.setErrorMessage(e.getMessage());
                delivery.setCompletedAt(LocalDateTime.now());

                if (attempt < config.getRetryCount()) {
                    try {
                        Thread.sleep(1000L * attempt); // Exponential backoff
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        break;
                    }
                }
            }
        }

        deliveryRepository.save(delivery);
    }

    // Kafka listener for booking events
    @KafkaListener(topics = "ts.bookings.created", groupId = "webhook-service-group")
    public void onBookingCreated(String payload) {
        log.info("Received booking created event: {}", payload);
        try {
            WebhookEvent event = objectMapper.readValue(payload, WebhookEvent.class);
            dispatchEvent("BOOKING_CREATED", event);
        } catch (Exception e) {
            log.error("Failed to process booking event: {}", e.getMessage());
        }
    }

    // Kafka listener for payment events
    @KafkaListener(topics = "ts.payments.processed", groupId = "webhook-service-group")
    public void onPaymentProcessed(String payload) {
        log.info("Received payment processed event: {}", payload);
        try {
            WebhookEvent event = objectMapper.readValue(payload, WebhookEvent.class);
            dispatchEvent("PAYMENT_COMPLETED", event);
        } catch (Exception e) {
            log.error("Failed to process payment event: {}", e.getMessage());
        }
    }

    @KafkaListener(topics = "ts.payments.failed", groupId = "webhook-service-group")
    public void onPaymentFailed(String payload) {
        log.info("Received payment failed event: {}", payload);
        try {
            WebhookEvent event = objectMapper.readValue(payload, WebhookEvent.class);
            dispatchEvent("PAYMENT_FAILED", event);
        } catch (Exception e) {
            log.error("Failed to process payment event: {}", e.getMessage());
        }
    }

    @KafkaListener(topics = "ts.payments.refunded", groupId = "webhook-service-group")
    public void onRefundProcessed(String payload) {
        log.info("Received refund processed event: {}", payload);
        try {
            WebhookEvent event = objectMapper.readValue(payload, WebhookEvent.class);
            dispatchEvent("REFUND_PROCESSED", event);
        } catch (Exception e) {
            log.error("Failed to process refund event: {}", e.getMessage());
        }
    }

    @Override
    public Page<WebhookDeliveryResponse> getDeliveries(Pageable pageable) {
        return deliveryRepository.findAllByOrderBySentAtDesc(pageable).map(this::toDeliveryResponse);
    }

    @Override
    public Page<WebhookDeliveryResponse> getDeliveriesByEvent(String eventType, Pageable pageable) {
        return deliveryRepository.findByEventTypeOrderBySentAtDesc(eventType, pageable).map(this::toDeliveryResponse);
    }

    @Override
    public Page<WebhookDeliveryResponse> getDeliveriesByConfig(String configId, Pageable pageable) {
        return deliveryRepository.findByConfigId(configId).stream()
                .map(this::toDeliveryResponse)
                .collect(java.util.stream.Collectors.collectingAndThen(
                        java.util.stream.Collectors.toList(),
                        list -> new org.springframework.data.domain.PageImpl<>(list, pageable, list.size())
                ));
    }

    @Override
    public long getSuccessCount() {
        return deliveryRepository.countBySuccess(true);
    }

    @Override
    public long getFailureCount() {
        return deliveryRepository.countBySuccess(false);
    }

    private WebhookDeliveryResponse toDeliveryResponse(WebhookDelivery delivery) {
        return WebhookDeliveryResponse.builder()
                .id(delivery.getId())
                .configId(delivery.getConfig() != null ? delivery.getConfig().getId() : null)
                .eventType(delivery.getEventType())
                .payload(delivery.getPayload())
                .response(delivery.getResponse())
                .statusCode(delivery.getStatusCode())
                .success(delivery.isSuccess())
                .errorMessage(delivery.getErrorMessage())
                .attempt(delivery.getAttempt())
                .sentAt(delivery.getSentAt())
                .completedAt(delivery.getCompletedAt())
                .build();
    }

    private String computeHmac(String data, String secret) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (Exception e) {
            log.error("HMAC computation failed: {}", e.getMessage());
            return "";
        }
    }
}
