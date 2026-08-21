import { Component, inject, ViewChild } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { NgIf, AsyncPipe } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { NotificationPanelComponent } from '../notification-panel/notification-panel.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatToolbarModule, MatButtonModule, MatIconModule, MatMenuModule, MatBadgeModule, MatSidenavModule, MatListModule, MatTooltipModule, MatDividerModule, NgIf, AsyncPipe, NotificationPanelComponent],
  template: `
    <mat-sidenav-container class="sidenav-container">
      <mat-sidenav #sidenav mode="over" (closedStart)="onSidenavClose()" class="mobile-sidenav">
        <div class="sidenav-header">
          <mat-icon>flight_takeoff</mat-icon>
          <span>TravelSphere</span>
        </div>
        <mat-nav-list>
          <a mat-list-item routerLink="/home" routerLinkActive="active-sidenav" (click)="sidenav.close()">
            <mat-icon matListItemIcon>home</mat-icon>
            <span matListItemTitle>Home</span>
          </a>
          <a mat-list-item routerLink="/nearby" routerLinkActive="active-sidenav" (click)="sidenav.close()">
            <mat-icon matListItemIcon>explore</mat-icon>
            <span matListItemTitle>Nearby Discovery</span>
          </a>
          <a mat-list-item routerLink="/flights" routerLinkActive="active-sidenav" (click)="sidenav.close()">
            <mat-icon matListItemIcon>flight</mat-icon>
            <span matListItemTitle>Flights</span>
          </a>
          <a mat-list-item routerLink="/hotels" routerLinkActive="active-sidenav" (click)="sidenav.close()">
            <mat-icon matListItemIcon>hotel</mat-icon>
            <span matListItemTitle>Hotels</span>
          </a>
          <a mat-list-item routerLink="/food" routerLinkActive="active-sidenav" (click)="sidenav.close()">
            <mat-icon matListItemIcon>restaurant</mat-icon>
            <span matListItemTitle>Food Delivery</span>
          </a>
          <a mat-list-item routerLink="/cars" routerLinkActive="active-sidenav" (click)="sidenav.close()">
            <mat-icon matListItemIcon>directions_car</mat-icon>
            <span matListItemTitle>Cars</span>
          </a>
          <a mat-list-item routerLink="/packages" routerLinkActive="active-sidenav" (click)="sidenav.close()">
            <mat-icon matListItemIcon>luggage</mat-icon>
            <span matListItemTitle>Packages</span>
          </a>
          <a mat-list-item routerLink="/transport" routerLinkActive="active-sidenav" (click)="sidenav.close()">
            <mat-icon matListItemIcon>train</mat-icon>
            <span matListItemTitle>Transport</span>
          </a>
          <a mat-list-item routerLink="/insurance" routerLinkActive="active-sidenav" (click)="sidenav.close()">
            <mat-icon matListItemIcon>health_and_safety</mat-icon>
            <span matListItemTitle>Insurance</span>
          </a>
          <a mat-list-item routerLink="/ai/agent" routerLinkActive="active-sidenav" (click)="sidenav.close()">
            <mat-icon matListItemIcon>smart_toy</mat-icon>
            <span matListItemTitle>AI Agent</span>
          </a>
          <mat-divider></mat-divider>
          <ng-container *ngIf="authService.isLoggedIn()">
            <a mat-list-item routerLink="/food/orders" routerLinkActive="active-sidenav" (click)="sidenav.close()">
              <mat-icon matListItemIcon>receipt_long</mat-icon>
              <span matListItemTitle>My Food Orders</span>
            </a>
            <a mat-list-item routerLink="/profile" routerLinkActive="active-sidenav" (click)="sidenav.close()">
              <mat-icon matListItemIcon>person</mat-icon>
              <span matListItemTitle>Profile</span>
            </a>
            <a mat-list-item routerLink="/bookings" routerLinkActive="active-sidenav" (click)="sidenav.close()">
              <mat-icon matListItemIcon>book_online</mat-icon>
              <span matListItemTitle>My Bookings</span>
            </a>
            <a mat-list-item routerLink="/notifications" routerLinkActive="active-sidenav" (click)="sidenav.close()">
              <mat-icon matListItemIcon>notifications</mat-icon>
              <span matListItemTitle>Notifications</span>
            </a>
            <a mat-list-item routerLink="/settings" routerLinkActive="active-sidenav" (click)="sidenav.close()">
              <mat-icon matListItemIcon>settings</mat-icon>
              <span matListItemTitle>Settings</span>
            </a>
            <mat-divider></mat-divider>
            <a mat-list-item (click)="logout(); sidenav.close()">
              <mat-icon matListItemIcon>logout</mat-icon>
              <span matListItemTitle>Logout</span>
            </a>
          </ng-container>
          <ng-container *ngIf="!authService.isLoggedIn()">
            <mat-divider></mat-divider>
            <a mat-list-item routerLink="/login" (click)="sidenav.close()">
              <mat-icon matListItemIcon>login</mat-icon>
              <span matListItemTitle>Sign In</span>
            </a>
            <a mat-list-item routerLink="/register" (click)="sidenav.close()">
              <mat-icon matListItemIcon>person_add</mat-icon>
              <span matListItemTitle>Sign Up</span>
            </a>
          </ng-container>
        </mat-nav-list>
      </mat-sidenav>

      <mat-sidenav-content>
        <mat-toolbar color="primary" class="app-header">
          <div class="header-container">
            <button mat-icon-button class="hamburger-btn" (click)="sidenav.toggle()">
              <mat-icon>menu</mat-icon>
            </button>

            <a routerLink="/home" class="brand">
              <mat-icon>flight_takeoff</mat-icon>
              <span class="brand-text">TravelSphere</span>
            </a>

            <nav class="nav-links">
              <a mat-button routerLink="/nearby" routerLinkActive="active-link">
                <mat-icon style="font-size:18px;height:18px;width:18px;margin-right:2px;vertical-align:middle">explore</mat-icon>
                Nearby
              </a>
              <a mat-button routerLink="/flights" routerLinkActive="active-link">Flights</a>
              <a mat-button routerLink="/hotels" routerLinkActive="active-link">Hotels</a>
              <a mat-button routerLink="/food" routerLinkActive="active-link">Food</a>
              <a mat-button routerLink="/cars" routerLinkActive="active-link">Cars</a>
              <a mat-button routerLink="/packages" routerLinkActive="active-link">Packages</a>
              <a mat-button routerLink="/insurance" routerLinkActive="active-link">Insurance</a>
              <a mat-button routerLink="/ai/agent" routerLinkActive="active-link">AI Agent</a>
            </nav>

            <div class="header-actions">
              <a mat-icon-button routerLink="/search" matTooltip="Search">
                <mat-icon>search</mat-icon>
              </a>

              <!-- Notification bell with dropdown panel -->
              <div class="notif-wrapper" *ngIf="authService.isLoggedIn()">
                <button mat-icon-button [matTooltip]="'Notifications'" [matBadge]="(notificationService.unreadCount$ | async) || 0" matBadgeColor="warn" matBadgeSize="small" (click)="toggleNotifications($event)">
                  <mat-icon>notifications</mat-icon>
                </button>
                <app-notification-panel
                  [isOpen]="showNotifications"
                  (close)="showNotifications = false"
                ></app-notification-panel>
              </div>

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
                  <button mat-menu-item routerLink="/food/orders">
                    <mat-icon>restaurant</mat-icon> Food Orders
                  </button>
                  <button mat-menu-item routerLink="/loyalty">
                    <mat-icon>stars</mat-icon> Loyalty Points
                  </button>
                  <button mat-menu-item routerLink="/wallet">
                    <mat-icon>account_balance_wallet</mat-icon> Wallet
                  </button>
                  <mat-divider></mat-divider>
                  <button mat-menu-item routerLink="/settings">
                    <mat-icon>settings</mat-icon> Settings
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
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    :host { display: block; }
    .sidenav-container { min-height: 64px; }
    .mobile-sidenav { width: 280px; }
    .sidenav-header {
      display: flex; align-items: center; gap: 12px;
      padding: 20px 16px 16px; font-size: 1.2rem; font-weight: 700;
      color: var(--primary); border-bottom: 1px solid #eee;
    }
    .active-sidenav { background: rgba(0,0,0,0.04) !important; }
    .app-header { position: sticky; top: 0; z-index: 100; box-shadow: 0 2px 8px rgba(0,0,0,0.12); height: 64px; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%) !important; }
    .header-container { display: flex; align-items: center; width: 100%; max-width: 1280px; margin: 0 auto; gap: 16px; }
    .hamburger-btn { display: none; color: white; }
    .brand { display: flex; align-items: center; gap: 8px; text-decoration: none; color: white; font-weight: 700; font-size: 1.3rem; }
    .brand-text { white-space: nowrap; }
    .nav-links { display: flex; gap: 4px; flex: 1; justify-content: center; }
    .nav-links a { color: rgba(255,255,255,0.9); font-weight: 500; }
    .nav-links a:hover { color: white; background: rgba(255,255,255,0.1); }
    .active-link { color: white !important; background: rgba(255,255,255,0.15) !important; }
    .header-actions { display: flex; align-items: center; gap: 4px; }
    .login-btn { color: white !important; border: 1px solid rgba(255,255,255,0.5) !important; margin-right: 8px; }
    .register-btn { background: white !important; color: var(--primary) !important; }
    .notif-wrapper { position: relative; }
    @media (max-width: 768px) {
      .nav-links { display: none; }
      .brand-text { display: none; }
      .hamburger-btn { display: inline-flex; }
      .login-btn, .register-btn { display: none; }
    }
  `]
})
export class HeaderComponent {
  @ViewChild('sidenav') sidenav!: MatSidenav;
  authService = inject(AuthService);
  notificationService = inject(NotificationService);
  private router = inject(Router);

  showNotifications = false;

  logout() {
    this.authService.logout();
    this.router.navigate(['/home']);
  }

  toggleNotifications(event: Event) {
    event.stopPropagation();
    this.showNotifications = !this.showNotifications;
  }

  onSidenavClose() {
    // Sidenav closing animation
  }
}
