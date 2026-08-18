import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { NgFor, NgIf, DatePipe, CurrencyPipe, DecimalPipe } from '@angular/common';
import { AdminService } from '../../../services/admin.service';
import { AuthService } from '../../../services/auth.service';
import { BookingManagementData } from '../../../models/admin.model';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatTabsModule, MatProgressSpinnerModule, MatSnackBarModule, NgFor, NgIf, DatePipe, CurrencyPipe, DecimalPipe],
  template: `
    <div class="page-container" style="max-width:800px">
      <h1 class="section-title">My Bookings</h1>
      <p class="section-subtitle">View and manage all your travel bookings</p>

      <div *ngIf="loading" style="text-align:center;padding:40px"><mat-spinner diameter="40" style="margin:0 auto"></mat-spinner></div>

      <div *ngIf="!loading && filteredBookings.length === 0" class="empty-state">
        <mat-icon>book_online</mat-icon>
        <h3>No bookings found</h3>
        <p>Start exploring and book your first trip!</p>
        <button mat-raised-button color="primary" routerLink="/flights">Book a Flight</button>
      </div>

      <div *ngIf="!loading && filteredBookings.length > 0">
        <div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap">
          <button mat-stroked-button [color]="activeFilter === 'ALL' ? 'primary' : ''" (click)="setFilter('ALL')">All ({{ bookings.length }})</button>
          <button mat-stroked-button [color]="activeFilter === 'FLIGHT' ? 'primary' : ''" (click)="setFilter('FLIGHT')">Flights ({{ getCount('FLIGHT') }})</button>
          <button mat-stroked-button [color]="activeFilter === 'HOTEL' ? 'primary' : ''" (click)="setFilter('HOTEL')">Hotels ({{ getCount('HOTEL') }})</button>
          <button mat-stroked-button [color]="activeFilter === 'PACKAGE' ? 'primary' : ''" (click)="setFilter('PACKAGE')">Packages ({{ getCount('PACKAGE') }})</button>
          <button mat-stroked-button [color]="activeFilter === 'CAR_RENTAL' ? 'primary' : ''" (click)="setFilter('CAR_RENTAL')">Cars ({{ getCount('CAR_RENTAL') }})</button>
          <button mat-stroked-button [color]="activeFilter === 'TRANSPORT' ? 'primary' : ''" (click)="setFilter('TRANSPORT')">Transport ({{ getCount('TRANSPORT') }})</button>
          <button mat-stroked-button [color]="activeFilter === 'INSURANCE' ? 'primary' : ''" (click)="setFilter('INSURANCE')">Insurance ({{ getCount('INSURANCE') }})</button>
        </div>

        <div *ngFor="let b of filteredBookings" style="margin-bottom:12px">
          <mat-card>
            <mat-card-header>
              <mat-icon mat-card-avatar style="font-size:32px;width:32px;height:32px;color:var(--primary)">{{ getIcon(b.serviceType) }}</mat-icon>
              <mat-card-title>{{ b.serviceName || b.serviceType }}</mat-card-title>
              <mat-card-subtitle>{{ b.bookingRef }} · {{ b.serviceType }}</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content style="margin-top:12px">
              <div style="display:flex;justify-content:space-between;align-items:center">
                <div>
                  <span *ngIf="b.amount" style="font-size:1.2rem;font-weight:700;color:var(--primary)">₹{{ b.amount | number }}</span>
                  <span *ngIf="b.travelDate" style="color:#666;margin-left:12px">Travel: {{ b.travelDate | date:'mediumDate' }}</span>
                </div>
                <div style="display:flex;gap:8px;align-items:center">
                  <span class="status-badge" [class.confirmed]="b.status === 'CONFIRMED'" [class.pending]="b.status === 'PENDING'" [class.cancelled]="b.status === 'CANCELLED'">
                    {{ b.status }}
                  </span>
                  <span *ngIf="b.paymentStatus" style="font-size:0.8rem;color:#888">{{ b.paymentStatus }}</span>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </div>
  `
})
export class BookingsComponent implements OnInit {
  private adminService = inject(AdminService);
  private authService = inject(AuthService);

  loading = true;
  bookings: BookingManagementData[] = [];
  activeFilter = 'ALL';

  ngOnInit() {
    this.loadBookings();
  }

  loadBookings() {
    this.authService.user$.subscribe(user => {
      if (user?.id) {
        this.adminService.getUserBookings(user.id).subscribe(b => {
          this.bookings = b;
          this.loading = false;
        });
      } else {
        this.loading = false;
      }
    });
  }

  setFilter(filter: string) { this.activeFilter = filter; }

  get filteredBookings(): BookingManagementData[] {
    if (this.activeFilter === 'ALL') return this.bookings;
    return this.bookings.filter(b => b.serviceType === this.activeFilter);
  }

  getCount(type: string): number {
    return this.bookings.filter(b => b.serviceType === type).length;
  }

  getIcon(type: string): string {
    const icons: Record<string, string> = { FLIGHT: 'flight', HOTEL: 'hotel', PACKAGE: 'card_giftcard', CAR_RENTAL: 'directions_car', TRANSPORT: 'train', INSURANCE: 'umbrella' };
    return icons[type] || 'book_online';
  }
}
