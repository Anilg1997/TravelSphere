import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { AiService, TripPlanResponse } from '../../../services/ai.service';

@Component({
  selector: 'app-trip-planner',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, MatCardModule, MatButtonModule, MatIconModule, MatInputModule, MatFormFieldModule, MatSelectModule, MatProgressSpinnerModule, NgFor, NgIf],
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
    </div>
  `
})
export class TripPlannerComponent {
  private fb = inject(FormBuilder);
  private aiService = inject(AiService);

  loading = false;
  planResult: TripPlanResponse | null = null;

  planForm = this.fb.nonNullable.group({
    destination: ['', Validators.required],
    durationDays: [5, [Validators.required, Validators.min(1)]],
    travelers: [2, [Validators.required, Validators.min(1)]],
    budget: [50000, [Validators.required, Validators.min(1)]],
    preferences: [''],
  });

  onSubmit() {
    if (this.planForm.invalid) return;
    this.loading = true;

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
      },
      error: () => {
        // Fallback to local generation if AI service is unavailable
        this.planResult = this.getFallbackPlan(formValue);
        this.loading = false;
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
      ],
      summary: `A ${durationDays}-day trip to ${destination} for ${travelers} travelers with a budget of ₹${budget?.toLocaleString()}. ${preferences ? 'Preferences: ' + preferences + '.' : ''}`,
    };
  }
}
