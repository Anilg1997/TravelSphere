import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { NgFor, NgIf, CurrencyPipe, SlicePipe, DecimalPipe } from '@angular/common';
import { FoodDeliveryService } from '../../../services/food-delivery.service';
import { Restaurant } from '../../../models/food-delivery.model';

@Component({
  selector: 'app-restaurant-search',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, MatCardModule, MatButtonModule, MatIconModule, MatInputModule, MatFormFieldModule, MatSelectModule, MatProgressSpinnerModule, MatChipsModule, NgFor, NgIf, CurrencyPipe, SlicePipe, DecimalPipe],
  template: `
    <div class="page-container">
      <h1 class="section-title">Order Food</h1>
      <p class="section-subtitle">Get your favorite meals delivered to your location</p>

      <div class="form-section">
        <form [formGroup]="searchForm" class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>City</mat-label>
            <input matInput formControlName="city" placeholder="Enter your city" />
            <mat-icon matIconPrefix>location_city</mat-icon>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Cuisine</mat-label>
            <mat-select formControlName="cuisine">
              <mat-option [value]="''">All Cuisines</mat-option>
              <mat-option value="Italian">Italian</mat-option>
              <mat-option value="Chinese">Chinese</mat-option>
              <mat-option value="Indian">Indian</mat-option>
              <mat-option value="Japanese">Japanese</mat-option>
              <mat-option value="Mexican">Mexican</mat-option>
              <mat-option value="Thai">Thai</mat-option>
              <mat-option value="American">American</mat-option>
              <mat-option value="Mediterranean">Mediterranean</mat-option>
            </mat-select>
          </mat-form-field>
        </form>
        <button mat-raised-button color="primary" class="cta-button" (click)="search()" [disabled]="loading">
          <mat-icon>search</mat-icon> Find Restaurants
        </button>
      </div>

      <div *ngIf="loading" style="text-align:center;padding:40px">
        <mat-spinner diameter="40" style="margin:0 auto"></mat-spinner>
      </div>

      <div *ngIf="restaurants.length > 0 && !loading" class="responsive-grid" style="margin-top:24px">
        <mat-card *ngFor="let restaurant of restaurants" class="feature-card" [routerLink]="['/food/restaurants', restaurant.id]">
          <mat-card-header>
            <mat-icon class="card-icon">restaurant</mat-icon>
            <mat-card-title>{{ restaurant.name }}</mat-card-title>
            <mat-card-subtitle>{{ restaurant.cuisine }} · {{ restaurant.city }}</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p>{{ restaurant.description | slice:0:100 }}{{ restaurant.description.length > 100 ? '...' : '' }}</p>
            <mat-chip-set>
              <mat-chip *ngFor="let tag of restaurant.tags.slice(0,3)">{{ tag }}</mat-chip>
            </mat-chip-set>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px">
              <span style="font-size:0.9rem;color:#666">
                <mat-icon style="font-size:16px;height:16px;width:16px;vertical-align:middle">schedule</mat-icon>
                {{ restaurant.avgDeliveryTimeMinutes }} min
              </span>
              <span style="font-size:0.9rem;color:#666">
                <mat-icon style="font-size:16px;height:16px;width:16px;vertical-align:middle">delivery_dining</mat-icon>
                ₹{{ restaurant.deliveryFee | number:'1.2-2' }}
              </span>
              <span style="font-weight:700;color:var(--primary)">
                ⭐ {{ restaurant.rating | number:'1.1-1' }} ({{ restaurant.reviewCount }})
              </span>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <div *ngIf="restaurants.length === 0 && !loading && searched" style="text-align:center;padding:40px;color:#666">
        <mat-icon style="font-size:48px;color:#ccc">restaurant_menu</mat-icon>
        <p>No restaurants found. Try a different search.</p>
      </div>
    </div>
  `
})
export class RestaurantSearchComponent implements OnInit {
  private fb = inject(FormBuilder);
  private foodService = inject(FoodDeliveryService);
  private route = inject(ActivatedRoute);

  loading = false;
  restaurants: Restaurant[] = [];
  searched = false;

  searchForm = this.fb.group({ city: [''], cuisine: [''] });

  ngOnInit() {
    const city = this.route.snapshot.queryParamMap.get('city');
    if (city) {
      this.searchForm.patchValue({ city });
      this.search();
    }
  }

  search() {
    this.loading = true;
    this.searched = true;
    const { city, cuisine } = this.searchForm.value;
    this.foodService.searchRestaurants(city || undefined, cuisine || undefined).subscribe(r => {
      this.restaurants = r;
      this.loading = false;
    });
  }
}
