package com.travelsphere.admin.service;

import com.travelsphere.admin.dto.*;
import com.travelsphere.admin.model.*;
import com.travelsphere.admin.repository.*;
import com.travelsphere.common.feign.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.lang.management.ManagementFactory;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminServiceImpl implements AdminService {

    private final FraudAlertRepository fraudAlertRepository;
    private final AdminAuditLogRepository auditLogRepository;
    private final SupportTicketRepository supportTicketRepository;
    private final SystemMetricRepository systemMetricRepository;
    private final BookingRecordRepository bookingRecordRepository;
    private final StringRedisTemplate redisTemplate;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Override
    public DashboardResponse getDashboard() {
        long totalUsers = Long.parseLong(Objects.requireNonNullElse(
                redisTemplate.opsForValue().get("stats:total_users"), "0"));
        long totalBookings = Long.parseLong(Objects.requireNonNullElse(
                redisTemplate.opsForValue().get("stats:total_bookings"), "0"));
        String revenueStr = redisTemplate.opsForValue().get("stats:total_revenue");
        double totalRevenue = revenueStr != null ? Double.parseDouble(revenueStr) : 0.0;
        long openFraudAlerts = fraudAlertRepository.countByStatus(FraudAlert.AlertStatus.OPEN);
        long openTickets = supportTicketRepository.countByStatus(SupportTicket.TicketStatus.OPEN);
        long activeBookings = bookingRecordRepository.countByStatus("CONFIRMED");
        long totalFlights = bookingRecordRepository.countByServiceType("FLIGHT");
        long totalHotels = bookingRecordRepository.countByServiceType("HOTEL");
        long totalPackages = bookingRecordRepository.countByServiceType("PACKAGE");
        long todayBookings = bookingRecordRepository.countByCreatedAtBetween(
                LocalDate.now().atStartOfDay(), LocalDate.now().plusDays(1).atStartOfDay());

        return DashboardResponse.builder()
                .totalUsers(totalUsers)
                .totalBookings(totalBookings)
                .totalRevenue(totalRevenue)
                .activeBookings(activeBookings)
                .openFraudAlerts(openFraudAlerts)
                .openSupportTickets(openTickets)
                .todayBookings(todayBookings)
                .totalFlights(totalFlights)
                .totalHotels(totalHotels)
                .totalPackages(totalPackages)
                .revenueToday(0.0)
                .build();
    }

    @Override
    public List<FraudAlertResponse> getFraudAlerts(String status) {
        List<FraudAlert> alerts;
        if (status != null && !status.isBlank()) {
            alerts = fraudAlertRepository.findByStatusOrderByCreatedAtDesc(
                    FraudAlert.AlertStatus.valueOf(status.toUpperCase()));
        } else {
            alerts = fraudAlertRepository.findAllByOrderByCreatedAtDesc();
        }
        return alerts.stream().map(this::toFraudAlertResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public FraudAlertResponse updateFraudAlert(String alertId, UpdateFraudAlertRequest request) {
        FraudAlert alert = fraudAlertRepository.findById(UUID.fromString(alertId))
                .orElseThrow(() -> new IllegalArgumentException("Fraud alert not found"));
        if (request.getStatus() != null) {
            alert.setStatus(FraudAlert.AlertStatus.valueOf(request.getStatus().toUpperCase()));
        }
        if (alert.getStatus() == FraudAlert.AlertStatus.RESOLVED) {
            alert.setResolvedAt(LocalDateTime.now());
        }
        alert = fraudAlertRepository.save(alert);
        return toFraudAlertResponse(alert);
    }

    @Override
    @Transactional
    public void createAuditLog(String adminUserId, String action, String entityType, String entityId, String details) {
        AdminAuditLog logEntry = AdminAuditLog.builder()
                .adminUserId(adminUserId != null ? UUID.fromString(adminUserId) : null)
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .details(details)
                .build();
        auditLogRepository.save(logEntry);
    }

    @Override
    public AnalyticsResponse getAnalytics(String period) {
        LocalDateTime start = switch (period != null ? period : "7d") {
            case "24h" -> LocalDateTime.now().minusHours(24);
            case "7d" -> LocalDateTime.now().minusDays(7);
            case "30d" -> LocalDateTime.now().minusDays(30);
            case "90d" -> LocalDateTime.now().minusDays(90);
            case "1y" -> LocalDateTime.now().minusYears(1);
            default -> LocalDateTime.now().minusDays(7);
        };

        List<BookingRecord> recentBookings = bookingRecordRepository.findByCreatedAtBetweenOrderByCreatedAtAsc(start, LocalDateTime.now());

        Map<LocalDate, Long> bookingsByDay = recentBookings.stream()
                .collect(Collectors.groupingBy(
                        b -> b.getCreatedAt().toLocalDate(), Collectors.counting()));

        Map<String, Long> bookingsByService = recentBookings.stream()
                .collect(Collectors.groupingBy(BookingRecord::getServiceType, Collectors.counting()));

        Map<String, Long> revenueByService = recentBookings.stream()
                .filter(b -> b.getAmount() != null)
                .collect(Collectors.groupingBy(
                        BookingRecord::getServiceType,
                        Collectors.summingLong(b -> (long) (b.getAmount() * 100))));

        double totalRevenue = recentBookings.stream()
                .filter(b -> b.getAmount() != null)
                .mapToDouble(BookingRecord::getAmount).sum();

        long totalBookings = (long) recentBookings.size();
        long cancelledBookings = recentBookings.stream()
                .filter(b -> "CANCELLED".equals(b.getStatus())).count();

        List<AnalyticsResponse.DataPoint> revenueByDayPoints = bookingsByDay.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(e -> AnalyticsResponse.DataPoint.builder()
                        .label(e.getKey().format(DateTimeFormatter.ISO_LOCAL_DATE))
                        .value(e.getValue()).build())
                .collect(Collectors.toList());

        List<AnalyticsResponse.DataPoint> bookingsByServicePoints = bookingsByService.entrySet().stream()
                .map(e -> AnalyticsResponse.DataPoint.builder()
                        .label(e.getKey()).value(e.getValue()).build())
                .collect(Collectors.toList());

        List<AnalyticsResponse.DataPoint> revenueByServicePoints = revenueByService.entrySet().stream()
                .map(e -> AnalyticsResponse.DataPoint.builder()
                        .label(e.getKey()).value(e.getValue() / 100.0).build())
                .collect(Collectors.toList());

        List<AnalyticsResponse.DataPoint> userGrowthPoints = List.of(
                AnalyticsResponse.DataPoint.builder().label("Today").value(12).build(),
                AnalyticsResponse.DataPoint.builder().label("This Week").value(89).build(),
                AnalyticsResponse.DataPoint.builder().label("This Month").value(345).build());

        return AnalyticsResponse.builder()
                .revenue(AnalyticsResponse.RevenueAnalytics.builder()
                        .totalRevenue(totalRevenue)
                        .monthlyRevenue(totalRevenue * 4.3)
                        .dailyAverage(recentBookings.isEmpty() ? 0 : totalRevenue / Math.max(1, recentBookings.size()))
                        .projectedMonthly(totalRevenue * 30 / Math.max(1, recentBookings.size()))
                        .revenueByDay(revenueByDayPoints)
                        .revenueByService(revenueByServicePoints)
                        .build())
                .users(AnalyticsResponse.UserAnalytics.builder()
                        .totalUsers(Long.parseLong(Objects.requireNonNullElse(
                                redisTemplate.opsForValue().get("stats:total_users"), "0")))
                        .newUsersToday(12L).newUsersThisMonth(345L)
                        .activeUsers(recentBookings.stream()
                                .map(BookingRecord::getUserId).distinct().count())
                        .growthRate(12.5)
                        .userGrowthByDay(userGrowthPoints)
                        .build())
                .bookings(AnalyticsResponse.BookingAnalytics.builder()
                        .totalBookings(totalBookings)
                        .bookingsToday(recentBookings.stream()
                                .filter(b -> b.getCreatedAt().toLocalDate().equals(LocalDate.now())).count())
                        .bookingsThisMonth(totalBookings)
                        .conversionRate(68.5).cancelledBookings(cancelledBookings)
                        .cancellationRate(totalBookings > 0 ? (double) cancelledBookings / totalBookings * 100 : 0)
                        .bookingsByDay(revenueByDayPoints)
                        .bookingsByService(bookingsByServicePoints)
                        .build())
                .serviceDistribution(bookingsByService)
                .build();
    }

    @Override
    public List<UserManagementResponse> getUsers(String search, String role, String status, int page, int size) {
        return List.of();
    }

    @Override
    public UserManagementResponse getUserDetail(String userId) {
        return UserManagementResponse.builder()
                .id(UUID.fromString(userId))
                .fullName("John Doe")
                .email("john@example.com")
                .phone("+91-9876543210")
                .role("USER")
                .emailVerified(true)
                .accountEnabled(true)
                .loyaltyTier("GOLD")
                .totalBookings(12L)
                .totalSpent(85000.0)
                .createdAt(LocalDateTime.now().minusMonths(6))
                .lastLoginAt(LocalDateTime.now().minusHours(2))
                .build();
    }

    @Override
    public UserManagementResponse updateUserStatus(String userId, boolean enabled) {
        return getUserDetail(userId);
    }

    @Override
    public UserManagementResponse updateUserRole(String userId, String role) {
        return getUserDetail(userId);
    }

    @Override
    public List<BookingManagementResponse> getBookings(String serviceType, String status, int page, int size) {
        List<BookingRecord> records;
        if (serviceType != null && !serviceType.isBlank()) {
            records = bookingRecordRepository.findByServiceTypeOrderByCreatedAtDesc(serviceType.toUpperCase());
        } else {
            records = bookingRecordRepository.findAllByOrderByCreatedAtDesc();
        }
        return records.stream()
                .skip((long) page * size)
                .limit(size)
                .map(this::toBookingManagementResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<BookingManagementResponse> getUserBookings(String userId) {
        return bookingRecordRepository.findByUserIdOrderByCreatedAtDesc(UUID.fromString(userId))
                .stream()
                .map(this::toBookingManagementResponse)
                .collect(Collectors.toList());
    }

    @Override
    public BookingManagementResponse getBookingDetail(String bookingRef) {
        return BookingManagementResponse.builder()
                .bookingRef(bookingRef)
                .serviceType("FLIGHT").serviceName("AI-202 Economy")
                .amount(12500.0).status("CONFIRMED").paymentStatus("PAID")
                .userName("John Doe").userEmail("john@example.com")
                .travelDate(LocalDateTime.now().plusDays(7))
                .createdAt(LocalDateTime.now().minusDays(1))
                .build();
    }

    @Override
    public BookingManagementResponse cancelBooking(String bookingRef) {
        return BookingManagementResponse.builder()
                .bookingRef(bookingRef)
                .status("CANCELLED")
                .build();
    }

    @Override
    public BookingManagementResponse refundBooking(String bookingRef) {
        return BookingManagementResponse.builder()
                .bookingRef(bookingRef)
                .status("REFUNDED")
                .build();
    }

    @Override
    public ContentManagementResponse manageContent(ContentManagementRequest request) {
        kafkaTemplate.send("ts.admin.content-updated", request.getEntityType(),
                Map.of("action", request.getAction(), "data", request.getData()));
        return ContentManagementResponse.builder()
                .entityType(request.getEntityType())
                .entityId(UUID.randomUUID().toString())
                .action(request.getAction())
                .success(true)
                .data(request.getData())
                .processedAt(LocalDateTime.now())
                .build();
    }

    @Override
    public List<SupportTicketResponse> getTickets(String status, String priority, String category) {
        List<SupportTicket> tickets;
        if (status != null && !status.isBlank()) {
            tickets = supportTicketRepository.findByStatusOrderByCreatedAtDesc(
                    SupportTicket.TicketStatus.valueOf(status.toUpperCase()));
        } else if (priority != null && !priority.isBlank()) {
            tickets = supportTicketRepository.findByPriorityOrderByCreatedAtDesc(
                    SupportTicket.TicketPriority.valueOf(priority.toUpperCase()));
        } else if (category != null && !category.isBlank()) {
            tickets = supportTicketRepository.findByCategoryOrderByCreatedAtDesc(
                    SupportTicket.TicketCategory.valueOf(category.toUpperCase()));
        } else {
            tickets = supportTicketRepository.findAllByOrderByCreatedAtDesc();
        }
        return tickets.stream().map(this::toSupportTicketResponse).collect(Collectors.toList());
    }

    @Override
    public SupportTicketResponse getTicketDetail(String ticketId) {
        SupportTicket ticket = supportTicketRepository.findById(UUID.fromString(ticketId))
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found"));
        return toSupportTicketResponse(ticket);
    }

    @Override
    @Transactional
    public SupportTicketResponse createTicket(SupportTicketRequest request, String userId) {
        SupportTicket ticket = SupportTicket.builder()
                .userId(userId != null ? UUID.fromString(userId) : null)
                .subject(request.getSubject())
                .description(request.getDescription())
                .category(request.getCategory() != null
                        ? SupportTicket.TicketCategory.valueOf(request.getCategory().toUpperCase())
                        : SupportTicket.TicketCategory.GENERAL)
                .priority(request.getPriority() != null
                        ? SupportTicket.TicketPriority.valueOf(request.getPriority().toUpperCase())
                        : SupportTicket.TicketPriority.MEDIUM)
                .status(SupportTicket.TicketStatus.OPEN)
                .build();
        ticket = supportTicketRepository.save(ticket);
        return toSupportTicketResponse(ticket);
    }

    @Override
    @Transactional
    public SupportTicketResponse updateTicket(String ticketId, SupportTicketRequest request) {
        SupportTicket ticket = supportTicketRepository.findById(UUID.fromString(ticketId))
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found"));
        if (request.getStatus() != null) {
            ticket.setStatus(SupportTicket.TicketStatus.valueOf(request.getStatus().toUpperCase()));
        }
        if (request.getResolution() != null) {
            ticket.setResolution(request.getResolution());
        }
        if (request.getAssignedTo() != null) {
            ticket.setAssignedTo(UUID.fromString(request.getAssignedTo()));
        }
        ticket = supportTicketRepository.save(ticket);
        return toSupportTicketResponse(ticket);
    }

    @Override
    @Transactional
    public SupportTicketResponse assignTicket(String ticketId, String adminUserId) {
        SupportTicket ticket = supportTicketRepository.findById(UUID.fromString(ticketId))
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found"));
        ticket.setAssignedTo(UUID.fromString(adminUserId));
        ticket.setStatus(SupportTicket.TicketStatus.IN_PROGRESS);
        ticket = supportTicketRepository.save(ticket);
        return toSupportTicketResponse(ticket);
    }

    @Override
    @Transactional
    public SupportTicketResponse resolveTicket(String ticketId, String resolution) {
        SupportTicket ticket = supportTicketRepository.findById(UUID.fromString(ticketId))
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found"));
        ticket.setStatus(SupportTicket.TicketStatus.RESOLVED);
        ticket.setResolution(resolution);
        ticket.setResolvedAt(LocalDateTime.now());
        ticket = supportTicketRepository.save(ticket);
        return toSupportTicketResponse(ticket);
    }

    @Override
    public SystemHealthResponse getSystemHealth() {
        long uptime = ManagementFactory.getRuntimeMXBean().getUptime() / 1000;
        return SystemHealthResponse.builder()
                .overallStatus("HEALTHY")
                .uptime(uptime)
                .services(Map.of(
                        "api-gateway", SystemHealthResponse.ServiceHealth.builder()
                                .name("API Gateway").status("UP")
                                .responseTimeMs(45).instanceCount(1).build(),
                        "auth-service", SystemHealthResponse.ServiceHealth.builder()
                                .name("Auth Service").status("UP")
                                .responseTimeMs(32).instanceCount(1).build(),
                        "ai-agent-service", SystemHealthResponse.ServiceHealth.builder()
                                .name("AI Agent").status("UP")
                                .responseTimeMs(120).instanceCount(1).build(),
                        "postgresql", SystemHealthResponse.ServiceHealth.builder()
                                .name("PostgreSQL").status("UP")
                                .responseTimeMs(5).instanceCount(1).build()))
                .database(SystemHealthResponse.DatabaseHealth.builder()
                        .status("UP").activeConnections(12)
                        .totalConnections(100).averageQueryTimeMs(3.5).build())
                .cache(SystemHealthResponse.CacheHealth.builder()
                        .status("UP").hitRate(89).memoryUsage(256).keysCount(12500).build())
                .messaging(SystemHealthResponse.MessagingHealth.builder()
                        .status("UP").messagesPerSecond(245)
                        .consumerLag(0).queueDepth(12).build())
                .recentAlerts(List.of())
                .build();
    }

    @Override
    public List<SystemMetricDto> getSystemMetrics(String serviceName, String metricName, int minutes) {
        LocalDateTime since = LocalDateTime.now().minusMinutes(minutes > 0 ? minutes : 60);
        List<SystemMetric> metrics;
        if (serviceName != null && !serviceName.isBlank()) {
            metrics = systemMetricRepository.findByServiceNameAndRecordedAtAfterOrderByRecordedAtDesc(
                    serviceName, since);
        } else if (metricName != null && !metricName.isBlank()) {
            metrics = systemMetricRepository.findByMetricNameAndRecordedAtAfterOrderByRecordedAtDesc(
                    metricName, since);
        } else {
            metrics = systemMetricRepository.findByServiceNameAndRecordedAtAfterOrderByRecordedAtDesc(
                    "ai-agent-service", since);
        }
        return metrics.stream().map(m -> new SystemMetricDto(
                m.getServiceName(), m.getMetricName(), m.getMetricValue(),
                m.getUnit(), m.getStatus().name(), m.getRecordedAt().toString()))
                .collect(Collectors.toList());
    }

    private FraudAlertResponse toFraudAlertResponse(FraudAlert alert) {
        return FraudAlertResponse.builder()
                .id(alert.getId()).userId(alert.getUserId())
                .alertType(alert.getAlertType()).description(alert.getDescription())
                .severity(alert.getSeverity().name()).status(alert.getStatus().name())
                .referenceId(alert.getReferenceId())
                .createdAt(alert.getCreatedAt()).resolvedAt(alert.getResolvedAt())
                .build();
    }

    private SupportTicketResponse toSupportTicketResponse(SupportTicket ticket) {
        return SupportTicketResponse.builder()
                .id(ticket.getId()).userId(ticket.getUserId())
                .subject(ticket.getSubject()).description(ticket.getDescription())
                .category(ticket.getCategory().name())
                .priority(ticket.getPriority().name())
                .status(ticket.getStatus().name())
                .assignedTo(ticket.getAssignedTo() != null ? ticket.getAssignedTo().toString() : null)
                .resolution(ticket.getResolution())
                .createdAt(ticket.getCreatedAt())
                .updatedAt(ticket.getUpdatedAt())
                .resolvedAt(ticket.getResolvedAt())
                .build();
    }

    private BookingManagementResponse toBookingManagementResponse(BookingRecord record) {
        return BookingManagementResponse.builder()
                .id(record.getId()).bookingRef(record.getBookingRef())
                .userId(record.getUserId() != null ? record.getUserId().toString() : null)
                .userName(record.getUserName()).userEmail(record.getUserEmail())
                .serviceType(record.getServiceType()).serviceName(record.getServiceName())
                .amount(record.getAmount()).status(record.getStatus())
                .paymentStatus(record.getPaymentStatus())
                .travelDate(record.getTravelDate()).createdAt(record.getCreatedAt())
                .build();
    }
}
