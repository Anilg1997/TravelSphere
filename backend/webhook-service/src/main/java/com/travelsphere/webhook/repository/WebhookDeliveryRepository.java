package com.travelsphere.webhook.repository;

import com.travelsphere.webhook.model.WebhookDelivery;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WebhookDeliveryRepository extends JpaRepository<WebhookDelivery, String> {
    List<WebhookDelivery> findByConfigId(String configId);
    Page<WebhookDelivery> findByEventTypeOrderBySentAtDesc(String eventType, Pageable pageable);
    Page<WebhookDelivery> findAllByOrderBySentAtDesc(Pageable pageable);
    long countBySuccess(boolean success);
}
