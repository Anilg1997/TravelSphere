import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgFor, NgIf, CurrencyPipe, DecimalPipe, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatStepperModule } from '@angular/material/stepper';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subscription, interval } from 'rxjs';
import { FoodDeliveryService } from '../../../services/food-delivery.service';
import { FoodOrderResponse } from '../../../models/food-delivery.model';

@Component({
  selector: 'app-food-order-tracking',
  standalone: true,
  imports: [RouterLink, NgFor, NgIf, CurrencyPipe, DecimalPipe, DatePipe, MatCardModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatStepperModule, MatSnackBarModule],
  template: `
    <div class="page-container">
      <h1 class="section-title">Order Tracking</h1>

      <div *ngIf="loading" style="text-align:center;padding:40px">
        <mat-spinner diameter="40" style="margin:0 auto"></mat-spinner>
      </div>

      <div *ngIf="order && !loading">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px">
          <div>
            <p style="color:#666;margin:0">Order #{{ order.orderRef }}</p>
            <h2 style="margin:4px 0 0 0">{{ order.restaurantName }}</h2>
          </div>
          <div style="text-align:right">
            <span [class]="'status-badge status-' + order.status.toLowerCase()">{{ order.status }}</span>
            <p *ngIf="isLiveUpdating" class="live-indicator">
              <span class="live-dot"></span> Updating in real-time
            </p>
          </div>
        </div>

        <!-- Status Timeline -->
        <mat-card class="feature-card" style="margin-bottom:24px">
          <mat-card-content>
            <div class="timeline">
              <div class="timeline-step" [class.active]="isStepActive('PLACED')" [class.completed]="isStepCompleted('PLACED')">
                <div class="step-icon-wrapper">
                  <mat-icon class="step-icon">receipt_long</mat-icon>
                </div>
                <span class="step-label">Placed</span>
              </div>
              <div class="timeline-connector" [class.active]="isStepActive('PREPARING')"></div>
              <div class="timeline-step" [class.active]="isStepActive('PREPARING')" [class.completed]="isStepCompleted('PREPARING')">
                <div class="step-icon-wrapper">
                  <mat-icon class="step-icon">soup_kitchen</mat-icon>
                </div>
                <span class="step-label">Preparing</span>
              </div>
              <div class="timeline-connector" [class.active]="isStepActive('OUT_FOR_DELIVERY')"></div>
              <div class="timeline-step" [class.active]="isStepActive('OUT_FOR_DELIVERY')" [class.completed]="isStepCompleted('OUT_FOR_DELIVERY')">
                <div class="step-icon-wrapper">
                  <mat-icon class="step-icon">delivery_dining</mat-icon>
                </div>
                <span class="step-label">On the way</span>
              </div>
              <div class="timeline-connector" [class.active]="isStepActive('DELIVERED')"></div>
              <div class="timeline-step" [class.active]="isStepActive('DELIVERED')" [class.completed]="isStepCompleted('DELIVERED')">
                <div class="step-icon-wrapper">
                  <mat-icon class="step-icon">check_circle</mat-icon>
                </div>
                <span class="step-label">Delivered</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <div class="order-grid">
          <!-- Order Details -->
          <div>
            <mat-card class="feature-card">
              <mat-card-header>
                <mat-icon class="card-icon">shopping_bag</mat-icon>
                <mat-card-title>Order Items</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div *ngFor="let item of order.items; let last = last" class="order-item" [style.border-bottom]="'1px solid #eee'">
                  <div>
                    <span style="font-weight:500">{{ item.itemName }}</span>
                    <span style="color:#666;margin-left:8px">× {{ item.quantity }}</span>
                    <p *ngIf="item.specialInstructions" style="margin:4px 0 0;font-size:0.85rem;color:#999">Note: {{ item.specialInstructions }}</p>
                  </div>
                  <span style="font-weight:600">₹{{ item.totalPrice | number:'1.2-2' }}</span>
                </div>
              </mat-card-content>
            </mat-card>
          </div>

          <!-- Payment Summary -->
          <div>
            <mat-card class="feature-card">
              <mat-card-header>
                <mat-icon class="card-icon">payment</mat-icon>
                <mat-card-title>Payment Details</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="payment-row">
                  <span>Subtotal</span><span>₹{{ order.subtotal | number:'1.2-2' }}</span>
                </div>
                <div class="payment-row">
                  <span>Delivery Fee</span><span>₹{{ order.deliveryFee | number:'1.2-2' }}</span>
                </div>
                <div class="payment-row">
                  <span>Tax</span><span>₹{{ order.tax | number:'1.2-2' }}</span>
                </div>
                <div class="payment-total">
                  <span style="font-weight:700">Total</span>
                  <span style="font-weight:700;color:var(--primary)">₹{{ order.totalAmount | number:'1.2-2' }}</span>
                </div>
                <div class="delivery-estimate">
                  <p style="margin:0;font-size:0.85rem;color:#666">Estimated Delivery</p>
                  <p style="margin:4px 0 0;font-weight:600">{{ order.estimatedDeliveryTime | date:'short' }}</p>
                </div>
              </mat-card-content>
            </mat-card>

            <button mat-stroked-button color="warn" style="width:100%;margin-top:16px" (click)="cancelOrder()"
                    *ngIf="order.status !== 'DELIVERED' && order.status !== 'CANCELLED'">
              <mat-icon>cancel</mat-icon> Cancel Order
            </button>
          </div>
        </div>

        <div style="text-align:center;margin-top:24px">
          <a mat-button routerLink="/food"><mat-icon>arrow_back</mat-icon> Back to Restaurants</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .status-badge {
      display: inline-block;
      padding: 6px 16px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 0.85rem;
      text-transform: uppercase;
    }
    .status-placed { background: #e3f2fd; color: #1565c0; }
    .status-preparing { background: #fff3e0; color: #e65100; }
    .status-out_for_delivery { background: #e8f5e9; color: #2e7d32; }
    .status-delivered { background: #e8f5e9; color: #1b5e20; }
    .status-cancelled { background: #fce4ec; color: #c62828; }

    .live-indicator {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-top: 6px;
      font-size: 0.75rem;
      color: #4caf50;
      font-weight: 500;
    }

    .live-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #4caf50;
      animation: livePulse 1.5s ease-in-out infinite;
    }

    @keyframes livePulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(1.3); }
    }

    .timeline {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 0;
    }

    .timeline-step {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      opacity: 0.3;
      transition: opacity 0.3s ease;
    }

    .timeline-step.active {
      opacity: 1;
    }

    .timeline-step.completed .step-icon-wrapper {
      background: var(--primary);
      color: #fff;
    }

    .step-icon-wrapper {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f0f0f0;
      color: #999;
      transition: all 0.3s ease;
    }

    .timeline-step.active .step-icon-wrapper {
      background: rgba(63, 81, 181, 0.15);
      color: var(--primary);
      box-shadow: 0 0 0 4px rgba(63, 81, 181, 0.1);
    }

    .timeline-step.completed .step-icon-wrapper {
      box-shadow: 0 0 0 4px rgba(63, 81, 181, 0.15);
    }

    .step-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .step-label {
      font-size: 0.8rem;
      font-weight: 500;
      color: #666;
    }

    .timeline-step.active .step-label {
      color: var(--primary);
      font-weight: 600;
    }

    .timeline-connector {
      flex: 1;
      height: 3px;
      background: #e0e0e0;
      margin: 0 8px;
      border-radius: 2px;
      transition: background 0.3s ease;
      margin-bottom: 22px;
    }

    .timeline-connector.active {
      background: var(--primary);
    }

    .order-grid {
      display: grid;
      grid-template-columns: 1fr 380px;
      gap: 24px;
    }

    .order-item {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
    }

    .payment-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
    }

    .payment-total {
      border-top: 2px solid #eee;
      margin-top: 8px;
      padding-top: 12px;
      display: flex;
      justify-content: space-between;
    }

    .delivery-estimate {
      margin-top: 16px;
      padding: 12px;
      background: #f5f5f5;
      border-radius: 8px;
    }

    @media (max-width: 768px) {
      .order-grid {
        grid-template-columns: 1fr;
      }

      .timeline {
        flex-wrap: wrap;
        gap: 8px;
      }

      .timeline-connector {
        display: none;
      }
    }
  `]
})
export class FoodOrderTrackingComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private foodService = inject(FoodDeliveryService);
  private snackBar = inject(MatSnackBar);

  order: FoodOrderResponse | null = null;
  loading = true;
  isLiveUpdating = false;

  private statusOrder = ['PLACED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED'];
  private subscriptions: Subscription[] = [];
  private orderRef = '';

  ngOnInit() {
    this.orderRef = this.route.snapshot.paramMap.get('ref')!;
    this.loadOrder(this.orderRef);

    // Auto-refresh every 15 seconds for active orders
    const pollSub = interval(15000).subscribe(() => {
      if (this.order && this.isOrderActive()) {
        this.refreshOrder();
      }
    });
    this.subscriptions.push(pollSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  loadOrder(ref: string) {
    this.foodService.getOrder(ref).subscribe({
      next: (order) => {
        this.order = order;
        this.loading = false;
        this.isLiveUpdating = this.isOrderActive();
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Order not found', 'OK', { duration: 3000 });
      }
    });
  }

  private refreshOrder(): void {
    this.foodService.getOrder(this.orderRef).subscribe({
      next: (order) => {
        if (this.order && order.status !== this.order.status) {
          // Status changed - show notification
          this.snackBar.open(`Order status: ${order.status.replace('_', ' ').toLowerCase()}`, 'OK', { duration: 4000 });
        }
        this.order = order;
        this.isLiveUpdating = this.isOrderActive();
      },
      error: () => {
        // Silently fail on refresh
      }
    });
  }

  private isOrderActive(): boolean {
    return this.order !== null &&
           this.order.status !== 'DELIVERED' &&
           this.order.status !== 'CANCELLED';
  }

  isStepActive(status: string): boolean {
    if (!this.order) return false;
    if (this.order.status === 'CANCELLED') return status === 'PLACED';
    const currentIdx = this.statusOrder.indexOf(this.order.status);
    const stepIdx = this.statusOrder.indexOf(status);
    return stepIdx <= currentIdx;
  }

  isStepCompleted(status: string): boolean {
    if (!this.order) return false;
    if (this.order.status === 'CANCELLED') return false;
    const currentIdx = this.statusOrder.indexOf(this.order.status);
    const stepIdx = this.statusOrder.indexOf(status);
    return stepIdx < currentIdx;
  }

  cancelOrder() {
    if (!this.order) return;
    this.foodService.cancelOrder(this.order.orderRef).subscribe({
      next: (order) => {
        this.order = order;
        this.isLiveUpdating = false;
        this.snackBar.open('Order cancelled', 'OK', { duration: 3000 });
      },
      error: (err) => {
        this.snackBar.open(err.error?.error || 'Cannot cancel order', 'OK', { duration: 3000 });
      }
    });
  }
}
