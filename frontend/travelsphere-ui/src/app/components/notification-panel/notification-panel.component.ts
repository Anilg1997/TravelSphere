import { Component, inject, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subscription } from 'rxjs';
import { NotificationService } from '../../services/notification.service';
import { AuthService } from '../../services/auth.service';
import { WebSocketService } from '../../services/websocket.service';
import { Notification } from '../../models/notification.model';

@Component({
  selector: 'app-notification-panel',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    DatePipe,
    MatIconModule,
    MatButtonModule,
    MatBadgeModule,
    MatDividerModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="notif-panel" *ngIf="isOpen" (click)="$event.stopPropagation()">
      <div class="notif-panel-header">
        <div class="notif-header-left">
          <h3>Notifications</h3>
          <span class="ws-status" [class.connected]="wsConnected" [class.connecting]="wsConnecting"
                matTooltip="{{ wsConnected ? 'Real-time updates active' : wsConnecting ? 'Connecting...' : 'Disconnected' }}">
            <span class="ws-dot"></span>
            {{ wsConnected ? 'Live' : wsConnecting ? 'Connecting...' : 'Offline' }}
          </span>
        </div>
        <div class="notif-header-actions">
          <button mat-icon-button *ngIf="notifications.length > 0" (click)="markAllRead()" matTooltip="Mark all as read">
            <mat-icon>done_all</mat-icon>
          </button>
          <button mat-icon-button (click)="close.emit()" matTooltip="Close">
            <mat-icon>close</mat-icon>
          </button>
        </div>
      </div>

      <mat-divider></mat-divider>

      <div class="notif-list" *ngIf="!loading; else loadingTpl">
        <div *ngIf="notifications.length === 0" class="notif-empty">
          <mat-icon>notifications_none</mat-icon>
          <p>No notifications yet</p>
          <span>You're all caught up!</span>
        </div>

        <div
          *ngFor="let n of notifications; trackBy: trackById"
          class="notif-item"
          [class.unread]="!n.isRead"
          [class.new-notification]="n._isNew"
          (click)="onNotificationClick(n)"
        >
          <div class="notif-icon-wrapper">
            <mat-icon [class]="'notif-icon notif-icon-' + n.type.toLowerCase()">
              {{ getIcon(n.type) }}
            </mat-icon>
            <div class="unread-dot" *ngIf="!n.isRead"></div>
          </div>
          <div class="notif-content">
            <div class="notif-title">{{ n.title }}</div>
            <div class="notif-message">{{ n.message }}</div>
            <div class="notif-time">{{ n.createdAt | date:'short' }}</div>
          </div>
        </div>
      </div>

      <ng-template #loadingTpl>
        <div class="notif-loading">
          <mat-spinner diameter="28"></mat-spinner>
        </div>
      </ng-template>

      <mat-divider *ngIf="notifications.length > 0"></mat-divider>

      <div class="notif-panel-footer" *ngIf="notifications.length > 0">
        <a mat-button routerLink="/notifications" (click)="close.emit()">
          View all notifications
        </a>
      </div>
    </div>
  `,
  styles: [`
    .notif-panel {
      position: absolute;
      top: 100%;
      right: 0;
      width: 380px;
      max-height: 500px;
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
      overflow: hidden;
      z-index: 200;
      animation: slideDown 0.2s ease-out;
    }

    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .notif-panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
    }

    .notif-header-left {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .notif-panel-header h3 {
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
      color: #1a1a2e;
    }

    .ws-status {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 0.65rem;
      color: #999;
      font-weight: 500;
    }

    .ws-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #ccc;
      transition: background 0.3s;
    }

    .ws-status.connected .ws-dot {
      background: #4caf50;
      animation: pulse 2s infinite;
    }

    .ws-status.connecting .ws-dot {
      background: #ff9800;
      animation: pulse 1s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }

    .notif-header-actions {
      display: flex;
      gap: 2px;
    }

    .notif-list {
      max-height: 360px;
      overflow-y: auto;
    }

    .notif-list::-webkit-scrollbar {
      width: 4px;
    }

    .notif-list::-webkit-scrollbar-thumb {
      background: #ccc;
      border-radius: 2px;
    }

    .notif-empty {
      text-align: center;
      padding: 32px 16px;
      color: #999;
    }

    .notif-empty mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #ccc;
    }

    .notif-empty p {
      margin: 12px 0 4px;
      font-weight: 500;
      color: #666;
    }

    .notif-empty span {
      font-size: 0.85rem;
    }

    .notif-item {
      display: flex;
      gap: 12px;
      padding: 12px 16px;
      cursor: pointer;
      transition: background 0.15s;
      position: relative;
    }

    .notif-item:hover {
      background: #f5f5f5;
    }

    .notif-item.unread {
      background: rgba(30, 75, 71, 0.04);
    }

    .notif-item.unread:hover {
      background: rgba(30, 75, 71, 0.08);
    }

    .notif-item.new-notification {
      animation: slideInNotification 0.4s ease-out;
    }

    @keyframes slideInNotification {
      from {
        opacity: 0;
        transform: translateX(-20px);
        background: rgba(30, 75, 71, 0.12);
      }
      to {
        opacity: 1;
        transform: translateX(0);
        background: rgba(30, 75, 71, 0.04);
      }
    }

    .notif-icon-wrapper {
      position: relative;
      flex-shrink: 0;
    }

    .notif-icon {
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: #f0f0f0;
      color: #666;
      font-size: 18px;
    }

    .notif-icon-booking { background: #e3f2fd; color: #1565c0; }
    .notif-icon-payment { background: #e8f5e9; color: #2e7d32; }
    .notif-icon-system { background: #f3e5f5; color: #7b1fa2; }
    .notif-icon-promo { background: #fff3e0; color: #e65100; }
    .notif-icon-food { background: #fce4ec; color: #c62828; }
    .notif-icon-security { background: #ede7f6; color: #4527a0; }

    .unread-dot {
      position: absolute;
      top: 0;
      right: 0;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #3b82f6;
      border: 2px solid #fff;
    }

    .notif-content {
      flex: 1;
      min-width: 0;
    }

    .notif-title {
      font-size: 0.85rem;
      font-weight: 600;
      color: #1a1a2e;
      margin-bottom: 2px;
    }

    .notif-message {
      font-size: 0.8rem;
      color: #666;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .notif-time {
      font-size: 0.7rem;
      color: #999;
      margin-top: 4px;
    }

    .notif-loading {
      display: flex;
      justify-content: center;
      padding: 32px;
    }

    .notif-panel-footer {
      text-align: center;
      padding: 8px;
    }

    .notif-panel-footer a {
      font-size: 0.85rem;
      color: #1e4b47;
      font-weight: 500;
    }

    /* ── Dark theme ── */
    :host-context(.dark-theme) .notif-panel {
      background: #2a2a2a;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
    }

    :host-context(.dark-theme) .notif-panel-header h3 {
      color: #e0e0e0;
    }

    :host-context(.dark-theme) .notif-item:hover {
      background: #333;
    }

    :host-context(.dark-theme) .notif-item.unread {
      background: rgba(121, 134, 203, 0.1);
    }

    :host-context(.dark-theme) .notif-title {
      color: #e0e0e0;
    }

    :host-context(.dark-theme) .notif-message {
      color: #aaa;
    }

    :host-context(.dark-theme) .notif-empty p {
      color: #ccc;
    }

    @media (max-width: 480px) {
      .notif-panel {
        position: fixed;
        top: 64px;
        right: 0;
        left: 0;
        width: 100%;
        max-height: calc(100vh - 64px);
        border-radius: 0;
      }
    }
  `]
})
export class NotificationPanelComponent implements OnInit, OnDestroy {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();

  notificationService = inject(NotificationService);
  authService = inject(AuthService);
  private wsService = inject(WebSocketService);

  notifications: Notification[] = [];
  loading = true;
  wsConnected = false;
  wsConnecting = false;

  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    this.loadNotifications();
    this.setupWebSocket();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  private loadNotifications(): void {
    this.loading = true;
    this.notificationService.getNotifications('user').subscribe({
      next: (notifs) => {
        this.notifications = notifs;
        this.loading = false;
      },
      error: () => {
        this.notifications = [];
        this.loading = false;
      },
    });
  }

  private setupWebSocket(): void {
    // Subscribe to connection status
    const statusSub = this.wsService.connectionStatus$.subscribe(status => {
      this.wsConnected = status === 'connected';
      this.wsConnecting = status === 'connecting';
    });
    this.subscriptions.push(statusSub);

    // Subscribe to real-time notifications
    const notifSub = this.wsService.notifications$.subscribe(notification => {
      // Add to top of list with animation marker
      const newNotif = { ...notification, _isNew: true } as Notification & { _isNew: boolean };
      this.notifications = [newNotif as Notification, ...this.notifications];

      // Remove animation class after animation completes
      setTimeout(() => {
        (newNotif as any)._isNew = false;
      }, 500);
    });
    this.subscriptions.push(notifSub);

    // Connect if user is logged in
    this.wsService.connect('user');
  }

  onNotificationClick(n: Notification): void {
    if (!n.isRead) {
      this.notificationService.markAsRead(n.id).subscribe(() => {
        n.isRead = true;
        this.notificationService['unreadCount'].next(
          this.notifications.filter(x => !x.isRead).length
        );
      });
    }
  }

  markAllRead(): void {
    const unread = this.notifications.filter(n => !n.isRead);
    unread.forEach(n => {
      this.notificationService.markAsRead(n.id).subscribe(() => {
        n.isRead = true;
        this.notificationService['unreadCount'].next(
          this.notifications.filter(x => !x.isRead).length
        );
      });
    });
  }

  getIcon(type: string): string {
    const icons: Record<string, string> = {
      BOOKING: 'book_online',
      PAYMENT: 'payment',
      SYSTEM: 'info',
      PROMO: 'local_offer',
      FOOD: 'restaurant',
      SECURITY: 'security',
    };
    return icons[type] || 'notifications';
  }

  trackById(_index: number, n: Notification): string {
    return n.id;
  }
}
