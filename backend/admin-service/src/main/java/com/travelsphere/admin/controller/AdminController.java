package com.travelsphere.admin.controller;

import com.travelsphere.admin.dto.*;
import com.travelsphere.admin.service.AdminService;
import com.travelsphere.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@Tag(name = "Admin", description = "Dashboard, analytics, user/booking/content management, fraud alerts, support tickets, and system monitoring")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/dashboard")
    @Operation(summary = "Get admin dashboard summary")
    public ResponseEntity<ApiResponse<DashboardResponse>> getDashboard() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getDashboard()));
    }

    @GetMapping("/analytics")
    @Operation(summary = "Get platform analytics")
    public ResponseEntity<ApiResponse<AnalyticsResponse>> getAnalytics(
            @RequestParam(required = false, defaultValue = "7d") String period) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getAnalytics(period)));
    }

    @GetMapping("/users")
    @Operation(summary = "List all users")
    public ResponseEntity<ApiResponse<List<UserManagementResponse>>> getUsers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getUsers(search, role, status, page, size)));
    }

    @GetMapping("/users/{userId}")
    @Operation(summary = "Get user details")
    public ResponseEntity<ApiResponse<UserManagementResponse>> getUser(@PathVariable String userId) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getUserDetail(userId)));
    }

    @PutMapping("/users/{userId}/status")
    @Operation(summary = "Enable/disable user account")
    public ResponseEntity<ApiResponse<UserManagementResponse>> updateUserStatus(
            @PathVariable String userId, @RequestParam boolean enabled) {
        return ResponseEntity.ok(ApiResponse.success(adminService.updateUserStatus(userId, enabled)));
    }

    @PutMapping("/users/{userId}/role")
    @Operation(summary = "Update user role")
    public ResponseEntity<ApiResponse<UserManagementResponse>> updateUserRole(
            @PathVariable String userId, @RequestParam String role) {
        return ResponseEntity.ok(ApiResponse.success(adminService.updateUserRole(userId, role)));
    }

    @GetMapping("/bookings")
    @Operation(summary = "List all bookings")
    public ResponseEntity<ApiResponse<List<BookingManagementResponse>>> getBookings(
            @RequestParam(required = false) String serviceType,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getBookings(serviceType, status, page, size)));
    }

    @GetMapping("/bookings/user/{userId}")
    @Operation(summary = "Get bookings for a specific user")
    public ResponseEntity<ApiResponse<List<BookingManagementResponse>>> getUserBookings(@PathVariable String userId) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getUserBookings(userId)));
    }

    @GetMapping("/bookings/{bookingRef}")
    @Operation(summary = "Get booking details")
    public ResponseEntity<ApiResponse<BookingManagementResponse>> getBooking(@PathVariable String bookingRef) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getBookingDetail(bookingRef)));
    }

    @PostMapping("/bookings/{bookingRef}/cancel")
    @Operation(summary = "Cancel a booking")
    public ResponseEntity<ApiResponse<BookingManagementResponse>> cancelBooking(@PathVariable String bookingRef) {
        return ResponseEntity.ok(ApiResponse.success(adminService.cancelBooking(bookingRef)));
    }

    @PostMapping("/bookings/{bookingRef}/refund")
    @Operation(summary = "Process refund for a booking")
    public ResponseEntity<ApiResponse<BookingManagementResponse>> refundBooking(@PathVariable String bookingRef) {
        return ResponseEntity.ok(ApiResponse.success(adminService.refundBooking(bookingRef)));
    }

    @PostMapping("/content")
    @Operation(summary = "Manage platform content")
    public ResponseEntity<ApiResponse<ContentManagementResponse>> manageContent(
            @Valid @RequestBody ContentManagementRequest request) {
        return ResponseEntity.ok(ApiResponse.success(adminService.manageContent(request)));
    }

    @GetMapping("/tickets")
    @Operation(summary = "List support tickets")
    public ResponseEntity<ApiResponse<List<SupportTicketResponse>>> getTickets(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String category) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getTickets(status, priority, category)));
    }

    @GetMapping("/tickets/{ticketId}")
    @Operation(summary = "Get ticket details")
    public ResponseEntity<ApiResponse<SupportTicketResponse>> getTicket(@PathVariable String ticketId) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getTicketDetail(ticketId)));
    }

    @PostMapping("/tickets")
    @Operation(summary = "Create a support ticket")
    public ResponseEntity<ApiResponse<SupportTicketResponse>> createTicket(
            @Valid @RequestBody SupportTicketRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        return ResponseEntity.ok(ApiResponse.success(adminService.createTicket(request, userId)));
    }

    @PutMapping("/tickets/{ticketId}")
    @Operation(summary = "Update a support ticket")
    public ResponseEntity<ApiResponse<SupportTicketResponse>> updateTicket(
            @PathVariable String ticketId, @Valid @RequestBody SupportTicketRequest request) {
        return ResponseEntity.ok(ApiResponse.success(adminService.updateTicket(ticketId, request)));
    }

    @PostMapping("/tickets/{ticketId}/assign")
    @Operation(summary = "Assign ticket to admin")
    public ResponseEntity<ApiResponse<SupportTicketResponse>> assignTicket(
            @PathVariable String ticketId, @RequestParam String adminUserId) {
        return ResponseEntity.ok(ApiResponse.success(adminService.assignTicket(ticketId, adminUserId)));
    }

    @PostMapping("/tickets/{ticketId}/resolve")
    @Operation(summary = "Resolve a support ticket")
    public ResponseEntity<ApiResponse<SupportTicketResponse>> resolveTicket(
            @PathVariable String ticketId, @RequestParam String resolution) {
        return ResponseEntity.ok(ApiResponse.success(adminService.resolveTicket(ticketId, resolution)));
    }

    @GetMapping("/system/health")
    @Operation(summary = "Get system health status")
    public ResponseEntity<ApiResponse<SystemHealthResponse>> getSystemHealth() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getSystemHealth()));
    }

    @GetMapping("/system/metrics")
    @Operation(summary = "Get system metrics")
    public ResponseEntity<ApiResponse<List<AdminService.SystemMetricDto>>> getSystemMetrics(
            @RequestParam(required = false) String serviceName,
            @RequestParam(required = false) String metricName,
            @RequestParam(defaultValue = "60") int minutes) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getSystemMetrics(serviceName, metricName, minutes)));
    }

    @GetMapping("/fraud-alerts")
    @Operation(summary = "Get fraud alerts")
    public ResponseEntity<ApiResponse<List<FraudAlertResponse>>> getFraudAlerts(
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getFraudAlerts(status)));
    }

    @PutMapping("/fraud-alerts/{id}")
    @Operation(summary = "Update fraud alert")
    public ResponseEntity<ApiResponse<FraudAlertResponse>> updateFraudAlert(
            @PathVariable String id, @Valid @RequestBody UpdateFraudAlertRequest request) {
        return ResponseEntity.ok(ApiResponse.success(adminService.updateFraudAlert(id, request)));
    }

    @PostMapping("/audit-log")
    @Operation(summary = "Create audit log entry")
    public ResponseEntity<ApiResponse<Void>> createAuditLog(
            @RequestHeader("X-User-Id") String adminUserId,
            @RequestParam String action, @RequestParam String entityType,
            @RequestParam String entityId, @RequestParam(required = false) String details) {
        adminService.createAuditLog(adminUserId, action, entityType, entityId, details);
        return ResponseEntity.ok(ApiResponse.success(null, "Audit log created"));
    }
}
