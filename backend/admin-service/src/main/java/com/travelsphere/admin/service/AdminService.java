package com.travelsphere.admin.service;

import com.travelsphere.admin.dto.*;
import com.travelsphere.admin.model.SupportTicket;

import java.util.List;

public interface AdminService {
    DashboardResponse getDashboard();
    List<FraudAlertResponse> getFraudAlerts(String status);
    FraudAlertResponse updateFraudAlert(String alertId, UpdateFraudAlertRequest request);
    void createAuditLog(String adminUserId, String action, String entityType, String entityId, String details);

    AnalyticsResponse getAnalytics(String period);
    List<UserManagementResponse> getUsers(String search, String role, String status, int page, int size);
    UserManagementResponse getUserDetail(String userId);
    UserManagementResponse updateUserStatus(String userId, boolean enabled);
    UserManagementResponse updateUserRole(String userId, String role);

    List<BookingManagementResponse> getBookings(String serviceType, String status, int page, int size);
    List<BookingManagementResponse> getUserBookings(String userId);
    BookingManagementResponse getBookingDetail(String bookingRef);
    BookingManagementResponse cancelBooking(String bookingRef);
    BookingManagementResponse refundBooking(String bookingRef);

    ContentManagementResponse manageContent(ContentManagementRequest request);

    List<SupportTicketResponse> getTickets(String status, String priority, String category);
    SupportTicketResponse getTicketDetail(String ticketId);
    SupportTicketResponse createTicket(SupportTicketRequest request, String userId);
    SupportTicketResponse updateTicket(String ticketId, SupportTicketRequest request);
    SupportTicketResponse assignTicket(String ticketId, String adminUserId);
    SupportTicketResponse resolveTicket(String ticketId, String resolution);

    SystemHealthResponse getSystemHealth();
    List<SystemMetricDto> getSystemMetrics(String serviceName, String metricName, int minutes);

    record SystemMetricDto(String serviceName, String metricName, Double value, String unit, String status, String recordedAt) {}
}
