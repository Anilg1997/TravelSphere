import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { UserProfile, UpdateProfileRequest } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/users`;

  getProfile(): Observable<UserProfile> {
    return this.http.get<ApiResponse<UserProfile>>(`${this.baseUrl}/me`).pipe(map(r => r.data!));
  }

  updateProfile(request: UpdateProfileRequest): Observable<UserProfile> {
    return this.http.put<ApiResponse<UserProfile>>(`${this.baseUrl}/me`, request)
      .pipe(map(r => r.data!));
  }

  getLoyaltyPoints(): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/loyalty`).pipe(map(r => r.data));
  }

  getReferrals(): Observable<any[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.baseUrl}/referrals`).pipe(map(r => r.data || []));
  }

  exportUserData(): Observable<UserDataExport> {
    return this.http.get<ApiResponse<UserDataExport>>(`${this.baseUrl}/me/export`).pipe(map(r => r.data!));
  }
}

export interface UserDataExport {
  profile: {
    fullName: string;
    email: string | null;
    phone: string;
    role: string;
    emailVerified: boolean;
    createdAt: string;
  };
  loyaltyHistory: any[];
  referrals: any[];
  exportedAt: string;
}
