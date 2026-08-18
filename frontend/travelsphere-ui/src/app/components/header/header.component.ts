import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { NgIf, AsyncPipe } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatToolbarModule, MatButtonModule, MatIconModule, MatMenuModule, MatBadgeModule, MatTooltipModule, MatDividerModule, NgIf, AsyncPipe],
  template: `
    <mat-toolbar color="primary" class="app-header">
      <div class="header-container">
        <a routerLink="/home" class="brand">
          <mat-icon>flight_takeoff</mat-icon>
          <span class="brand-text">TravelSphere</span>
        </a>

        <nav class="nav-links">
          <a mat-button routerLink="/flights" routerLinkActive="active-link">Flights</a>
          <a mat-button routerLink="/hotels" routerLinkActive="active-link">Hotels</a>
          <a mat-button routerLink="/cars" routerLinkActive="active-link">Cars</a>
          <a mat-button routerLink="/packages" routerLinkActive="active-link">Packages</a>
          <a mat-button routerLink="/insurance" routerLinkActive="active-link">Insurance</a>
          <a mat-button routerLink="/ai/agent" routerLinkActive="active-link">AI Agent</a>
        </nav>

        <div class="header-actions">
          <a mat-icon-button routerLink="/search" matTooltip="Search">
            <mat-icon>search</mat-icon>
          </a>

          <button mat-icon-button *ngIf="authService.isLoggedIn()" [matTooltip]="'Notifications'" [matBadge]="(notificationService.unreadCount$ | async) || 0" matBadgeColor="warn" matBadgeSize="small" (click)="toggleNotifications()">
            <mat-icon>notifications</mat-icon>
          </button>

          <ng-container *ngIf="authService.isLoggedIn(); else loginBtn">
            <button mat-icon-button [matMenuTriggerFor]="userMenu">
              <mat-icon>account_circle</mat-icon>
            </button>
            <mat-menu #userMenu="matMenu">
              <button mat-menu-item routerLink="/profile">
                <mat-icon>person</mat-icon> Profile
              </button>
              <button mat-menu-item routerLink="/bookings">
                <mat-icon>book_online</mat-icon> My Bookings
              </button>
              <button mat-menu-item routerLink="/loyalty">
                <mat-icon>stars</mat-icon> Loyalty Points
              </button>
              <button mat-menu-item routerLink="/wallet">
                <mat-icon>account_balance_wallet</mat-icon> Wallet
              </button>
              <mat-divider></mat-divider>
              <button mat-menu-item routerLink="/admin">
                <mat-icon>shield</mat-icon> Admin Panel
              </button>
              <mat-divider></mat-divider>
              <button mat-menu-item (click)="logout()">
                <mat-icon>logout</mat-icon> Logout
              </button>
            </mat-menu>
          </ng-container>

          <ng-template #loginBtn>
            <a mat-button routerLink="/login" class="login-btn">Sign In</a>
            <a mat-raised-button routerLink="/register" class="register-btn">Sign Up</a>
          </ng-template>
        </div>
      </div>
    </mat-toolbar>
  `,
  styles: [`
    .app-header { position: sticky; top: 0; z-index: 100; box-shadow: 0 2px 8px rgba(0,0,0,0.12); height: 64px; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%) !important; }
    .header-container { display: flex; align-items: center; width: 100%; max-width: 1280px; margin: 0 auto; gap: 16px; }
    .brand { display: flex; align-items: center; gap: 8px; text-decoration: none; color: white; font-weight: 700; font-size: 1.3rem; }
    .brand-text { white-space: nowrap; }
    .nav-links { display: flex; gap: 4px; flex: 1; justify-content: center; }
    .nav-links a { color: rgba(255,255,255,0.9); font-weight: 500; }
    .nav-links a:hover { color: white; background: rgba(255,255,255,0.1); }
    .active-link { color: white !important; background: rgba(255,255,255,0.15) !important; }
    .header-actions { display: flex; align-items: center; gap: 4px; }
    .login-btn { color: white !important; border: 1px solid rgba(255,255,255,0.5) !important; margin-right: 8px; }
    .register-btn { background: white !important; color: var(--primary) !important; }
    @media (max-width: 768px) { .nav-links { display: none; } .brand-text { display: none; } }
  `]
})
export class HeaderComponent {
  authService = inject(AuthService);
  notificationService = inject(NotificationService);
  private router = inject(Router);

  logout() {
    this.authService.logout();
    this.router.navigate(['/home']);
  }

  toggleNotifications() {
    this.router.navigate(['/notifications']);
  }
}
