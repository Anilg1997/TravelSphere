import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgIf } from '@angular/common';
import { LocationPermissionComponent } from '../../components/location-permission/location-permission.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, MatCardModule, MatInputModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, RouterLink, NgIf],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-logo">
          <h1>🌍 TravelSphere</h1>
          <p>Welcome back! Sign in to continue</p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <mat-form-field class="full-width" appearance="outline">
            <mat-label>Email</mat-label>
            <input matInput type="email" formControlName="email" placeholder="Enter your email" />
            <mat-icon matIconPrefix>email</mat-icon>
            <mat-error *ngIf="loginForm.get('email')?.hasError('required')">Email is required</mat-error>
            <mat-error *ngIf="loginForm.get('email')?.hasError('email')">Invalid email format</mat-error>
          </mat-form-field>

          <mat-form-field class="full-width" appearance="outline">
            <mat-label>Password</mat-label>
            <input matInput [type]="hidePassword ? 'password' : 'text'" formControlName="password" placeholder="Enter your password" />
            <mat-icon matIconPrefix>lock</mat-icon>
            <button mat-icon-button matIconSuffix type="button" (click)="hidePassword = !hidePassword">
              <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
            <mat-error *ngIf="loginForm.get('password')?.hasError('required')">Password is required</mat-error>
          </mat-form-field>

          <div class="form-actions">
            <button mat-raised-button color="primary" class="full-width cta-button" type="submit" [disabled]="loginForm.invalid || loading">
              <mat-icon *ngIf="loading"><mat-spinner diameter="20"></mat-spinner></mat-icon>
              <span *ngIf="!loading">Sign In</span>
            </button>
          </div>

          <div class="auth-footer">
            <span>Don't have an account?</span>
            <a routerLink="/register" mat-button color="primary">Create Account</a>
          </div>
        </form>

        <div *ngIf="error" class="error-message">{{ error }}</div>
      </div>
    </div>
  `,
  styles: [`
    .form-actions { margin: 24px 0 16px; }
    .auth-footer { text-align: center; color: #666; font-size: 0.9rem; }
    .error-message { background: #fce4ec; color: #c62828; padding: 12px; border-radius: 8px; margin-top: 16px; text-align: center; font-size: 0.9rem; }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  hidePassword = true;
  loading = false;
  error = '';

  loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  onSubmit() {
    if (this.loginForm.invalid) return;
    this.loading = true;
    this.error = '';

    this.authService.login(this.loginForm.getRawValue()).subscribe({
      next: () => {
        // First-time login → show location permission
        if (!localStorage.getItem('travelsphere_location_enabled')) {
          this.router.navigate(['/enable-location']);
        } else {
          this.router.navigate(['/home']);
        }
      },
      error: (err) => {
        this.error = err.error?.error || 'Invalid email or password';
        this.loading = false;
      },
    });
  }
}
