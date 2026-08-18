import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/api-response.model';

export interface AiChatRequest {
  message: string;
  sessionId?: string;
  userId?: string;
}

export interface AiChatResponse {
  sessionId: string;
  reply: string;
  timestamp: string;
}

export interface TripPlanRequest {
  destination: string;
  durationDays: number;
  budget: number;
  travelers: number;
  preferences?: string;
}

export interface TripPlanResponse {
  destination: string;
  durationDays: number;
  budget: number;
  itinerary: string[];
  recommendations: string[];
  summary: string;
}

@Injectable({ providedIn: 'root' })
export class AiService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/ai`;

  chat(request: AiChatRequest): Observable<AiChatResponse> {
    return this.http.post<ApiResponse<AiChatResponse>>(`${this.baseUrl}/chat`, request)
      .pipe(map(r => r.data!));
  }

  ragChat(request: AiChatRequest): Observable<AiChatResponse> {
    return this.http.post<ApiResponse<AiChatResponse>>(`${this.baseUrl}/rag-chat`, request)
      .pipe(map(r => r.data!));
  }

  planTrip(request: TripPlanRequest): Observable<TripPlanResponse> {
    return this.http.post<ApiResponse<TripPlanResponse>>(`${this.baseUrl}/plan-trip`, request)
      .pipe(map(r => r.data!));
  }

  getRecommendations(): Observable<string> {
    return this.http.get<ApiResponse<string>>(`${this.baseUrl}/recommendations`)
      .pipe(map(r => r.data || ''));
  }
}
