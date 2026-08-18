import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgFor, NgIf, CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { TransportService } from '../../../services/transport.service';

@Component({
  selector: 'app-transport-search',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, MatCardModule, MatButtonModule, MatIconModule, MatInputModule, MatFormFieldModule, MatProgressSpinnerModule, NgFor, NgIf, CurrencyPipe, DatePipe, DecimalPipe],
  template: `
    <div class="page-container">
      <h1 class="section-title">Bus & Train</h1>
      <p class="section-subtitle">Book intercity transport</p>
      <div class="form-section">
        <form [formGroup]="form" class="form-row">
          <mat-form-field appearance="outline"><mat-label>From</mat-label><input matInput formControlName="from" /></mat-form-field>
          <mat-form-field appearance="outline"><mat-label>To</mat-label><input matInput formControlName="to" /></mat-form-field>
        </form>
        <button mat-raised-button color="primary" class="cta-button" (click)="search()"><mat-icon>search</mat-icon> Search Routes</button>
      </div>
      <div *ngIf="loading" style="text-align:center;padding:40px"><mat-spinner diameter="40" style="margin:0 auto"></mat-spinner></div>
      <div *ngIf="routes.length > 0 && !loading" class="responsive-grid" style="margin-top:24px">
        <mat-card *ngFor="let r of routes" class="feature-card">
          <mat-card-header>
            <mat-icon class="card-icon">train</mat-icon>
            <mat-card-title>{{ r.routeName }}</mat-card-title>
            <mat-card-subtitle>{{ r.vehicleType }} · {{ r.from }} → {{ r.to }}</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p>{{ r.departureTime | date:'short' }} — {{ r.arrivalTime | date:'short' }}</p>
            <div style="display:flex;justify-content:space-between;align-items:center">
              <span style="font-size:1.3rem;font-weight:700;color:var(--primary)">₹{{ r.price | number }}</span>
              <button mat-raised-button color="primary" [routerLink]="['/transport/booking', r.id]">Book</button>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `
})
export class TransportSearchComponent {
  private fb = inject(FormBuilder);
  private transportService = inject(TransportService);
  loading = false;
  routes: any[] = [];
  form = this.fb.group({ from: [''], to: [''] });

  search() {
    this.loading = true;
    const { from, to } = this.form.value;
    this.transportService.search(from || undefined, to || undefined).subscribe(r => {
      this.routes = r;
      this.loading = false;
    });
  }
}
