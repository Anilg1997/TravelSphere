package com.travelsphere.webhook.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WebhookConfigRequest {

    @NotBlank(message = "Webhook name is required")
    private String name;

    @NotBlank(message = "Webhook URL is required")
    private String webhookUrl;

    @NotBlank(message = "Event type is required")
    @Pattern(regexp = "^(BOOKING_CREATED|PAYMENT_COMPLETED|PAYMENT_FAILED|REFUND_PROCESSED|JOURNEY_STARTED|JOURNEY_UPDATE|JOURNEY_COMPLETED|FOOD_ORDERED|CUSTOM)$",
             message = "Invalid event type")
    private String eventType;

    private String description;

    private boolean active;

    private int retryCount;

    private int timeoutSeconds;

    private String secretHmac;
}
