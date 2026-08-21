import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgFor, NgIf, CurrencyPipe, DecimalPipe, SlicePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FoodDeliveryService } from '../../../services/food-delivery.service';
import { Restaurant, MenuItem, CartItem } from '../../../models/food-delivery.model';

@Component({
  selector: 'app-restaurant-detail',
  standalone: true,
  imports: [RouterLink, NgFor, NgIf, CurrencyPipe, DecimalPipe, SlicePipe, MatCardModule, MatButtonModule, MatIconModule, MatTabsModule, MatChipsModule, MatBadgeModule, MatProgressSpinnerModule, MatSnackBarModule],
  template: `
    <div class="page-container">
      <div *ngIf="loading" style="text-align:center;padding:40px">
        <mat-spinner diameter="40" style="margin:0 auto"></mat-spinner>
      </div>

      <div *ngIf="restaurant && !loading">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px">
          <div>
            <h1 class="section-title" style="margin-bottom:4px">{{ restaurant.name }}</h1>
            <p class="section-subtitle" style="margin:0">{{ restaurant.cuisine }} · {{ restaurant.city }}, {{ restaurant.country }}</p>
          </div>
          <button mat-raised-button color="accent" (click)="viewCart()" *ngIf="cart.length > 0"
                  [matBadge]="cartItemCount" matBadgeColor="warn">
            <mat-icon>shopping_cart</mat-icon> Cart
          </button>
        </div>

        <div style="display:flex;gap:24px;flex-wrap:wrap;margin-bottom:24px">
          <div style="display:flex;align-items:center;gap:4px">
            <mat-icon style="color:var(--primary)">star</mat-icon>
            <span style="font-weight:600">{{ restaurant.rating | number:'1.1-1' }}</span>
            <span style="color:#666">({{ restaurant.reviewCount }} reviews)</span>
          </div>
          <div style="display:flex;align-items:center;gap:4px">
            <mat-icon style="color:#666">schedule</mat-icon>
            <span>{{ restaurant.avgDeliveryTimeMinutes }} min delivery</span>
          </div>
          <div style="display:flex;align-items:center;gap:4px">
            <mat-icon style="color:#666">delivery_dining</mat-icon>
            <span>₹{{ restaurant.deliveryFee | number:'1.2-2' }} delivery fee</span>
          </div>
          <div style="display:flex;align-items:center;gap:4px" *ngIf="restaurant.minOrderAmount">
            <mat-icon style="color:#666">receipt</mat-icon>
            <span>Min order: ₹{{ restaurant.minOrderAmount | number:'1.2-2' }}</span>
          </div>
        </div>

        <p style="color:#666;margin-bottom:24px">{{ restaurant.description }}</p>

        <mat-chip-set style="margin-bottom:24px">
          <mat-chip *ngFor="let tag of restaurant.tags">{{ tag }}</mat-chip>
        </mat-chip-set>

        <mat-tab-group>
          <mat-tab *ngFor="let category of categories" [label]="category">
            <div class="responsive-grid" style="margin-top:16px">
              <mat-card *ngFor="let item of getMenuByCategory(category)" class="feature-card">
                <mat-card-header>
                  <mat-icon class="card-icon" *ngIf="item.isVegetarian">eco</mat-icon>
                  <mat-icon class="card-icon" *ngIf="!item.isVegetarian">restaurant</mat-icon>
                  <mat-card-title>{{ item.name }}</mat-card-title>
                  <mat-card-subtitle>{{ item.description | slice:0:60 }}{{ item.description.length > 60 ? '...' : '' }}</mat-card-subtitle>
                </mat-card-header>
                <mat-card-content>
                  <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px">
                    <span style="font-size:1.1rem;font-weight:700;color:var(--primary)">₹{{ item.price | number:'1.2-2' }}</span>
                    <div style="display:flex;gap:4px">
                      <mat-chip *ngIf="item.isVegetarian" style="font-size:10px">Veg</mat-chip>
                      <mat-chip *ngIf="item.isVegan" style="font-size:10px">Vegan</mat-chip>
                      <mat-chip *ngIf="item.isGlutenFree" style="font-size:10px">GF</mat-chip>
                    </div>
                  </div>
                  <div style="display:flex;gap:8px;margin-top:12px">
                    <button mat-stroked-button color="primary" (click)="addToCart(item)">
                      <mat-icon>add_shopping_cart</mat-icon> Add
                    </button>
                    <button mat-stroked-button *ngIf="getCartQuantity(item.id) > 0" (click)="removeFromCart(item)">
                      <mat-icon>remove</mat-icon>
                    </button>
                    <span *ngIf="getCartQuantity(item.id) > 0" style="display:flex;align-items:center;font-weight:600">
                      {{ getCartQuantity(item.id) }}
                    </span>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>
        </mat-tab-group>

        <!-- Cart Summary -->
        <div *ngIf="cart.length > 0" style="position:fixed;bottom:0;left:0;right:0;background:var(--primary);color:white;padding:16px 24px;display:flex;justify-content:space-between;align-items:center;z-index:1000;box-shadow:0 -2px 8px rgba(0,0,0,0.2)">
          <div>
            <span style="font-weight:600">{{ cartItemCount }} items · ₹{{ cartTotal | number:'1.2-2' }}</span>
          </div>
          <button mat-raised-button style="background:white;color:var(--primary)" (click)="viewCart()">
            View Cart & Checkout
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; padding-bottom: 80px; }
  `]
})
export class RestaurantDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private foodService = inject(FoodDeliveryService);
  private snackBar = inject(MatSnackBar);

  restaurant: Restaurant | null = null;
  loading = true;
  cart: CartItem[] = [];
  categories: string[] = [];

  get cartItemCount(): number {
    return this.cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  get cartTotal(): number {
    return this.cart.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0);
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.foodService.getRestaurant(id).subscribe(r => {
      this.restaurant = r;
      this.categories = [...new Set((r.menuItems || []).map(m => m.category))];
      this.loading = false;
    });
  }

  getMenuByCategory(category: string): MenuItem[] {
    return (this.restaurant?.menuItems || []).filter(m => m.category === category);
  }

  addToCart(item: MenuItem) {
    const existing = this.cart.find(c => c.menuItem.id === item.id);
    if (existing) {
      existing.quantity++;
    } else {
      this.cart.push({ menuItem: item, quantity: 1 });
    }
    this.snackBar.open(`${item.name} added to cart`, 'OK', { duration: 2000 });
  }

  removeFromCart(item: MenuItem) {
    const existing = this.cart.find(c => c.menuItem.id === item.id);
    if (existing) {
      existing.quantity--;
      if (existing.quantity <= 0) {
        this.cart = this.cart.filter(c => c.menuItem.id !== item.id);
      }
    }
  }

  getCartQuantity(itemId: string): number {
    return this.cart.find(c => c.menuItem.id === itemId)?.quantity || 0;
  }

  viewCart() {
    if (this.restaurant) {
      this.router.navigate(['/food/order'], {
        queryParams: { restaurantId: this.restaurant.id },
        state: { cart: this.cart, restaurant: this.restaurant }
      });
    }
  }
}
