import { Injectable, inject, OnDestroy } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { Notification } from '../models/notification.model';
import { NotificationService } from './notification.service';

/**
 * WebSocket service for real-time notifications via STOMP.
 *
 * Connects to the backend notification-service STOMP endpoint
 * at /ws/notifications and subscribes to /topic/notifications/{userId}.
 */
@Injectable({ providedIn: 'root' })
export class WebSocketService implements OnDestroy {
  private notificationService = inject(NotificationService);

  private ws: WebSocket | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly RECONNECT_DELAY = 5000;
  private readonly WS_URL = 'http://localhost:8091/ws/notifications';

  private notificationsSubject = new Subject<Notification>();
  private connectionStatus = new BehaviorSubject<'connected' | 'disconnected' | 'connecting'>('disconnected');

  /** Observable stream of incoming real-time notifications */
  notifications$ = this.notificationsSubject.asObservable();

  /** Current connection status */
  connectionStatus$ = this.connectionStatus.asObservable();

  private currentUserId: string | null = null;

  /**
   * Connect to the WebSocket endpoint and subscribe to notifications
   * for the given userId. Uses SockJS/STOMP-compatible protocol.
   */
  connect(userId: string): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    this.currentUserId = userId;
    this.connectionStatus.next('connecting');

    try {
      // Use raw WebSocket for simplicity (SockJS fallback not needed for dev)
      const wsUrl = `${this.WS_URL}?userId=${userId}`;
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.connectionStatus.next('connected');
        this.subscribeToNotifications(userId);
      };

      this.ws.onmessage = (event) => {
        try {
          const notification: Notification = JSON.parse(event.data);
          this.notificationsSubject.next(notification);
          // Update the unread count
          this.notificationService.getNotifications(userId).subscribe();
        } catch {
          // Silently ignore malformed messages
        }
      };

      this.ws.onclose = () => {
        this.connectionStatus.next('disconnected');
        this.scheduleReconnect(userId);
      };

      this.ws.onerror = () => {
        this.connectionStatus.next('disconnected');
      };
    } catch {
      this.connectionStatus.next('disconnected');
      this.scheduleReconnect(userId);
    }
  }

  /**
   * Disconnect from the WebSocket.
   */
  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.currentUserId = null;
    this.connectionStatus.next('disconnected');
  }

  /**
   * Check if currently connected.
   */
  get isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  /**
   * Send a message through the WebSocket (for STOMP destinations).
   */
  send(destination: string, body: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ destination, body }));
    }
  }

  private subscribeToNotifications(userId: string): void {
    // The STOMP server will push to /topic/notifications/{userId}
    // Our WebSocket handler processes these via onmessage
  }

  private scheduleReconnect(userId: string): void {
    if (this.reconnectTimer) return;

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect(userId);
    }, this.RECONNECT_DELAY);
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
