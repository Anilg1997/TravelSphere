package com.travelsphere.admin.service;

import com.travelsphere.admin.dto.*;
import com.travelsphere.admin.model.AdminAuditLog;
import com.travelsphere.admin.model.FraudAlert;
import com.travelsphere.admin.repository.AdminAuditLogRepository;
import com.travelsphere.admin.repository.BookingRecordRepository;
import com.travelsphere.admin.repository.FraudAlertRepository;
import com.travelsphere.admin.repository.SupportTicketRepository;
import com.travelsphere.admin.repository.SystemMetricRepository;
import com.travelsphere.common.feign.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.kafka.core.KafkaTemplate;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminServiceImplTest {

    @Mock private FraudAlertRepository fraudAlertRepository;
    @Mock private AdminAuditLogRepository auditLogRepository;
    @Mock private SupportTicketRepository supportTicketRepository;
    @Mock private SystemMetricRepository systemMetricRepository;
    @Mock private BookingRecordRepository bookingRecordRepository;
    @Mock private StringRedisTemplate redisTemplate;
    @Mock private ValueOperations<String, String> valueOperations;
    @Mock private KafkaTemplate<String, Object> kafkaTemplate;
    @Mock private FlightClient flightClient;
    @Mock private HotelClient hotelClient;
    @Mock private PackageClient packageClient;

    @InjectMocks private AdminServiceImpl adminService;

    private UUID alertId;
    private FraudAlert fraudAlert;

    @BeforeEach
    void setUp() {
        // lenient: only dashboard/analytics tests read the Redis stats cache
        lenient().when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        alertId = UUID.randomUUID();
        fraudAlert = FraudAlert.builder()
                .id(alertId).userId(UUID.randomUUID())
                .alertType("SUSPICIOUS_BOOKING").description("Multiple rapid bookings")
                .severity(FraudAlert.Severity.HIGH)
                .status(FraudAlert.AlertStatus.OPEN)
                .referenceId("booking-123").createdAt(LocalDateTime.now()).build();
    }

    @Test
    void getDashboardReturnsSummary() {
        when(fraudAlertRepository.countByStatus(FraudAlert.AlertStatus.OPEN)).thenReturn(3L);

        DashboardResponse dashboard = adminService.getDashboard();

        assertNotNull(dashboard);
        assertEquals(3, dashboard.getOpenFraudAlerts());
    }

    @Test
    void getFraudAlertsWithStatusFilter() {
        when(fraudAlertRepository.findByStatusOrderByCreatedAtDesc(FraudAlert.AlertStatus.OPEN))
                .thenReturn(List.of(fraudAlert));

        List<FraudAlertResponse> alerts = adminService.getFraudAlerts("OPEN");

        assertEquals(1, alerts.size());
        assertEquals("SUSPICIOUS_BOOKING", alerts.get(0).getAlertType());
        assertEquals("HIGH", alerts.get(0).getSeverity());
    }

    @Test
    void getFraudAlertsAll() {
        when(fraudAlertRepository.findAllByOrderByCreatedAtDesc()).thenReturn(List.of(fraudAlert));

        List<FraudAlertResponse> alerts = adminService.getFraudAlerts(null);

        assertEquals(1, alerts.size());
    }

    @Test
    void updateFraudAlertSuccess() {
        when(fraudAlertRepository.findById(alertId)).thenReturn(Optional.of(fraudAlert));
        when(fraudAlertRepository.save(any())).thenReturn(fraudAlert);

        UpdateFraudAlertRequest request = UpdateFraudAlertRequest.builder()
                .status("INVESTIGATING").build();

        FraudAlertResponse response = adminService.updateFraudAlert(alertId.toString(), request);

        assertEquals("INVESTIGATING", response.getStatus());
    }

    @Test
    void updateFraudAlertToResolvedSetsResolvedAt() {
        fraudAlert.setStatus(FraudAlert.AlertStatus.OPEN);
        when(fraudAlertRepository.findById(alertId)).thenReturn(Optional.of(fraudAlert));
        when(fraudAlertRepository.save(any())).thenReturn(fraudAlert);

        UpdateFraudAlertRequest request = UpdateFraudAlertRequest.builder()
                .status("RESOLVED").build();

        adminService.updateFraudAlert(alertId.toString(), request);

        assertNotNull(fraudAlert.getResolvedAt());
    }

    @Test
    void updateFraudAlertNotFoundThrows() {
        when(fraudAlertRepository.findById(any())).thenReturn(Optional.empty());

        UpdateFraudAlertRequest request = UpdateFraudAlertRequest.builder().status("OPEN").build();

        assertThrows(IllegalArgumentException.class,
                () -> adminService.updateFraudAlert(UUID.randomUUID().toString(), request));
    }

    @Test
    void createAuditLogSuccess() {
        when(auditLogRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        assertDoesNotThrow(() ->
                adminService.createAuditLog(UUID.randomUUID().toString(),
                        "UPDATE", "USER", "user-123", "Updated profile"));
        verify(auditLogRepository).save(any());
    }
}
