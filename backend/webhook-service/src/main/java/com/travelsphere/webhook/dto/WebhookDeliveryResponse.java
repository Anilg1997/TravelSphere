package com.travelsphere.webhook.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WebhookDeliveryResponse {

    private String id;
    private String configId;
    private String eventType;
    private String payload;
    private String response;
    private int statusCode;
    private boolean success;
    private String errorMessage;
    private int attempt;
    private LocalDateTime sentAt;
    private LocalDateTime completedAt;
}
