import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgFor, NgIf, CurrencyPipe, DecimalPipe, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatStepperModule } from '@angular/material/stepper';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
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
          </div>
        </div>

        <!-- Status Timeline -->
        <mat-card class="feature-card" style="margin-bottom:24px">
          <mat-card-content>
            <div style="display:flex;justify-content:space-between;align-items:center;padding:16px 0">
              <div style="text-align:center" [style.opacity]="isStepActive('PLACED') ? 1 : 0.4">
                <mat-icon [style.color]="isStepActive('PLACED') ? 'var(--primary)' : '#ccc'">receipt_long</mat-icon>
                <p style="margin:4px 0 0;font-size:0.85rem">Placed</p>
              </div>
              <div style="flex:1;height:2px;background:#eee;margin:0 8px" [style.background]="isStepActive('PREPARING') ? 'var(--primary)' : '#eee'"></div>
              <div style="text-align:center" [style.opacity]="isStepActive('PREPARING') ? 1 : 0.4">
                <mat-icon [style.color]="isStepActive('PREPARING') ? 'var(--primary)' : '#ccc'">soup_kitchen</mat-icon>
                <p style="margin:4px 0 0;font-size:0.85rem">Preparing</p>
              </div>
              <div style="flex:1;height:2px;background:#eee;margin:0 8px" [style.background]="isStepActive('OUT_FOR_DELIVERY') ? 'var(--primary)' : '#eee'"></div>
              <div style="text-align:center" [style.opacity]="isStepActive('OUT_FOR_DELIVERY') ? 1 : 0.4">
                <mat-icon [style.color]="isStepActive('OUT_FOR_DELIVERY') ? 'var(--primary)' : '#ccc'">delivery_dining</mat-icon>
                <p style="margin:4px 0 0;font-size:0.85rem">On the way</p>
              </div>
              <div style="flex:1;height:2px;background:#eee;margin:0 8px" [style.background]="isStepActive('DELIVERED') ? 'var(--primary)' : '#eee'"></div>
              <div style="text-align:center" [style.opacity]="isStepActive('DELIVERED') ? 1 : 0.4">
                <mat-icon [style.color]="isStepActive('DELIVERED') ? 'var(--primary)' : '#ccc'">check_circle</mat-icon>
                <p style="margin:4px 0 0;font-size:0.85rem">Delivered</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <div style="display:grid;grid-template-columns:1fr 380px;gap:24px">
          <!-- Order Details -->
          <div>
            <mat-card class="feature-card">
              <mat-card-header>
                <mat-icon class="card-icon">shopping_bag</mat-icon>
                <mat-card-title>Order Items</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div *ngFor="let item of order.items; let last = last" style="display:flex;justify-content:space-between;padding:12px 0" [style.border-bottom]="!last ? '1px solid #eee' : 'none'">
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
                <div style="display:flex;justify-content:space-between;padding:8px 0">
                  <span>Subtotal</span><span>₹{{ order.subtotal | number:'1.2-2' }}</span>
                </div>
                <div style="display:flex;justify-content:space-between;padding:8px 0">
                  <span>Delivery Fee</span><span>₹{{ order.deliveryFee | number:'1.2-2' }}</span>
                </div>
                <div style="display:flex;justify-content:space-between;padding:8px 0">
                  <span>Tax</span><span>₹{{ order.tax | number:'1.2-2' }}</span>
                </div>
                <div style="border-top:2px solid #eee;margin-top:8px;padding-top:12px;display:flex;justify-content:space-between">
                  <span style="font-weight:700">Total</span>
                  <span style="font-weight:700;color:var(--primary)">₹{{ order.totalAmount | number:'1.2-2' }}</span>
                </div>
                <div style="margin-top:16px;padding:12px;background:#f5f5f5;border-radius:8px">
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
  `]
})
export class FoodOrderTrackingComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private foodService = inject(FoodDeliveryService);
  private snackBar = inject(MatSnackBar);

  order: FoodOrderResponse | null = null;
  loading = true;

  private statusOrder = ['PLACED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED'];

  ngOnInit() {
    const ref = this.route.snapshot.paramMap.get('ref')!;
    this.loadOrder(ref);
  }

  loadOrder(ref: string) {
    this.foodService.getOrder(ref).subscribe({
      next: (order) => {
        this.order = order;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Order not found', 'OK', { duration: 3000 });
      }
    });
  }

  isStepActive(status: string): boolean {
    if (!this.order) return false;
    if (this.order.status === 'CANCELLED') return status === 'PLACED';
    const currentIdx = this.statusOrder.indexOf(this.order.status);
    const stepIdx = this.statusOrder.indexOf(status);
    return stepIdx <= currentIdx;
  }

  cancelOrder() {
    if (!this.order) return;
    this.foodService.cancelOrder(this.order.orderRef).subscribe({
      next: (order) => {
        this.order = order;
        this.snackBar.open('Order cancelled', 'OK', { duration: 3000 });
      },
      error: (err) => {
        this.snackBar.open(err.error?.error || 'Cannot cancel order', 'OK', { duration: 3000 });
      }
    });
  }
}
