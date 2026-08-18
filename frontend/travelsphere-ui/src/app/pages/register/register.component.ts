import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgIf } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, MatCardModule, MatInputModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, RouterLink, NgIf],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-logo">
          <h1>🌍 TravelSphere</h1>
          <p>Create your account and start exploring</p>
        </div>

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          <mat-form-field class="full-width" appearance="outline">
            <mat-label>Full Name</mat-label>
            <input matInput formControlName="fullName" placeholder="John Doe" />
            <mat-icon matIconPrefix>person</mat-icon>
            <mat-error *ngIf="registerForm.get('fullName')?.hasError('required')">Name is required</mat-error>
          </mat-form-field>

          <mat-form-field class="full-width" appearance="outline">
            <mat-label>Email</mat-label>
            <input matInput type="email" formControlName="email" placeholder="john@example.com" />
            <mat-icon matIconPrefix>email</mat-icon>
            <mat-error *ngIf="registerForm.get('email')?.hasError('required')">Email is required</mat-error>
            <mat-error *ngIf="registerForm.get('email')?.hasError('email')">Invalid email format</mat-error>
          </mat-form-field>

          <mat-form-field class="full-width" appearance="outline">
            <mat-label>Phone (optional)</mat-label>
            <input matInput formControlName="phone" placeholder="+91 98765 43210" />
            <mat-icon matIconPrefix>phone</mat-icon>
          </mat-form-field>

          <mat-form-field class="full-width" appearance="outline">
            <mat-label>Password</mat-label>
            <input matInput [type]="hidePassword ? 'password' : 'text'" formControlName="password" placeholder="Create a strong password" />
            <mat-icon matIconPrefix>lock</mat-icon>
            <button mat-icon-button matIconSuffix type="button" (click)="hidePassword = !hidePassword">
              <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
            <mat-error *ngIf="registerForm.get('password')?.hasError('required')">Password is required</mat-error>
            <mat-error *ngIf="registerForm.get('password')?.hasError('minlength')">Minimum 8 characters</mat-error>
          </mat-form-field>

          <div class="form-actions">
            <button mat-raised-button color="primary" class="full-width cta-button" type="submit" [disabled]="registerForm.invalid || loading">
              <mat-icon *ngIf="loading"><mat-spinner diameter="20"></mat-spinner></mat-icon>
              <span *ngIf="!loading">Create Account</span>
            </button>
          </div>

          <div class="auth-footer">
            <span>Already have an account?</span>
            <a routerLink="/login" mat-button color="primary">Sign In</a>
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
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  hidePassword = true;
  loading = false;
  error = '';

  registerForm = this.fb.nonNullable.group({
    fullName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  onSubmit() {
    if (this.registerForm.invalid) return;
    this.loading = true;
    this.error = '';

    this.authService.register(this.registerForm.getRawValue() as any).subscribe({
      next: () => {
        // New registration → show location permission
        this.router.navigate(['/enable-location']);
      },
      error: (err) => {
        this.error = err.error?.error || 'Registration failed. Please try again.';
        this.loading = false;
      },
    });
  }
}
