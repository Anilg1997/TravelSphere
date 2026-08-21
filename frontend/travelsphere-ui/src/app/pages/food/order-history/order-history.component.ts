import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgFor, NgIf, CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { FoodDeliveryService } from '../../../services/food-delivery.service';
import { AuthService } from '../../../services/auth.service';
import { FoodOrderResponse, CartItem, MenuItem } from '../../../models/food-delivery.model';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [RouterLink, NgFor, NgIf, CurrencyPipe, DatePipe, DecimalPipe, MatCardModule, MatButtonModule, MatIconModule, MatTabsModule, MatProgressSpinnerModule, MatSnackBarModule],
  template: `
    <div class="page-container">
      <h1 class="section-title">My Food Orders</h1>
      <p class="section-subtitle">Track and manage your food delivery orders</p>

      <div *ngIf="loading" style="text-align:center;padding:40px">
        <mat-spinner diameter="40" style="margin:0 auto"></mat-spinner>
      </div>

      <div *ngIf="!loading && orders.length === 0" style="text-align:center;padding:60px 20px">
        <mat-icon style="font-size:64px;color:#ccc">receipt_long</mat-icon>
        <h2 style="color:#666;margin-top:16px">No orders yet</h2>
        <p style="color:#999;margin-bottom:24px">Start ordering delicious food from nearby restaurants!</p>
        <a mat-raised-button color="primary" routerLink="/food">
          <mat-icon>restaurant</mat-icon> Browse Restaurants
        </a>
      </div>

      <mat-tab-group *ngIf="!loading && orders.length > 0" style="margin-top:16px">
        <mat-tab [label]="'Active (' + activeOrders.length + ')'">
          <div style="padding:16px 0">
            <div *ngIf="activeOrders.length === 0" style="text-align:center;padding:40px;color:#666">
              <p>No active orders</p>
            </div>
            <div *ngFor="let order of activeOrders" class="order-card">
              <mat-card>
                <mat-card-content>
                  <div style="display:flex;justify-content:space-between;align-items:start">
                    <div>
                      <h3 style="margin:0 0 4px">{{ order.restaurantName }}</h3>
                      <p style="margin:0;color:#666;font-size:0.85rem">Order #{{ order.orderRef }}</p>
                    </div>
                    <span [class]="'status-badge status-' + order.status.toLowerCase()">{{ formatStatus(order.status) }}</span>
                  </div>

                  <div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap">
                    <span *ngFor="let item of order.items.slice(0,3)" style="background:#f5f5f5;padding:4px 8px;border-radius:4px;font-size:0.85rem">
                      {{ item.itemName }} × {{ item.quantity }}
                    </span>
                    <span *ngIf="order.items.length > 3" style="background:#f5f5f5;padding:4px 8px;border-radius:4px;font-size:0.85rem">
                      +{{ order.items.length - 3 }} more
                    </span>
                  </div>

                  <div style="display:flex;justify-content:space-between;align-items:center;margin-top:16px">
                    <div>
                      <span style="color:#666;font-size:0.85rem">
                        <mat-icon style="font-size:14px;height:14px;width:14px;vertical-align:middle">schedule</mat-icon>
                        {{ order.orderedAt | date:'short' }}
                      </span>
                      <span *ngIf="order.estimatedDeliveryTime" style="color:#666;font-size:0.85rem;margin-left:12px">
                        ETA: {{ order.estimatedDeliveryTime | date:'shortTime' }}
                      </span>
                    </div>
                    <span style="font-size:1.1rem;font-weight:700;color:var(--primary)">₹{{ order.totalAmount | number:'1.2-2' }}</span>
                  </div>

                  <div style="margin-top:12px;display:flex;gap:8px">
                    <a mat-stroked-button color="primary" [routerLink]="['/food/orders', order.orderRef]">
                      <mat-icon>visibility</mat-icon> Track Order
                    </a>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </div>
        </mat-tab>

        <mat-tab [label]="'Past (' + pastOrders.length + ')'">
          <div style="padding:16px 0">
            <div *ngIf="pastOrders.length === 0" style="text-align:center;padding:40px;color:#666">
              <p>No past orders</p>
            </div>
            <div *ngFor="let order of pastOrders" class="order-card">
              <mat-card>
                <mat-card-content>
                  <div style="display:flex;justify-content:space-between;align-items:start">
                    <div>
                      <h3 style="margin:0 0 4px">{{ order.restaurantName }}</h3>
                      <p style="margin:0;color:#666;font-size:0.85rem">Order #{{ order.orderRef }}</p>
                    </div>
                    <span [class]="'status-badge status-' + order.status.toLowerCase()">{{ formatStatus(order.status) }}</span>
                  </div>

                  <div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap">
                    <span *ngFor="let item of order.items.slice(0,3)" style="background:#f5f5f5;padding:4px 8px;border-radius:4px;font-size:0.85rem">
                      {{ item.itemName }} × {{ item.quantity }}
                    </span>
                    <span *ngIf="order.items.length > 3" style="background:#f5f5f5;padding:4px 8px;border-radius:4px;font-size:0.85rem">
                      +{{ order.items.length - 3 }} more
                    </span>
                  </div>

                  <div style="display:flex;justify-content:space-between;align-items:center;margin-top:16px">
                    <div>
                      <span style="color:#666;font-size:0.85rem">
                        <mat-icon style="font-size:14px;height:14px;width:14px;vertical-align:middle">schedule</mat-icon>
                        {{ order.orderedAt | date:'medium' }}
                      </span>
                      <span *ngIf="order.deliveredAt" style="color:#2e7d32;font-size:0.85rem;margin-left:12px">
                        Delivered: {{ order.deliveredAt | date:'short' }}
                      </span>
                    </div>
                    <span style="font-size:1.1rem;font-weight:700;color:var(--primary)">₹{{ order.totalAmount | number:'1.2-2' }}</span>
                  </div>

                  <div style="margin-top:12px;display:flex;gap:8px">
                    <a mat-stroked-button [routerLink]="['/food/orders', order.orderRef]">
                      <mat-icon>receipt</mat-icon> View Details
                    </a>
                    <button mat-raised-button color="primary" (click)="reorder(order)" [disabled]="reorderingOrderId === order.orderRef">
                      <mat-spinner *ngIf="reorderingOrderId === order.orderRef" diameter="16" style="display:inline-block"></mat-spinner>
                      <mat-icon *ngIf="reorderingOrderId !== order.orderRef">replay</mat-icon>
                      Reorder
                    </button>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .order-card { margin-bottom: 12px; }
    .order-card mat-card { cursor: default; }
    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 16px;
      font-weight: 600;
      font-size: 0.75rem;
      text-transform: uppercase;
    }
    .status-placed { background: #e3f2fd; color: #1565c0; }
    .status-preparing { background: #fff3e0; color: #e65100; }
    .status-out_for_delivery { background: #e8f5e9; color: #2e7d32; }
    .status-delivered { background: #e8f5e9; color: #1b5e20; }
    .status-cancelled { background: #fce4ec; color: #c62828; }
  `]
})
export class OrderHistoryComponent implements OnInit, OnDestroy {
  private foodService = inject(FoodDeliveryService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private userSub?: Subscription;

  orders: FoodOrderResponse[] = [];
  loading = true;
  reorderingOrderId: string | null = null;

  get activeOrders(): FoodOrderResponse[] {
    return this.orders.filter(o => !['DELIVERED', 'CANCELLED'].includes(o.status));
  }

  get pastOrders(): FoodOrderResponse[] {
    return this.orders.filter(o => ['DELIVERED', 'CANCELLED'].includes(o.status));
  }

  ngOnInit() {
    this.userSub = this.authService.user$.subscribe(user => {
      if (user?.id) {
        this.foodService.getUserOrders(user.id).subscribe({
          next: (orders) => {
            this.orders = orders;
            this.loading = false;
          },
          error: () => {
            this.loading = false;
          }
        });
      } else {
        this.loading = false;
      }
    });
  }

  ngOnDestroy() {
    this.userSub?.unsubscribe();
  }

  reorder(order: FoodOrderResponse) {
    if (!order.restaurantId) {
      this.snackBar.open('Restaurant info unavailable for reorder', 'OK', { duration: 3000 });
      return;
    }

    this.reorderingOrderId = order.orderRef;

    this.foodService.getRestaurant(order.restaurantId).subscribe({
      next: (restaurant) => {
        // Build cart from the previous order items, matching against current menu
        const cart: CartItem[] = [];
        const menuItems = restaurant.menuItems || [];

        for (const orderItem of order.items) {
          // Try to find matching menu item by name (case-insensitive)
          const matchedMenuItem = menuItems.find(
            mi => mi.name.toLowerCase() === orderItem.itemName.toLowerCase() && mi.isAvailable
          );

          if (matchedMenuItem) {
            cart.push({
              menuItem: matchedMenuItem,
              quantity: orderItem.quantity,
              specialInstructions: orderItem.specialInstructions
            });
          }
        }

        if (cart.length === 0) {
          this.reorderingOrderId = null;
          this.snackBar.open('Menu items from this order are currently unavailable', 'OK', { duration: 4000 });
          return;
        }

        // Pre-fill delivery address from the previous order
        this.router.navigate(['/food/order'], {
          queryParams: { restaurantId: restaurant.id },
          state: { cart, restaurant }
        });
      },
      error: () => {
        this.reorderingOrderId = null;
        this.snackBar.open('Could not load restaurant menu', 'OK', { duration: 3000 });
      }
    });
  }

  formatStatus(status: string): string {
    return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  }
}
