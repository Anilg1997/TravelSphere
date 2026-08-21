import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgFor, NgIf, CurrencyPipe, DecimalPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FoodDeliveryService } from '../../../services/food-delivery.service';
import { CartItem, Restaurant } from '../../../models/food-delivery.model';

@Component({
  selector: 'app-food-order',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, NgFor, NgIf, CurrencyPipe, DecimalPipe, MatCardModule, MatButtonModule, MatIconModule, MatInputModule, MatFormFieldModule, MatSelectModule, MatProgressSpinnerModule, MatSnackBarModule],
  template: `
    <div class="page-container">
      <h1 class="section-title">Checkout</h1>
      <p class="section-subtitle" *ngIf="restaurant">Ordering from {{ restaurant.name }}</p>

      <div *ngIf="loading" style="text-align:center;padding:40px">
        <mat-spinner diameter="40" style="margin:0 auto"></mat-spinner>
      </div>

      <div *ngIf="!loading" style="display:grid;grid-template-columns:1fr 380px;gap:24px">
        <!-- Delivery Details -->
        <div>
          <mat-card class="feature-card">
            <mat-card-header>
              <mat-icon class="card-icon">location_on</mat-icon>
              <mat-card-title>Delivery Address</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <form [formGroup]="checkoutForm">
                <mat-form-field appearance="outline" style="width:100%">
                  <mat-label>Delivery Address</mat-label>
                  <textarea matInput formControlName="deliveryAddress" rows="3" placeholder="Enter your full delivery address"></textarea>
                </mat-form-field>
                <mat-form-field appearance="outline" style="width:100%">
                  <mat-label>Special Instructions</mat-label>
                  <textarea matInput formControlName="specialInstructions" rows="2" placeholder="Any special delivery instructions?"></textarea>
                </mat-form-field>
                <mat-form-field appearance="outline" style="width:100%">
                  <mat-label>Payment Method</mat-label>
                  <mat-select formControlName="paymentMethod">
                    <mat-option value="card">Credit/Debit Card</mat-option>
                    <mat-option value="upi">UPI</mat-option>
                    <mat-option value="cash">Cash on Delivery</mat-option>
                    <mat-option value="wallet">Wallet</mat-option>
                  </mat-select>
                </mat-form-field>
              </form>
            </mat-card-content>
          </mat-card>

          <!-- Cart Items -->
          <mat-card class="feature-card" style="margin-top:16px">
            <mat-card-header>
              <mat-icon class="card-icon">shopping_cart</mat-icon>
              <mat-card-title>Your Items ({{ cart.length }})</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div *ngFor="let item of cart; let last = last" style="display:flex;justify-content:space-between;align-items:center;padding:12px 0" [style.border-bottom]="!last ? '1px solid #eee' : 'none'">
                <div>
                  <span style="font-weight:500">{{ item.menuItem.name }}</span>
                  <span style="color:#666;margin-left:8px">× {{ item.quantity }}</span>
                </div>
                <span style="font-weight:600">₹{{ (item.menuItem.price * item.quantity) | number:'1.2-2' }}</span>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Order Summary -->
        <div>
          <mat-card class="feature-card" style="position:sticky;top:24px">
            <mat-card-header>
              <mat-icon class="card-icon">receipt</mat-icon>
              <mat-card-title>Order Summary</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div style="display:flex;justify-content:space-between;padding:8px 0">
                <span>Subtotal</span>
                <span>₹{{ subtotal | number:'1.2-2' }}</span>
              </div>
              <div style="display:flex;justify-content:space-between;padding:8px 0">
                <span>Delivery Fee</span>
                <span>₹{{ restaurant?.deliveryFee || 0 | number:'1.2-2' }}</span>
              </div>
              <div style="display:flex;justify-content:space-between;padding:8px 0">
                <span>Tax (5%)</span>
                <span>₹{{ tax | number:'1.2-2' }}</span>
              </div>
              <div style="border-top:2px solid #eee;margin-top:8px;padding-top:12px;display:flex;justify-content:space-between">
                <span style="font-size:1.1rem;font-weight:700">Total</span>
                <span style="font-size:1.1rem;font-weight:700;color:var(--primary)">₹{{ total | number:'1.2-2' }}</span>
              </div>
              <button mat-raised-button color="primary" style="width:100%;margin-top:16px" (click)="placeOrder()" [disabled]="placing">
                <mat-icon *ngIf="!placing">check_circle</mat-icon>
                <mat-spinner *ngIf="placing" diameter="20" style="display:inline-block"></mat-spinner>
                {{ placing ? 'Placing Order...' : 'Place Order' }}
              </button>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </div>
  `
})
export class FoodOrderComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private foodService = inject(FoodDeliveryService);
  private snackBar = inject(MatSnackBar);

  restaurant: Restaurant | null = null;
  cart: CartItem[] = [];
  loading = true;
  placing = false;

  checkoutForm = this.fb.group({
    deliveryAddress: ['', Validators.required],
    specialInstructions: [''],
    paymentMethod: ['card', Validators.required]
  });

  get subtotal(): number {
    return this.cart.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0);
  }

  get tax(): number {
    return this.subtotal * 0.05;
  }

  get total(): number {
    return this.subtotal + (this.restaurant?.deliveryFee || 0) + this.tax;
  }

  ngOnInit() {
    const state = history.state;
    if (state.cart && state.restaurant) {
      this.cart = state.cart;
      this.restaurant = state.restaurant;
      this.loading = false;
    } else {
      this.router.navigate(['/food']);
    }
  }

  placeOrder() {
    if (this.checkoutForm.invalid || this.cart.length === 0) return;
    this.placing = true;

    const formValue = this.checkoutForm.value;
    const request = {
      restaurantId: this.restaurant!.id,
      deliveryAddress: formValue.deliveryAddress!,
      specialInstructions: formValue.specialInstructions || undefined,
      paymentMethod: formValue.paymentMethod || 'card',
      items: this.cart.map(item => ({
        menuItemId: item.menuItem.id,
        itemName: item.menuItem.name,
        quantity: item.quantity,
        specialInstructions: item.specialInstructions
      }))
    };

    this.foodService.placeOrder(request).subscribe({
      next: (order) => {
        this.snackBar.open('Order placed successfully!', 'OK', { duration: 3000 });
        this.router.navigate(['/food/orders', order.orderRef]);
      },
      error: (err) => {
        this.placing = false;
        this.snackBar.open(err.error?.error || 'Failed to place order', 'OK', { duration: 5000 });
      }
    });
  }
}
