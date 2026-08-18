package com.travelsphere.webhook.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "webhook_configs")
public class WebhookConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String webhookUrl;

    @Column(nullable = false)
    private String eventType;

    @Column(length = 500)
    private String description;

    @Builder.Default
    private boolean active = true;

    @Builder.Default
    private int retryCount = 3;

    @Builder.Default
    private int timeoutSeconds = 30;

    private String secretHmac;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
