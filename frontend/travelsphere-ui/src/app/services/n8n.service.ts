import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/api-response.model';

export interface WebhookConfig {
  id: string;
  name: string;
  webhookUrl: string;
  eventType: string;
  description: string;
  active: boolean;
  retryCount: number;
  timeoutSeconds: number;
  secretHmac: string;
  createdAt: string;
  updatedAt: string;
}

export interface WebhookConfigRequest {
  name: string;
  webhookUrl: string;
  eventType: string;
  description: string;
  active: boolean;
  retryCount: number;
  timeoutSeconds: number;
  secretHmac: string;
}

export interface WebhookDelivery {
  id: string;
  configId: string;
  eventType: string;
  payload: string;
  response: string;
  statusCode: number;
  success: boolean;
  errorMessage: string;
  attempt: number;
  sentAt: string;
  completedAt: string;
}

export interface WebhookStats {
  totalDelivered: number;
  totalFailed: number;
}

@Injectable({ providedIn: 'root' })
export class N8nService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/webhooks`;

  // ── Config Management ──

  getConfigs(): Observable<WebhookConfig[]> {
    return this.http.get<ApiResponse<WebhookConfig[]>>(`${this.baseUrl}/configs`)
      .pipe(map(r => r.data || []));
  }

  getConfig(id: string): Observable<WebhookConfig> {
    return this.http.get<ApiResponse<WebhookConfig>>(`${this.baseUrl}/configs/${id}`)
      .pipe(map(r => r.data!));
  }

  createConfig(request: WebhookConfigRequest): Observable<WebhookConfig> {
    return this.http.post<ApiResponse<WebhookConfig>>(`${this.baseUrl}/configs`, request)
      .pipe(map(r => r.data!));
  }

  updateConfig(id: string, request: WebhookConfigRequest): Observable<WebhookConfig> {
    return this.http.put<ApiResponse<WebhookConfig>>(`${this.baseUrl}/configs/${id}`, request)
      .pipe(map(r => r.data!));
  }

  deleteConfig(id: string): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/configs/${id}`)
      .pipe(map(() => void 0));
  }

  // ── Event Dispatch ──

  dispatchEvent(event: any): Observable<void> {
    return this.http.post<ApiResponse<void>>(`${this.baseUrl}/dispatch`, event)
      .pipe(map(() => void 0));
  }

  dispatchEventByType(eventType: string): Observable<void> {
    return this.http.post<ApiResponse<void>>(`${this.baseUrl}/dispatch/${eventType}`, {})
      .pipe(map(() => void 0));
  }

  // ── Delivery Logs ──

  getDeliveries(page = 0, size = 20): Observable<{ content: WebhookDelivery[]; totalElements: number }> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/deliveries?page=${page}&size=${size}`)
      .pipe(map(r => r.data || { content: [], totalElements: 0 }));
  }

  getDeliveriesByEvent(eventType: string, page = 0, size = 20): Observable<{ content: WebhookDelivery[]; totalElements: number }> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/deliveries/event/${eventType}?page=${page}&size=${size}`)
      .pipe(map(r => r.data || { content: [], totalElements: 0 }));
  }

  // ── Stats ──

  getStats(): Observable<WebhookStats> {
    return this.http.get<ApiResponse<WebhookStats>>(`${this.baseUrl}/stats`)
      .pipe(map(r => r.data!));
  }
}
