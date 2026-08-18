package com.travelsphere.webhook.repository;

import com.travelsphere.webhook.model.WebhookConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WebhookConfigRepository extends JpaRepository<WebhookConfig, String> {
    List<WebhookConfig> findByEventTypeAndActiveTrue(String eventType);
    List<WebhookConfig> findByActiveTrue();
}
