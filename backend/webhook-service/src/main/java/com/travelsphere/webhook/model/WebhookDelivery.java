package com.travelsphere.webhook.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "webhook_deliveries")
public class WebhookDelivery {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "config_id")
    private WebhookConfig config;

    @Column(nullable = false)
    private String eventType;

    @Column(columnDefinition = "TEXT")
    private String payload;

    @Column(columnDefinition = "TEXT")
    private String response;

    @Builder.Default
    private int statusCode = 0;

    @Builder.Default
    private boolean success = false;

    @Column(columnDefinition = "TEXT")
    private String errorMessage;

    @Builder.Default
    private int attempt = 1;

    @CreationTimestamp
    private LocalDateTime sentAt;

    private LocalDateTime completedAt;
}
