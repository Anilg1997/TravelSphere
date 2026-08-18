import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgIf } from '@angular/common';
import { TransportService } from '../../../services/transport.service';

@Component({
  selector: 'app-transport-booking',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, MatCardModule, MatButtonModule, MatIconModule, MatInputModule, MatFormFieldModule, MatSnackBarModule, MatProgressSpinnerModule, NgIf],
  template: `
    <div class="page-container">
      <a routerLink="/transport" mat-button><mat-icon>arrow_back</mat-icon> Back to Routes</a>

      <div class="form-section" style="max-width:600px;margin:16px auto">
        <h2>Book Transport</h2>
        <p style="color:#666;margin-bottom:24px">Route Ref: {{ routeRef }}</p>

        <div *ngIf="loading" style="text-align:center;padding:40px">
          <mat-spinner diameter="40" style="margin:0 auto"></mat-spinner>
        </div>

        <form *ngIf="!loading" [formGroup]="form" (ngSubmit)="onSubmit()">
          <mat-form-field class="full-width" appearance="outline">
            <mat-label>Passenger Name</mat-label>
            <input matInput formControlName="passengerName" placeholder="Enter full name" />
            <mat-error>Name is required</mat-error>
          </mat-form-field>

          <mat-form-field class="full-width" appearance="outline">
            <mat-label>Passenger Email</mat-label>
            <input matInput type="email" formControlName="passengerEmail" placeholder="Enter email" />
            <mat-error>Valid email is required</mat-error>
          </mat-form-field>

          <mat-form-field class="full-width" appearance="outline">
            <mat-label>Number of Seats</mat-label>
            <input matInput type="number" formControlName="seatCount" min="1" max="10" />
          </mat-form-field>

          <button mat-raised-button color="primary" class="cta-button full-width" type="submit" [disabled]="form.invalid || submitting">
            <mat-icon *ngIf="!submitting">confirmation_number</mat-icon>
            {{ submitting ? 'Booking...' : 'Confirm Booking' }}
          </button>
        </form>
      </div>
    </div>
  `
})
export class TransportBookingComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private transportService = inject(TransportService);
  private snackBar = inject(MatSnackBar);

  routeRef = this.route.snapshot.paramMap.get('ref') || '';
  loading = false;
  submitting = false;

  form = this.fb.nonNullable.group({
    routeId: [this.routeRef, Validators.required],
    passengerName: ['', Validators.required],
    passengerEmail: ['', [Validators.required, Validators.email]],
    seatCount: [1, [Validators.required, Validators.min(1)]],
  });

  onSubmit() {
    if (this.form.invalid) return;
    this.submitting = true;
    this.transportService.book(this.form.getRawValue() as any).subscribe({
      next: (res) => {
        this.snackBar.open(`Booked! Ref: ${res.bookingRef || 'Success'}`, 'Close', { duration: 5000 });
        this.router.navigate(['/bookings']);
      },
      error: () => {
        this.submitting = false;
        this.snackBar.open('Booking failed. Please try again.', 'Close', { duration: 3000 });
      },
    });
  }
}
