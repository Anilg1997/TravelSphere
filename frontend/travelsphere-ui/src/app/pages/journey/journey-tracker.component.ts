import { Component, inject, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { NgFor, NgIf, NgClass, DatePipe } from '@angular/common';
import { GoogleMapsService, MapLocation, NearbyPlace } from '../../services/google-maps.service';

declare var google: any;

interface JourneyStop {
  id: number;
  name: string;
  type: 'home' | 'station' | 'airport' | 'hotel' | 'restaurant' | 'attraction' | 'destination' | 'return';
  status: 'completed' | 'current' | 'upcoming';
  time: string;
  icon: string;
  lat: number;
  lng: number;
  description?: string;
}

interface FoodSuggestion {
  name: string;
  cuisine: string;
  rating: number;
  deliveryTime: string;
  price: string;
  image: string;
  orderUrl: string;
  distance?: string;
}

@Component({
  selector: 'app-journey-tracker',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatCardModule, MatProgressBarModule, MatChipsModule, NgFor, NgIf, NgClass, DatePipe],
  template: `
    <div class="tracker-container">
      <!-- Top Bar -->
      <div class="tracker-topbar">
        <button mat-icon-button (click)="goBack()"><mat-icon>arrow_back</mat-icon></button>
        <div class="tracker-title-area">
          <h1>Journey Tracker</h1>
          <span class="tracker-status" [class]="'status-' + currentStatus">
            <span class="status-dot"></span> {{ statusLabel }}
          </span>
        </div>
        <div class="tracker-eta">
          <mat-icon>schedule</mat-icon>
          <span>ETA: {{ eta }}</span>
        </div>
      </div>

      <!-- Progress Bar -->
      <mat-progress-bar mode="determinate" [value]="progressPercent" class="tracker-progress"></mat-progress-bar>

      <!-- Google Map -->
      <div class="map-area">
        <div class="map-wrapper">
          <!-- Real Google Map -->
          <div #mapContainer class="google-map" *ngIf="mapsAvailable"></div>

          <!-- Fallback SVG map when Google Maps is unavailable -->
          <div class="map-canvas" *ngIf="!mapsAvailable">
            <div class="demo-badge">
              <mat-icon>info</mat-icon>
              Demo Mode — Set Google Maps API key for live tracking
            </div>
            <svg class="route-svg" viewBox="0 0 800 300" preserveAspectRatio="none">
              <defs>
                <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style="stop-color:#1e4b47" />
                  <stop offset="50%" style="stop-color:#4ade80" />
                  <stop offset="100%" style="stop-color:#c05b33" />
                </linearGradient>
              </defs>
              <path d="M 40 250 Q 200 80, 400 150 Q 600 220, 760 50" fill="none" stroke="#e0dbd4" stroke-width="4" stroke-linecap="round"/>
              <path d="M 40 250 Q 200 80, 400 150 Q 600 220, 760 50" fill="none" stroke="url(#routeGrad)" stroke-width="4" stroke-linecap="round"
                    [style.stroke-dasharray]="routeLength" [style.stroke-dashoffset]="routeDashOffset"/>
            </svg>
            <div *ngFor="let stop of stops; let i = index" class="map-marker"
                 [class.marker-completed]="stop.status === 'completed'"
                 [class.marker-current]="stop.status === 'current'"
                 [class.marker-upcoming]="stop.status === 'upcoming'"
                 [style.left]="getFallbackMarkerPos(i).x + '%'" [style.top]="getFallbackMarkerPos(i).y + '%'">
              <div class="marker-dot">
                <mat-icon *ngIf="stop.status === 'completed'">check</mat-icon>
                <mat-icon *ngIf="stop.status === 'current'" class="pulse-icon">radio_button_checked</mat-icon>
                <mat-icon *ngIf="stop.status === 'upcoming'">{{ stop.icon }}</mat-icon>
              </div>
              <div class="marker-label">{{ stop.name }}</div>
            </div>
            <div class="vehicle-marker" [style.left]="vehiclePosition.x + '%'" [style.top]="vehiclePosition.y + '%'">
              <span class="vehicle-icon">{{ currentVehicleIcon }}</span>
            </div>
          </div>

          <!-- Map Controls Overlay -->
          <div class="map-controls">
            <button mat-mini-fab class="map-ctrl-btn" (click)="centerOnCurrentLocation()" title="My Location">
              <mat-icon>my_location</mat-icon>
            </button>
            <button mat-mini-fab class="map-ctrl-btn" (click)="toggleTracking()" [class.tracking-active]="isTracking" title="Toggle live tracking">
              <mat-icon>{{ isTracking ? 'pause' : 'play_arrow' }}</mat-icon>
            </button>
            <button mat-mini-fab class="map-ctrl-btn" (click)="fitAllMarkers()" title="Fit all stops">
              <mat-icon>zoom_out_map</mat-icon>
            </button>
          </div>

          <!-- Live location badge -->
          <div class="live-badge" *ngIf="isTracking">
            <span class="live-dot"></span> LIVE
          </div>
        </div>

        <div class="map-legend">
          <span><span class="legend-dot completed"></span> Completed</span>
          <span><span class="legend-dot current"></span> Current</span>
          <span><span class="legend-dot upcoming"></span> Upcoming</span>
          <span *ngIf="currentLocation"><span class="legend-dot my-location"></span> You</span>
        </div>
      </div>

      <!-- Journey Timeline -->
      <div class="timeline-section">
        <h2 class="section-heading"><mat-icon>timeline</mat-icon> Journey Timeline</h2>
        <div class="timeline">
          <div *ngFor="let stop of stops; let i = index" class="timeline-item"
               [class.item-completed]="stop.status === 'completed'"
               [class.item-current]="stop.status === 'current'"
               [class.item-upcoming]="stop.status === 'upcoming'">
            <div class="timeline-connector">
              <div class="timeline-dot" (click)="panToStop(stop)">
                <mat-icon *ngIf="stop.status === 'completed'">check</mat-icon>
                <mat-icon *ngIf="stop.status === 'current'" class="pulse-icon">radio_button_checked</mat-icon>
                <mat-icon *ngIf="stop.status === 'upcoming'">{{ stop.icon }}</mat-icon>
              </div>
              <div class="timeline-line" *ngIf="i < stops.length - 1"></div>
            </div>
            <div class="timeline-content">
              <div class="timeline-header">
                <strong>{{ stop.name }}</strong>
                <span class="timeline-time">{{ stop.time }}</span>
              </div>
              <p *ngIf="stop.description" class="timeline-desc">{{ stop.description }}</p>
              <span class="timeline-badge" [class]="'badge-' + stop.status">{{ stop.status }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Nearby Restaurants (Google Places) -->
      <div class="food-section" *ngIf="showFoodSuggestions">
        <h2 class="section-heading">
          <mat-icon>restaurant</mat-icon> Restaurants Near Your Route
          <button mat-icon-button class="refresh-foods" (click)="loadNearbyRestaurants()" [disabled]="loadingPlaces">
            <mat-icon [class.spinning]="loadingPlaces">refresh</mat-icon>
          </button>
        </h2>
        <p class="food-subtitle">Order food — delivered to your next stop!</p>

        <div class="food-grid" *ngIf="nearbyPlaces.length > 0">
          <mat-card *ngFor="let place of nearbyPlaces" class="food-card">
            <div class="food-image" [style.background]="place.photoUrl ? '' : '#f4f1ec'">
              <img *ngIf="place.photoUrl" [src]="place.photoUrl" [alt]="place.name" class="food-photo" />
              <span *ngIf="!place.photoUrl" class="food-emoji">🍽️</span>
            </div>
            <div class="food-info">
              <div class="food-header">
                <strong>{{ place.name }}</strong>
                <span class="food-rating">⭐ {{ place.rating.toFixed(1) }}</span>
              </div>
              <span class="food-cuisine">{{ place.address }}</span>
              <div class="food-meta">
                <span class="food-distance"><mat-icon>near_me</mat-icon> {{ place.distance }}</span>
                <span class="food-price" *ngIf="place.priceLevel">{{ '$'.repeat(place.priceLevel) }}</span>
                <span class="food-open" [class.open]="place.openNow" [class.closed]="!place.openNow">
                  {{ place.openNow ? 'Open Now' : 'Closed' }}
                </span>
              </div>
              <div class="food-tags">
                <span *ngFor="let type of place.types?.slice(0, 3)" class="food-tag">{{ type }}</span>
              </div>
              <button mat-raised-button color="primary" class="cta-button food-order-btn" (click)="orderFromPlace(place)">
                <mat-icon>shopping_cart</mat-icon> Order Now
              </button>
            </div>
          </mat-card>
        </div>

        <!-- Fallback food suggestions when Places API unavailable -->
        <div class="food-grid" *ngIf="nearbyPlaces.length === 0 && !loadingPlaces">
          <mat-card *ngFor="let food of fallbackFoods" class="food-card">
            <div class="food-image">{{ food.image }}</div>
            <div class="food-info">
              <div class="food-header">
                <strong>{{ food.name }}</strong>
                <span class="food-rating">⭐ {{ food.rating }}</span>
              </div>
              <span class="food-cuisine">{{ food.cuisine }}</span>
              <div class="food-meta">
                <span><mat-icon>schedule</mat-icon> {{ food.deliveryTime }}</span>
                <span class="food-price">{{ food.price }}</span>
              </div>
              <button mat-raised-button color="primary" class="cta-button food-order-btn" (click)="orderFood(food)">
                <mat-icon>shopping_cart</mat-icon> Order Now
              </button>
            </div>
          </mat-card>
        </div>
      </div>

      <!-- Safety Status -->
      <div class="safety-card">
        <div class="safety-icon">🛡️</div>
        <div class="safety-info">
          <strong>Journey Safety Status</strong>
          <span>All safety checks passed. Your emergency contacts have been notified of your journey.</span>
        </div>
        <span class="safety-badge">Safe ✓</span>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; background: #faf8f5; min-height: 100vh; }

    .tracker-container { max-width: 900px; margin: 0 auto; padding: 0 0 40px; }

    /* ── Top Bar ── */
    .tracker-topbar {
      display: flex; align-items: center; gap: 16px;
      padding: 16px 24px;
      background: linear-gradient(135deg, #1e4b47, #2f6a63);
      color: #fff;
    }
    .tracker-title-area { flex: 1; }
    .tracker-topbar h1 { font-family: var(--serif); font-size: 1.2rem; margin: 0; }
    .tracker-status { font-size: 0.78rem; display: flex; align-items: center; gap: 6px; opacity: 0.85; }
    .status-dot { width: 7px; height: 7px; border-radius: 50%; display: inline-block; }
    .status-traveling .status-dot { background: #4ade80; }
    .status-arrived .status-dot { background: #f59e0b; }
    .status-completed .status-dot { background: #22c55e; }
    .tracker-eta { display: flex; align-items: center; gap: 6px; font-size: 0.88rem; }

    .tracker-progress { height: 4px; }

    /* ── Map ── */
    .map-area { padding: 0 24px; }
    .map-wrapper {
      position: relative; border-radius: 20px; overflow: hidden;
      margin-top: 16px; box-shadow: 0 8px 30px rgba(10,8,6,0.1);
    }
    .google-map { width: 100%; height: 450px; }

    /* ── Fallback Map ── */
    .map-canvas {
      position: relative; width: 100%; aspect-ratio: 16/6;
      background: linear-gradient(180deg, #e8f0ee 0%, #d4e5e1 100%);
    }
    .demo-badge {
      position: absolute; top: 12px; left: 12px; z-index: 5;
      display: flex; align-items: center; gap: 6px;
      background: rgba(124, 58, 237, 0.9); color: #fff;
      font-size: 0.75rem; font-weight: 600;
      padding: 6px 12px; border-radius: 8px;
    }
    .demo-badge mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .route-svg { position: absolute; inset: 0; width: 100%; height: 100%; }
    .route-svg path:last-child { transition: stroke-dashoffset 1.5s ease; }
    .map-marker {
      position: absolute; transform: translate(-50%, -50%);
      display: flex; flex-direction: column; align-items: center; gap: 4px; z-index: 2;
    }
    .marker-dot {
      width: 32px; height: 32px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      border: 2px solid #fff; box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    }
    .marker-completed .marker-dot { background: #1e4b47; color: #fff; }
    .marker-current .marker-dot { background: #f59e0b; color: #fff; animation: markerPulse 2s infinite; }
    .marker-upcoming .marker-dot { background: #e8e4de; color: #7a6e63; }
    .marker-label {
      font-size: 0.65rem; font-weight: 600; white-space: nowrap;
      background: rgba(255,255,255,0.9); padding: 2px 6px; border-radius: 4px;
    }
    @keyframes markerPulse { 0%,100% { box-shadow: 0 0 0 0 rgba(245,158,11,0.4); } 50% { box-shadow: 0 0 0 10px rgba(245,158,11,0); } }
    .vehicle-marker {
      position: absolute; transform: translate(-50%, -50%);
      z-index: 3; transition: left 2s ease, top 2s ease;
    }
    .vehicle-icon { font-size: 1.8rem; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3)); }

    /* ── Map Controls ── */
    .map-controls {
      position: absolute; top: 12px; right: 12px; z-index: 5;
      display: flex; flex-direction: column; gap: 8px;
    }
    .map-ctrl-btn { background: #fff !important; box-shadow: 0 2px 8px rgba(0,0,0,0.15) !important; }
    .tracking-active { background: #ef4444 !important; color: #fff !important; }

    .live-badge {
      position: absolute; top: 12px; left: 12px; z-index: 5;
      display: flex; align-items: center; gap: 6px;
      background: rgba(239, 68, 68, 0.9); color: #fff;
      font-size: 0.75rem; font-weight: 700;
      padding: 6px 12px; border-radius: 8px;
      animation: livePulse 2s infinite;
    }
    @keyframes livePulse { 0%,100% { opacity: 1; } 50% { opacity: 0.7; } }
    .live-dot { width: 8px; height: 8px; border-radius: 50%; background: #fff; }

    .map-legend {
      display: flex; justify-content: center; gap: 20px;
      padding: 10px 0; font-size: 0.76rem; color: #7a6e63;
    }
    .legend-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; margin-right: 4px; }
    .legend-dot.completed { background: #1e4b47; }
    .legend-dot.current { background: #f59e0b; }
    .legend-dot.upcoming { background: #e8e4de; }
    .legend-dot.my-location { background: #3b82f6; box-shadow: 0 0 6px #3b82f6; }

    /* ── Timeline ── */
    .timeline-section { padding: 24px; }
    .section-heading {
      display: flex; align-items: center; gap: 8px;
      font-family: var(--serif); font-size: 1.1rem; color: #2b2420;
      margin-bottom: 20px;
    }
    .timeline { display: flex; flex-direction: column; }
    .timeline-item { display: flex; gap: 16px; }
    .timeline-connector { display: flex; flex-direction: column; align-items: center; }
    .timeline-dot {
      width: 36px; height: 36px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; z-index: 1; cursor: pointer;
      transition: transform 0.2s;
    }
    .timeline-dot:hover { transform: scale(1.15); }
    .item-completed .timeline-dot { background: #1e4b47; color: #fff; }
    .item-current .timeline-dot { background: #f59e0b; color: #fff; animation: markerPulse 2s infinite; }
    .item-upcoming .timeline-dot { background: #e8e4de; color: #7a6e63; }
    .timeline-line { width: 2px; flex: 1; min-height: 30px; background: #e0dbd4; }
    .item-completed .timeline-line { background: #1e4b47; }
    .timeline-content { padding-bottom: 20px; flex: 1; }
    .timeline-header { display: flex; justify-content: space-between; align-items: center; }
    .timeline-header strong { font-size: 0.92rem; color: #2b2420; }
    .timeline-time { font-size: 0.78rem; color: #7a6e63; }
    .timeline-desc { font-size: 0.82rem; color: #5c5046; margin: 4px 0 6px; }
    .timeline-badge {
      display: inline-block; font-size: 0.7rem; font-weight: 600;
      padding: 2px 8px; border-radius: 6px; text-transform: uppercase;
    }
    .badge-completed { background: #dcfce7; color: #166534; }
    .badge-current { background: #fef3c7; color: #92400e; }
    .badge-upcoming { background: #f3f0ec; color: #7a6e63; }

    /* ── Food Suggestions ── */
    .food-section { padding: 0 24px; margin-top: 8px; }
    .food-subtitle { font-size: 0.88rem; color: #7a6e63; margin-top: -12px; margin-bottom: 16px; }
    .refresh-foods { margin-left: auto; }
    .spinning { animation: spin 1s linear infinite; }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    .food-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
    .food-card { border-radius: 16px !important; overflow: hidden; }
    .food-image {
      height: 140px; display: flex; align-items: center; justify-content: center;
      font-size: 2.5rem; background: #f4f1ec; overflow: hidden;
    }
    .food-photo { width: 100%; height: 100%; object-fit: cover; }
    .food-emoji { font-size: 3rem; }
    .food-info { padding: 14px; }
    .food-header { display: flex; justify-content: space-between; align-items: center; }
    .food-header strong { font-size: 0.92rem; }
    .food-rating { font-size: 0.82rem; color: #f59e0b; }
    .food-cuisine { font-size: 0.78rem; color: #7a6e63; display: block; margin: 4px 0 8px; }
    .food-meta { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; flex-wrap: wrap; }
    .food-meta span { display: flex; align-items: center; gap: 4px; font-size: 0.78rem; color: #5c5046; }
    .food-meta mat-icon { font-size: 14px; width: 14px; height: 14px; }
    .food-distance { color: #3b82f6 !important; font-weight: 600; }
    .food-price { font-weight: 600; color: #1e4b47 !important; }
    .food-open { font-weight: 600; }
    .food-open.open { color: #16a34a; }
    .food-open.closed { color: #dc2626; }
    .food-tags { display: flex; gap: 4px; margin-bottom: 10px; flex-wrap: wrap; }
    .food-tag {
      font-size: 0.68rem; background: #f4f1ec; color: #7a6e63;
      padding: 2px 6px; border-radius: 4px; text-transform: capitalize;
    }
    .food-order-btn { width: 100%; border-radius: 10px !important; font-size: 0.85rem !important; }

    /* ── Safety ── */
    .safety-card {
      display: flex; align-items: center; gap: 16px;
      margin: 24px 24px 0; padding: 16px 20px;
      background: #f0faf9; border: 1px solid #c8e6e2;
      border-radius: 16px;
    }
    .safety-icon { font-size: 2rem; }
    .safety-info { flex: 1; }
    .safety-info strong { display: block; font-size: 0.9rem; color: #2b2420; }
    .safety-info span { font-size: 0.78rem; color: #5c5046; }
    .safety-badge {
      background: #dcfce7; color: #166534;
      font-size: 0.8rem; font-weight: 700;
      padding: 6px 14px; border-radius: 8px;
    }

    @media (max-width: 640px) {
      .tracker-topbar { padding: 12px 16px; }
      .map-area, .timeline-section, .food-section { padding-left: 16px; padding-right: 16px; }
      .food-grid { grid-template-columns: 1fr; }
      .google-map { height: 350px; }
    }
  `]
})
export class JourneyTrackerComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('mapContainer') mapContainer!: ElementRef<HTMLDivElement>;

  private router = inject(Router);
  private mapsService = inject(GoogleMapsService);

  private animTimer: ReturnType<typeof setInterval> | null = null;
  private watchId: number = -1;
  private map: any = null;
  private markers: any[] = [];
  private routePolyline: any = null;
  private dashedRoute: any = null;
  private currentLocationMarker: any = null;
  private infoWindow: any = null;

  mapsAvailable = false;
  progressPercent = 0;
  currentStatus: 'traveling' | 'arrived' | 'completed' = 'traveling';
  statusLabel = 'Traveling — en route to destination';
  eta = '3h 45m';
  showFoodSuggestions = true;
  isTracking = false;
  loadingPlaces = false;

  routeLength = 1100;
  routeDashOffset = 1100;
  vehiclePosition = { x: 10, y: 75 };
  currentVehicleIcon = '✈️';
  currentLocation: MapLocation | null = null;

  stops: JourneyStop[] = [
    { id: 1, name: 'Home', type: 'home', status: 'completed', time: '6:00 AM', icon: 'home', lat: 28.6139, lng: 77.2090, description: 'Pickup from home — cab arrived on time' },
    { id: 2, name: 'Delhi Airport', type: 'airport', status: 'completed', time: '7:30 AM', icon: 'flight', lat: 28.5562, lng: 77.1000, description: 'Check-in completed. Boarding pass received.' },
    { id: 3, name: 'In Transit', type: 'station', status: 'current', time: '9:15 AM', icon: 'flight', lat: 15.0, lng: 78.0, description: 'Flight AI-462 — cruising at 35,000 ft' },
    { id: 4, name: 'Kochi Airport', type: 'airport', status: 'upcoming', time: '11:30 AM', icon: 'flight', lat: 9.9471, lng: 76.2733, description: 'Arrival at Kochi — cab to hotel' },
    { id: 5, name: 'Hotel Leela, Kochi', type: 'hotel', status: 'upcoming', time: '1:00 PM', icon: 'hotel', lat: 9.9680, lng: 76.2870, description: 'Check-in — room 402, lake view' },
    { id: 6, name: 'Alleppey Backwaters', type: 'attraction', status: 'upcoming', time: '3:00 PM', icon: 'sailing', lat: 9.4981, lng: 76.3388, description: 'Houseboat boarding — overnight cruise' },
    { id: 7, name: 'Return Home', type: 'return', status: 'upcoming', time: 'Day 7, 6:00 PM', icon: 'home', lat: 28.6139, lng: 77.2090, description: 'Flight back — safe journey home' },
  ];

  nearbyPlaces: NearbyPlace[] = [];

  fallbackFoods: FoodSuggestion[] = [
    { name: 'Sky Kitchen', cuisine: 'Indian · Biryani · Tandoor', rating: 4.6, deliveryTime: '25-30 min', price: '₹250-400', image: '🍛', orderUrl: '#' },
    { name: 'Air Cafe', cuisine: 'Continental · Sandwiches', rating: 4.3, deliveryTime: '20-25 min', price: '₹180-300', image: '🥪', orderUrl: '#' },
    { name: 'Fresh Bites', cuisine: 'South Indian · Dosa · Idli', rating: 4.5, deliveryTime: '15-20 min', price: '₹120-220', image: '🫓', orderUrl: '#' },
  ];

  ngOnInit() {
    this.startFallbackAnimation();
  }

  async ngAfterViewInit() {
    await this.mapsService.load();
    this.mapsAvailable = this.mapsService.isAvailable();

    if (this.mapsAvailable && this.mapContainer) {
      this.initMap();
    }
  }

  ngOnDestroy() {
    if (this.animTimer) clearInterval(this.animTimer);
    this.mapsService.clearWatch(this.watchId);
  }

  // ── Map Initialization ──

  private initMap() {
    const currentStop = this.stops.find(s => s.status === 'current') || this.stops[0];

    this.map = this.mapsService.createMap(this.mapContainer.nativeElement, {
      center: { lat: currentStop.lat, lng: currentStop.lng },
      zoom: 6,
    });

    this.infoWindow = this.mapsService.createInfoWindow('');
    this.addStopMarkers();
    this.drawRouteOnMap();
    this.fitAllMarkers();

    // Try to get user's current location
    this.tryGetCurrentLocation();
  }

  private addStopMarkers() {
    this.markers.forEach(m => m?.setMap(null));
    this.markers = [];

    this.stops.forEach(stop => {
      const markerHtml = this.createStopMarkerHtml(stop);
      const marker = this.mapsService.createAdvancedMarker(this.map, stop, markerHtml);

      if (marker) {
        google.maps.event.addListener(marker, 'click', () => {
          this.infoWindow.setContent(`
            <div style="padding:8px;max-width:250px">
              <strong style="font-size:14px">${stop.name}</strong>
              <p style="margin:4px 0;color:#666;font-size:12px">${stop.description || ''}</p>
              <span style="font-size:11px;color:#999">${stop.time}</span>
            </div>
          `);
          this.infoWindow.open(this.map, marker);
        });
      }

      this.markers.push(marker);
    });
  }

  private createStopMarkerHtml(stop: JourneyStop): string {
    const colors: Record<string, string> = {
      completed: '#1e4b47',
      current: '#f59e0b',
      upcoming: '#e8e4de',
    };
    const textColors: Record<string, string> = {
      completed: '#fff',
      current: '#fff',
      upcoming: '#7a6e63',
    };
    const icons: Record<string, string> = {
      completed: '✓',
      current: '●',
      upcoming: stop.icon === 'home' ? '🏠' : stop.icon === 'flight' ? '✈️' : stop.icon === 'hotel' ? '🏨' : stop.icon === 'sailing' ? '⛵' : '📍',
    };

    const pulseStyle = stop.status === 'current'
      ? 'animation: pulse 2s infinite; box-shadow: 0 0 0 6px rgba(245,158,11,0.3);'
      : '';

    return `
      <div style="
        width:36px;height:36px;border-radius:50%;
        background:${colors[stop.status]};
        color:${textColors[stop.status]};
        display:flex;align-items:center;justify-content:center;
        font-size:14px;font-weight:700;
        border:3px solid #fff;
        box-shadow:0 2px 8px rgba(0,0,0,0.3);
        cursor:pointer;
        ${pulseStyle}
      ">
        ${icons[stop.status]}
      </div>
      <div style="
        position:absolute;top:40px;left:50%;transform:translateX(-50%);
        white-space:nowrap;font-size:10px;font-weight:600;
        background:rgba(255,255,255,0.95);padding:2px 6px;border-radius:4px;
        box-shadow:0 1px 4px rgba(0,0,0,0.1);
      ">${stop.name}</div>
    `;
  }

  private drawRouteOnMap() {
    const completedStops = this.stops.filter(s => s.status === 'completed' || s.status === 'current');
    const upcomingStops = this.stops.filter(s => s.status === 'current' || s.status === 'upcoming');

    if (completedStops.length > 1) {
      this.routePolyline = this.mapsService.drawRoute(this.map,
        completedStops.map(s => ({ lat: s.lat, lng: s.lng })),
        { strokeColor: '#1e4b47', strokeWeight: 4 }
      );
    }

    if (upcomingStops.length > 1) {
      this.dashedRoute = this.mapsService.drawDashedRoute(this.map,
        upcomingStops.map(s => ({ lat: s.lat, lng: s.lng }))
      );
    }
  }

  fitAllMarkers() {
    if (this.mapsAvailable && this.map) {
      this.mapsService.fitBounds(this.map,
        this.stops.map(s => ({ lat: s.lat, lng: s.lng }))
      );
    } else {
      // Fallback animation
      this.startFallbackAnimation();
    }
  }

  panToStop(stop: JourneyStop) {
    if (this.mapsAvailable && this.map) {
      this.map.panTo({ lat: stop.lat, lng: stop.lng });
      this.map.setZoom(12);
    }
  }

  // ── Geolocation ──

  private tryGetCurrentLocation() {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.currentLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        this.addCurrentLocationMarker();
      },
      () => { /* Location denied */ },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  private addCurrentLocationMarker() {
    if (!this.currentLocation || !this.map) return;

    const markerHtml = `
      <div style="
        width:20px;height:20px;border-radius:50%;
        background:#3b82f6;border:3px solid #fff;
        box-shadow:0 0 0 4px rgba(59,130,246,0.3),0 2px 8px rgba(0,0,0,0.3);
      "></div>
    `;

    this.currentLocationMarker = this.mapsService.createAdvancedMarker(
      this.map, this.currentLocation, markerHtml
    );
  }

  centerOnCurrentLocation() {
    if (this.currentLocation && this.map) {
      this.map.panTo({ lat: this.currentLocation.lat, lng: this.currentLocation.lng });
      this.map.setZoom(14);
    } else {
      this.tryGetCurrentLocation();
    }
  }

  toggleTracking() {
    this.isTracking = !this.isTracking;

    if (this.isTracking) {
      this.startLiveTracking();
    } else {
      this.mapsService.clearWatch(this.watchId);
    }
  }

  private startLiveTracking() {
    this.watchId = this.mapsService.watchPosition(
      (pos) => {
        this.currentLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };

        if (this.currentLocationMarker) {
          this.currentLocationMarker.position = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        } else {
          this.addCurrentLocationMarker();
        }

        if (this.map) {
          this.map.panTo({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        }
      },
      (err) => {
        console.warn('Geolocation error:', err);
        this.isTracking = false;
      }
    );
  }

  // ── Nearby Restaurants ──

  loadNearbyRestaurants() {
    this.loadingPlaces = true;

    const currentStop = this.stops.find(s => s.status === 'current') || this.stops[0];
    const location: MapLocation = this.currentLocation || { lat: currentStop.lat, lng: currentStop.lng };

    this.mapsService.searchNearby(this.map, location, 'restaurant', 5000).then(places => {
      this.nearbyPlaces = places;
      this.loadingPlaces = false;
    });
  }

  // ── Fallback Animation ──

  private startFallbackAnimation() {
    let progress = 0;
    if (this.animTimer) clearInterval(this.animTimer);

    this.animTimer = setInterval(() => {
      if (progress >= 45) {
        clearInterval(this.animTimer!);
        return;
      }
      progress += 1;
      this.progressPercent = progress;
      this.routeDashOffset = this.routeLength - (this.routeLength * progress / 100);
      this.vehiclePosition = {
        x: 10 + (progress * 1.5),
        y: 75 - (progress * 0.6) + Math.sin(progress * 0.1) * 5,
      };
    }, 80);
  }

  getFallbackMarkerPos(index: number): { x: number; y: number } {
    const positions = [
      { x: 5, y: 85 }, { x: 18, y: 70 }, { x: 45, y: 35 }, { x: 62, y: 55 },
      { x: 72, y: 50 }, { x: 85, y: 20 }, { x: 95, y: 10 },
    ];
    return positions[index] || { x: 50, y: 50 };
  }

  orderFood(food: FoodSuggestion) {
    alert(`Ordering from ${food.name}! This would integrate with Swiggy/Zomato API.`);
  }

  orderFromPlace(place: NearbyPlace) {
    alert(`Ordering from ${place.name}! This would integrate with Swiggy/Zomato API for delivery.`);
  }

  goBack() {
    this.router.navigate(['/home']);
  }
}
