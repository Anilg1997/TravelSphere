package com.travelsphere.webhook.controller;

import com.travelsphere.common.dto.ApiResponse;
import com.travelsphere.webhook.dto.WebhookConfigRequest;
import com.travelsphere.webhook.dto.WebhookDeliveryResponse;
import com.travelsphere.webhook.dto.WebhookEvent;
import com.travelsphere.webhook.model.WebhookConfig;
import com.travelsphere.webhook.service.WebhookService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/webhooks")
@RequiredArgsConstructor
public class WebhookController {

    private final WebhookService webhookService;

    // ── Configuration Management ──

    @PostMapping("/configs")
    public ResponseEntity<ApiResponse<WebhookConfig>> createConfig(@Valid @RequestBody WebhookConfigRequest request) {
        WebhookConfig config = webhookService.createConfig(request);
        return ResponseEntity.ok(ApiResponse.success(config));
    }

    @PutMapping("/configs/{id}")
    public ResponseEntity<ApiResponse<WebhookConfig>> updateConfig(
            @PathVariable String id, @Valid @RequestBody WebhookConfigRequest request) {
        WebhookConfig config = webhookService.updateConfig(id, request);
        return ResponseEntity.ok(ApiResponse.success(config));
    }

    @DeleteMapping("/configs/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteConfig(@PathVariable String id) {
        webhookService.deleteConfig(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @GetMapping("/configs")
    public ResponseEntity<ApiResponse<List<WebhookConfig>>> getAllConfigs() {
        List<WebhookConfig> configs = webhookService.getAllConfigs();
        return ResponseEntity.ok(ApiResponse.success(configs));
    }

    @GetMapping("/configs/{id}")
    public ResponseEntity<ApiResponse<WebhookConfig>> getConfig(@PathVariable String id) {
        WebhookConfig config = webhookService.getConfig(id);
        return ResponseEntity.ok(ApiResponse.success(config));
    }

    // ── Manual Event Dispatch ──

    @PostMapping("/dispatch")
    public ResponseEntity<ApiResponse<Void>> dispatchEvent(@RequestBody WebhookEvent event) {
        webhookService.dispatchEvent(event);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping("/dispatch/{eventType}")
    public ResponseEntity<ApiResponse<Void>> dispatchEventByType(@PathVariable String eventType) {
        WebhookEvent event = WebhookEvent.builder()
                .eventType(eventType)
                .source("manual-dispatch")
                .build();
        webhookService.dispatchEvent(eventType, event);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    // ── Delivery Logs ──

    @GetMapping("/deliveries")
    public ResponseEntity<ApiResponse<Page<WebhookDeliveryResponse>>> getDeliveries(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<WebhookDeliveryResponse> deliveries = webhookService.getDeliveries(PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(deliveries));
    }

    @GetMapping("/deliveries/event/{eventType}")
    public ResponseEntity<ApiResponse<Page<WebhookDeliveryResponse>>> getDeliveriesByEvent(
            @PathVariable String eventType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<WebhookDeliveryResponse> deliveries = webhookService.getDeliveriesByEvent(eventType, PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(deliveries));
    }

    @GetMapping("/deliveries/config/{configId}")
    public ResponseEntity<ApiResponse<Page<WebhookDeliveryResponse>>> getDeliveriesByConfig(
            @PathVariable String configId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<WebhookDeliveryResponse> deliveries = webhookService.getDeliveriesByConfig(configId, PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(deliveries));
    }

    // ── Statistics ──

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getStats() {
        Map<String, Long> stats = Map.of(
                "totalDelivered", webhookService.getSuccessCount(),
                "totalFailed", webhookService.getFailureCount()
        );
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    // ── Health Check ──

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "UP", "service", "webhook-service"));
    }
}
