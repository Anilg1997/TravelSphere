import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { DashboardStats, FraudAlert, UserManagementData, BookingManagementData, AnalyticsData, SupportTicket, SystemHealth } from '../models/admin.model';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/admin`;

  getDashboard(): Observable<DashboardStats> {
    return this.http.get<ApiResponse<DashboardStats>>(`${this.baseUrl}/dashboard`)
      .pipe(map(r => r.data!));
  }

  getAnalytics(period: string = '7d'): Observable<AnalyticsData> {
    return this.http.get<ApiResponse<AnalyticsData>>(`${this.baseUrl}/analytics`, { params: { period } })
      .pipe(map(r => r.data!));
  }

  getUsers(search?: string, role?: string, status?: string, page = 0, size = 20): Observable<UserManagementData[]> {
    return this.http.get<ApiResponse<UserManagementData[]>>(`${this.baseUrl}/users`, {
      params: { ...(search && { search }), ...(role && { role }), ...(status && { status }), page, size }
    }).pipe(map(r => r.data || []));
  }

  getUserDetail(userId: string): Observable<UserManagementData> {
    return this.http.get<ApiResponse<UserManagementData>>(`${this.baseUrl}/users/${userId}`)
      .pipe(map(r => r.data!));
  }

  updateUserStatus(userId: string, enabled: boolean): Observable<UserManagementData> {
    return this.http.put<ApiResponse<UserManagementData>>(`${this.baseUrl}/users/${userId}/status`, null, { params: { enabled } })
      .pipe(map(r => r.data!));
  }

  updateUserRole(userId: string, role: string): Observable<UserManagementData> {
    return this.http.put<ApiResponse<UserManagementData>>(`${this.baseUrl}/users/${userId}/role`, null, { params: { role } })
      .pipe(map(r => r.data!));
  }

  getBookings(serviceType?: string, status?: string, page = 0, size = 20): Observable<BookingManagementData[]> {
    return this.http.get<ApiResponse<BookingManagementData[]>>(`${this.baseUrl}/bookings`, {
      params: { ...(serviceType && { serviceType }), ...(status && { status }), page, size }
    }).pipe(map(r => r.data || []));
  }

  getUserBookings(userId: string): Observable<BookingManagementData[]> {
    return this.http.get<ApiResponse<BookingManagementData[]>>(`${this.baseUrl}/bookings/user/${userId}`)
      .pipe(map(r => r.data || []));
  }

  getBookingDetail(bookingRef: string): Observable<BookingManagementData> {
    return this.http.get<ApiResponse<BookingManagementData>>(`${this.baseUrl}/bookings/${bookingRef}`)
      .pipe(map(r => r.data!));
  }

  cancelBooking(bookingRef: string): Observable<BookingManagementData> {
    return this.http.post<ApiResponse<BookingManagementData>>(`${this.baseUrl}/bookings/${bookingRef}/cancel`, {})
      .pipe(map(r => r.data!));
  }

  refundBooking(bookingRef: string): Observable<BookingManagementData> {
    return this.http.post<ApiResponse<BookingManagementData>>(`${this.baseUrl}/bookings/${bookingRef}/refund`, {})
      .pipe(map(r => r.data!));
  }

  getFraudAlerts(status?: string): Observable<FraudAlert[]> {
    return this.http.get<ApiResponse<FraudAlert[]>>(`${this.baseUrl}/fraud-alerts`, {
      params: status ? { status } : {}
    }).pipe(map(r => r.data || []));
  }

  updateFraudAlert(id: string, status: string): Observable<FraudAlert> {
    return this.http.put<ApiResponse<FraudAlert>>(`${this.baseUrl}/fraud-alerts/${id}`, { status })
      .pipe(map(r => r.data!));
  }

  getTickets(status?: string, priority?: string, category?: string): Observable<SupportTicket[]> {
    return this.http.get<ApiResponse<SupportTicket[]>>(`${this.baseUrl}/tickets`, {
      params: { ...(status && { status }), ...(priority && { priority }), ...(category && { category }) }
    }).pipe(map(r => r.data || []));
  }

  getTicketDetail(ticketId: string): Observable<SupportTicket> {
    return this.http.get<ApiResponse<SupportTicket>>(`${this.baseUrl}/tickets/${ticketId}`)
      .pipe(map(r => r.data!));
  }

  createTicket(ticket: { subject: string; description: string; category?: string; priority?: string }): Observable<SupportTicket> {
    return this.http.post<ApiResponse<SupportTicket>>(`${this.baseUrl}/tickets`, ticket)
      .pipe(map(r => r.data!));
  }

  updateTicket(ticketId: string, update: { status?: string; resolution?: string; assignedTo?: string }): Observable<SupportTicket> {
    return this.http.put<ApiResponse<SupportTicket>>(`${this.baseUrl}/tickets/${ticketId}`, update)
      .pipe(map(r => r.data!));
  }

  assignTicket(ticketId: string, adminUserId: string): Observable<SupportTicket> {
    return this.http.post<ApiResponse<SupportTicket>>(`${this.baseUrl}/tickets/${ticketId}/assign`, null, { params: { adminUserId } })
      .pipe(map(r => r.data!));
  }

  resolveTicket(ticketId: string, resolution: string): Observable<SupportTicket> {
    return this.http.post<ApiResponse<SupportTicket>>(`${this.baseUrl}/tickets/${ticketId}/resolve`, null, { params: { resolution } })
      .pipe(map(r => r.data!));
  }

  getSystemHealth(): Observable<SystemHealth> {
    return this.http.get<ApiResponse<SystemHealth>>(`${this.baseUrl}/system/health`)
      .pipe(map(r => r.data!));
  }
}
