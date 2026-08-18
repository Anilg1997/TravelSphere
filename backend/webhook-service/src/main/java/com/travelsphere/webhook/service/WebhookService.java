package com.travelsphere.webhook.service;

import com.travelsphere.webhook.dto.WebhookConfigRequest;
import com.travelsphere.webhook.dto.WebhookDeliveryResponse;
import com.travelsphere.webhook.dto.WebhookEvent;
import com.travelsphere.webhook.model.WebhookConfig;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface WebhookService {
    WebhookConfig createConfig(WebhookConfigRequest request);
    WebhookConfig updateConfig(String id, WebhookConfigRequest request);
    void deleteConfig(String id);
    List<WebhookConfig> getAllConfigs();
    WebhookConfig getConfig(String id);

    void dispatchEvent(WebhookEvent event);
    void dispatchEvent(String eventType, WebhookEvent event);

    Page<WebhookDeliveryResponse> getDeliveries(Pageable pageable);
    Page<WebhookDeliveryResponse> getDeliveriesByEvent(String eventType, Pageable pageable);
    Page<WebhookDeliveryResponse> getDeliveriesByConfig(String configId, Pageable pageable);

    long getSuccessCount();
    long getFailureCount();
}
