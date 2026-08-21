import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { LoginRequest, RegisterRequest, AuthResponse, UserProfile, ChangePasswordRequest, ChangeEmailRequest } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/auth`;

  private userSubject = new BehaviorSubject<UserProfile | null>(this.getStoredUser());
  user$ = this.userSubject.asObservable();

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.baseUrl}/login`, request).pipe(
      map(r => r.data!),
      tap(res => {
        localStorage.setItem('travelsphere_token', res.accessToken);
        localStorage.setItem('travelsphere_user', JSON.stringify(res.user));
        this.userSubject.next(res.user);
      })
    );
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.baseUrl}/register`, request).pipe(
      map(r => r.data!),
      tap(res => {
        localStorage.setItem('travelsphere_token', res.accessToken);
        localStorage.setItem('travelsphere_user', JSON.stringify(res.user));
        this.userSubject.next(res.user);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('travelsphere_token');
    localStorage.removeItem('travelsphere_user');
    this.userSubject.next(null);
  }

  getProfile(): Observable<UserProfile> {
    return this.http.get<ApiResponse<UserProfile>>(`${this.baseUrl}/me`).pipe(map(r => r.data!));
  }

  getToken(): string | null {
    return localStorage.getItem('travelsphere_token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  private getStoredUser(): UserProfile | null {
    const stored = localStorage.getItem('travelsphere_user');
    return stored ? JSON.parse(stored) : null;
  }

  changePassword(request: ChangePasswordRequest): Observable<void> {
    return this.http.put<ApiResponse<void>>(`${this.baseUrl}/change-password`, request).pipe(
      map(() => undefined)
    );
  }

  changeEmail(request: ChangeEmailRequest): Observable<void> {
    return this.http.put<ApiResponse<void>>(`${this.baseUrl}/change-email`, request).pipe(
      map(() => undefined)
    );
  }

  deleteAccount(): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/me`).pipe(
      map(() => undefined)
    );
  }
}
