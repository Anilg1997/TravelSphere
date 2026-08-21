import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { RouterLink } from '@angular/router';
import { NgFor, NgIf, CurrencyPipe, DecimalPipe } from '@angular/common';
import { AiService, TripPlanResponse } from '../../../services/ai.service';
import { FoodDeliveryService } from '../../../services/food-delivery.service';
import { Restaurant } from '../../../models/food-delivery.model';

@Component({
  selector: 'app-trip-planner',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, MatCardModule, MatButtonModule, MatIconModule, MatInputModule, MatFormFieldModule, MatSelectModule, MatProgressSpinnerModule, MatChipsModule, NgFor, NgIf, CurrencyPipe, DecimalPipe],
  template: `
    <div class="page-container" style="max-width:700px">
      <a routerLink="/ai/chat" mat-button><mat-icon>arrow_back</mat-icon> Back to AI Chat</a>

      <h1 class="section-title" style="margin-top:16px">Plan Your Trip</h1>
      <p class="section-subtitle">Let AI create a personalized itinerary for you</p>

      <div class="form-section">
        <form [formGroup]="planForm" (ngSubmit)="onSubmit()">
          <mat-form-field class="full-width" appearance="outline"><mat-label>Destination</mat-label><input matInput formControlName="destination" placeholder="e.g., Goa, Manali, Switzerland" /></mat-form-field>
          <div class="form-row">
            <mat-form-field appearance="outline"><mat-label>Duration (days)</mat-label><input matInput type="number" formControlName="durationDays" min="1" max="30" /></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Travelers</mat-label><input matInput type="number" formControlName="travelers" min="1" /></mat-form-field>
          </div>
          <mat-form-field class="full-width" appearance="outline"><mat-label>Budget (₹)</mat-label><input matInput type="number" formControlName="budget" min="1" /></mat-form-field>
          <mat-form-field class="full-width" appearance="outline"><mat-label>Preferences (optional)</mat-label><textarea matInput formControlName="preferences" rows="3" placeholder="e.g., adventure, beach, culture, food, family-friendly"></textarea></mat-form-field>
          <button mat-raised-button color="primary" class="cta-button full-width" type="submit" [disabled]="planForm.invalid || loading">
            <mat-icon>auto_awesome</mat-icon> {{ loading ? 'Planning...' : 'Generate Itinerary' }}
          </button>
        </form>
      </div>

      <div *ngIf="loading" style="text-align:center;padding:40px">
        <mat-spinner diameter="40" style="margin:0 auto"></mat-spinner>
        <p style="color:#666;margin-top:16px">AI is crafting your personalized itinerary...</p>
      </div>

      <mat-card *ngIf="planResult" style="margin-top:24px;padding:24px">
        <h2 style="margin:0 0 16px;color:var(--primary)">{{ planResult.destination }} Trip Plan 🎉</h2>
        <p style="color:#666;margin-bottom:16px">{{ planResult.summary }}</p>

        <h3>Itinerary</h3>
        <div *ngFor="let day of planResult.itinerary; let i = index" style="padding:12px 0;border-left:3px solid var(--primary);padding-left:16px;margin-bottom:12px">
          <div style="white-space:pre-wrap;line-height:1.6">{{ day }}</div>
        </div>

        <div *ngIf="planResult.recommendations.length > 0" style="margin-top:24px">
          <h3>Recommendations</h3>
          <ul style="padding-left:20px;line-height:1.8">
            <li *ngFor="let rec of planResult.recommendations">{{ rec }}</li>
          </ul>
        </div>
      </mat-card>

      <!-- Food Delivery Section -->
      <mat-card *ngIf="planResult && nearbyRestaurants.length > 0" style="margin-top:16px;padding:24px">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px">
          <mat-icon style="color:var(--primary);font-size:28px;height:28px;width:28px">restaurant</mat-icon>
          <h3 style="margin:0;color:var(--primary)">Food Delivery in {{ planResult.destination }}</h3>
        </div>
        <p style="color:#666;margin-bottom:16px">Order food from top restaurants at your destination</p>

        <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));gap:12px">
          <div *ngFor="let restaurant of nearbyRestaurants.slice(0, 4)" style="border:1px solid #eee;border-radius:8px;padding:12px;display:flex;flex-direction:column;gap:6px">
            <div style="display:flex;justify-content:space-between;align-items:start">
              <span style="font-weight:600">{{ restaurant.name }}</span>
              <span style="font-size:0.85rem;color:#666">⭐ {{ restaurant.rating | number:'1.1-1' }}</span>
            </div>
            <span style="font-size:0.85rem;color:#666">{{ restaurant.cuisine }}</span>
            <mat-chip-set>
              <mat-chip *ngFor="let tag of restaurant.tags.slice(0,2)" style="font-size:10px">{{ tag }}</mat-chip>
            </mat-chip-set>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-top:4px">
              <span style="font-size:0.85rem;color:#666">
                <mat-icon style="font-size:14px;height:14px;width:14px;vertical-align:middle">schedule</mat-icon>
                {{ restaurant.avgDeliveryTimeMinutes }} min
              </span>
              <a mat-stroked-button color="primary" [routerLink]="['/food/restaurants', restaurant.id]" style="font-size:12px;padding:0 12px">
                View Menu
              </a>
            </div>
          </div>
        </div>

        <div style="text-align:center;margin-top:16px">
          <a mat-raised-button color="primary" [routerLink]="['/food']" [queryParams]="{city: planResult.destination}">
            <mat-icon>search</mat-icon> Browse All Restaurants in {{ planResult.destination }}
          </a>
        </div>
      </mat-card>
    </div>
  `
})
export class TripPlannerComponent implements OnInit {
  private fb = inject(FormBuilder);
  private aiService = inject(AiService);
  private foodService = inject(FoodDeliveryService);

  loading = false;
  planResult: TripPlanResponse | null = null;
  nearbyRestaurants: Restaurant[] = [];

  planForm = this.fb.nonNullable.group({
    destination: ['', Validators.required],
    durationDays: [5, [Validators.required, Validators.min(1)]],
    travelers: [2, [Validators.required, Validators.min(1)]],
    budget: [50000, [Validators.required, Validators.min(1)]],
    preferences: [''],
  });

  ngOnInit() {}

  onSubmit() {
    if (this.planForm.invalid) return;
    this.loading = true;
    this.nearbyRestaurants = [];

    const formValue = this.planForm.getRawValue();

    this.aiService.planTrip({
      destination: formValue.destination,
      durationDays: formValue.durationDays,
      budget: formValue.budget,
      travelers: formValue.travelers,
      preferences: formValue.preferences || undefined,
    }).subscribe({
      next: (response) => {
        this.planResult = response;
        this.loading = false;
        this.loadNearbyRestaurants(formValue.destination);
      },
      error: () => {
        this.planResult = this.getFallbackPlan(formValue);
        this.loading = false;
        this.loadNearbyRestaurants(formValue.destination);
      },
    });
  }

  private loadNearbyRestaurants(city: string) {
    this.foodService.searchRestaurants(city).subscribe({
      next: (restaurants) => {
        this.nearbyRestaurants = restaurants;
      },
      error: () => {
        this.nearbyRestaurants = [];
      },
    });
  }

  private getFallbackPlan(formValue: any): TripPlanResponse {
    const { destination, durationDays, travelers, budget, preferences } = formValue;
    const itinerary: string[] = [];
    const dayActivities = [
      'Arrive and check in to accommodation. Explore local markets and cuisine. Evening walking tour.',
      'Visit major landmarks and historical sites. Lunch at a recommended restaurant. Cultural experience activity.',
      'Morning adventure activity. Afternoon at leisure. Sunset views and dinner.',
      'Day trip to nearby attractions. Local cooking class or workshop. Evening entertainment.',
      'Shopping for souvenirs. Relax at a local café. Farewell dinner at a fine restaurant.',
    ];
    for (let i = 0; i < durationDays; i++) {
      const dayNum = i + 1;
      const activity = i < dayActivities.length ? dayActivities[i] : 'Free day to explore at your own pace.';
      itinerary.push(`Day ${dayNum}: ${activity}`);
    }

    return {
      destination,
      durationDays,
      budget,
      itinerary,
      recommendations: [
        'Book accommodations in advance for better rates',
        'Carry local currency and a travel card',
        'Get travel insurance for peace of mind',
        'Try local street food for authentic experiences',
        'Keep emergency numbers and embassy contacts handy',
        'Order food delivery to your hotel for a hassle-free arrival meal',
      ],
      summary: `A ${durationDays}-day trip to ${destination} for ${travelers} travelers with a budget of ₹${budget?.toLocaleString()}. ${preferences ? 'Preferences: ' + preferences + '.' : ''}`,
    };
  }
}
