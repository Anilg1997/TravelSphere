import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { NgIf, DatePipe } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { UserProfile } from '../../models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, MatCardModule, MatButtonModule, MatIconModule, MatInputModule, MatFormFieldModule, MatProgressSpinnerModule, MatTabsModule, MatSnackBarModule, NgIf, DatePipe],
  template: `
    <div class="page-container" style="max-width:700px">
      <div *ngIf="!profile" style="text-align:center;padding:60px"><mat-spinner diameter="40" style="margin:0 auto"></mat-spinner></div>

      <div *ngIf="profile">
        <mat-card style="text-align:center;padding:32px;margin-bottom:24px">
          <mat-icon style="font-size:72px;width:72px;height:72px;color:var(--primary)">account_circle</mat-icon>
          <h2 style="margin:12px 0 4px">{{ profile.fullName }}</h2>
          <p style="color:#666;margin:0">{{ profile.email }}</p>
          <p style="color:#666;font-size:0.9rem">{{ profile.phone }} · {{ profile.role }}</p>
          <p style="color:#999;font-size:0.85rem">Joined: {{ profile.createdAt | date }}</p>
          <div style="display:flex;gap:12px;justify-content:center;margin-top:16px;flex-wrap:wrap">
            <button mat-raised-button color="primary" routerLink="/bookings"><mat-icon>book_online</mat-icon> My Bookings</button>
            <button mat-stroked-button routerLink="/loyalty"><mat-icon>stars</mat-icon> Loyalty</button>
            <button mat-stroked-button routerLink="/wallet"><mat-icon>account_balance_wallet</mat-icon> Wallet</button>
            <button mat-stroked-button routerLink="/settings"><mat-icon>settings</mat-icon> Settings</button>
          </div>
        </mat-card>

        <div class="form-section">
          <h2>Edit Profile</h2>
          <form>
            <mat-form-field class="full-width" appearance="outline"><mat-label>Full Name</mat-label><input matInput [formControl]="nameCtrl" [value]="profile.fullName" /></mat-form-field>
            <mat-form-field class="full-width" appearance="outline"><mat-label>Phone</mat-label><input matInput [formControl]="phoneCtrl" [value]="profile.phone" /></mat-form-field>
            <button mat-raised-button color="primary" (click)="saveProfile()">Save Changes</button>
          </form>
        </div>
      </div>
    </div>
  `
})
export class ProfileComponent {
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private snackBar = inject(MatSnackBar);
  private fb = inject(FormBuilder);

  profile: UserProfile | null = null;
  nameCtrl = this.fb.control('');
  phoneCtrl = this.fb.control('');

  constructor() {
    this.authService.user$.subscribe(u => {
      if (u) {
        this.profile = u;
        this.nameCtrl.setValue(u.fullName);
        this.phoneCtrl.setValue(u.phone);
      }
    });
  }

  saveProfile() {
    this.userService.updateProfile({
      fullName: this.nameCtrl.value || undefined,
      phone: this.phoneCtrl.value || undefined,
    } as any).subscribe(() => {
      this.snackBar.open('Profile updated!', 'Close', { duration: 3000 });
    });
  }
}
