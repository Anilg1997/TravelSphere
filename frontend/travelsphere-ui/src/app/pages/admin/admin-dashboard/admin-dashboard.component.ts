import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, NgFor, NgIf, CurrencyPipe, DecimalPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [RouterLink, DatePipe, NgFor, NgIf, CurrencyPipe, DecimalPipe, MatCardModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatChipsModule],
  template: `
  <div class="admin-layout">
    <aside class="admin-sidebar">
      <div class="sidebar-brand">
        <mat-icon>shield</mat-icon>
        <span>Admin Panel</span>
      </div>
      <nav class="sidebar-nav">
        <a routerLink="/admin" class="nav-item active">
          <mat-icon>dashboard</mat-icon> Dashboard
        </a>
        <a routerLink="/admin/users" class="nav-item">
          <mat-icon>people</mat-icon> Users
        </a>
        <a routerLink="/admin/bookings" class="nav-item">
          <mat-icon>book_online</mat-icon> Bookings
        </a>
        <a routerLink="/admin/analytics" class="nav-item">
          <mat-icon>analytics</mat-icon> Analytics
        </a>
        <a routerLink="/admin/tickets" class="nav-item">
          <mat-icon>support</mat-icon> Support
        </a>
        <a routerLink="/admin/fraud-alerts" class="nav-item">
          <mat-icon>warning</mat-icon> Fraud Alerts
        </a>
        <a routerLink="/admin/system-health" class="nav-item">
          <mat-icon>monitor_heart</mat-icon> System
        </a>
        <a routerLink="/admin/n8n-workflows" class="nav-item">
          <mat-icon>hub</mat-icon> n8n Workflows
        </a>
      </nav>
    </aside>

    <main class="admin-main">
      <header class="admin-header">
        <h1>Dashboard</h1>
        <div class="header-actions">
          <span class="last-update">Last updated: {{ lastUpdated | date:'medium' }}</span>
          <button mat-raised-button color="primary" (click)="refresh()">
            <mat-icon>refresh</mat-icon> Refresh
          </button>
        </div>
      </header>

      <div *ngIf="!stats" class="loading-shimmer">
        <div *ngFor="let _ of [1,2,3,4]" class="shimmer-card"></div>
      </div>

      <div *ngIf="stats">
        <div class="stats-cards">
          <mat-card class="glass-card">
            <mat-card-content>
              <div class="stat-icon users"><mat-icon>people</mat-icon></div>
              <div class="stat-detail">
                <span class="stat-num">{{ stats.totalUsers | number }}</span>
                <span class="stat-label">Total Users</span>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="glass-card">
            <mat-card-content>
              <div class="stat-icon bookings"><mat-icon>book_online</mat-icon></div>
              <div class="stat-detail">
                <span class="stat-num">{{ stats.totalBookings | number }}</span>
                <span class="stat-label">Total Bookings</span>
                <span class="stat-sub">+{{ stats.todayBookings }} today</span>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="glass-card">
            <mat-card-content>
              <div class="stat-icon revenue"><mat-icon>account_balance</mat-icon></div>
              <div class="stat-detail">
                <span class="stat-num">{{ stats.totalRevenue | currency:'INR' }}</span>
                <span class="stat-label">Total Revenue</span>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="glass-card">
            <mat-card-content>
              <div class="stat-icon active"><mat-icon>flight_takeoff</mat-icon></div>
              <div class="stat-detail">
                <span class="stat-num">{{ stats.activeBookings | number }}</span>
                <span class="stat-label">Active Bookings</span>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <div class="stats-cards">
          <mat-card class="glass-card">
            <mat-card-content>
              <div class="stat-icon flights"><mat-icon>flight</mat-icon></div>
              <div class="stat-detail">
                <span class="stat-num">{{ stats.totalFlights | number }}</span>
                <span class="stat-label">Flight Bookings</span>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="glass-card">
            <mat-card-content>
              <div class="stat-icon hotels"><mat-icon>hotel</mat-icon></div>
              <div class="stat-detail">
                <span class="stat-num">{{ stats.totalHotels | number }}</span>
                <span class="stat-label">Hotel Bookings</span>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="glass-card" style="cursor:pointer" routerLink="/admin/fraud-alerts">
            <mat-card-content>
              <div class="stat-icon alerts" [class.has-alerts]="stats.openFraudAlerts > 0">
                <mat-icon>warning</mat-icon>
                <span class="alert-badge" *ngIf="stats.openFraudAlerts > 0">{{ stats.openFraudAlerts }}</span>
              </div>
              <div class="stat-detail">
                <span class="stat-num">{{ stats.openFraudAlerts | number }}</span>
                <span class="stat-label">Open Fraud Alerts</span>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="glass-card" style="cursor:pointer" routerLink="/admin/tickets">
            <mat-card-content>
              <div class="stat-icon support"><mat-icon>support_agent</mat-icon></div>
              <div class="stat-detail">
                <span class="stat-num">{{ stats.openSupportTickets | number }}</span>
                <span class="stat-label">Open Tickets</span>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <div class="quick-actions">
          <h3>Quick Actions</h3>
          <div class="action-chips">
            <button mat-raised-button color="primary" routerLink="/admin/users"><mat-icon>person_add</mat-icon> Manage Users</button>
            <button mat-raised-button color="accent" routerLink="/admin/bookings"><mat-icon>receipt</mat-icon> View Bookings</button>
            <button mat-raised-button color="warn" routerLink="/admin/fraud-alerts"><mat-icon>gavel</mat-icon> Review Alerts</button>
            <button mat-raised-button routerLink="/admin/analytics"><mat-icon>insights</mat-icon> Analytics</button>
          </div>
        </div>
      </div>
    </main>
  </div>
  `,
  styles: [`
    .admin-layout { display: flex; min-height: calc(100vh - 64px); background: #f0f2f5; }
    .admin-sidebar { width: 240px; background: #1a1a2e; padding: 24px 0; color: white; position: sticky; top: 64px; height: calc(100vh - 64px); }
    .sidebar-brand { display: flex; align-items: center; gap: 12px; padding: 0 20px 24px; font-size: 1.2rem; font-weight: 700; border-bottom: 1px solid rgba(255,255,255,0.1); margin-bottom: 16px; }
    .sidebar-nav { display: flex; flex-direction: column; gap: 4px; padding: 0 12px; }
    .nav-item { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: 12px; color: rgba(255,255,255,0.7); text-decoration: none; transition: all 0.2s; font-weight: 500; }
    .nav-item:hover, .nav-item.active { background: rgba(255,255,255,0.1); color: white; }
    .nav-item.active { background: var(--primary); }
    .admin-main { flex: 1; padding: 24px 32px; overflow-y: auto; }
    .admin-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
    .admin-header h1 { margin: 0; font-size: 1.8rem; font-weight: 700; }
    .last-update { color: #888; font-size: 0.85rem; margin-right: 16px; }
    .header-actions { display: flex; align-items: center; }
    .stats-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin-bottom: 24px; }
    .glass-card { background: rgba(255,255,255,0.9) !important; backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.2) !important; border-radius: 16px !important; }
    .glass-card mat-card-content { display: flex; align-items: center; gap: 20px; padding: 24px !important; }
    .stat-icon { width: 56px; height: 56px; border-radius: 16px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; position: relative; }
    .stat-icon mat-icon { font-size: 28px; width: 28px; height: 28px; }
    .stat-icon.users { background: #e3f2fd; color: #1565c0; }
    .stat-icon.bookings { background: #e8f5e9; color: #2e7d32; }
    .stat-icon.revenue { background: #fff3e0; color: #e65100; }
    .stat-icon.active { background: #f3e5f5; color: #7b1fa2; }
    .stat-icon.flights { background: #e0f7fa; color: #00838f; }
    .stat-icon.hotels { background: #fce4ec; color: #c62828; }
    .stat-icon.alerts { background: #fbe9e7; color: #bf360c; }
    .stat-icon.support { background: #f1f8e9; color: #558b2f; }
    .stat-icon.has-alerts { animation: pulse 2s infinite; }
    .alert-badge { position: absolute; top: -4px; right: -4px; background: #f44336; color: white; font-size: 0.7rem; font-weight: 700; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
    .stat-detail { display: flex; flex-direction: column; }
    .stat-num { font-size: 1.6rem; font-weight: 800; line-height: 1.2; }
    .stat-label { font-size: 0.85rem; color: #888; }
    .stat-sub { font-size: 0.75rem; color: var(--success); }
    .quick-actions { margin-top: 32px; }
    .quick-actions h3 { margin: 0 0 16px; font-size: 1.1rem; }
    .action-chips { display: flex; gap: 12px; flex-wrap: wrap; }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
    .loading-shimmer { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; }
    .shimmer-card { height: 100px; background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 16px; }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
  `]
})
export class AdminDashboardComponent {
  private adminService = inject(AdminService);
  stats: DashboardStats | null = null;
  lastUpdated = new Date();

  constructor() { this.refresh(); }

  refresh() {
    this.adminService.getDashboard().subscribe(s => { this.stats = s; this.lastUpdated = new Date(); });
  }
}

interface DashboardStats {
  totalUsers: number;
  totalBookings: number;
  totalRevenue: number;
  activeBookings: number;
  openFraudAlerts: number;
  openSupportTickets: number;
  todayBookings: number;
  revenueToday: number;
  totalFlights: number;
  totalHotels: number;
  totalPackages: number;
}
