import { Component, inject, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgFor, NgIf, DecimalPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { GoogleMapsService, NearbyPlace, MapLocation } from '../../services/google-maps.service';

interface CategoryConfig {
  label: string;
  icon: string;
  placeType: string;
  linkPrefix: string;
  color: string;
}

@Component({
  selector: 'app-nearby-discovery',
  standalone: true,
  imports: [RouterLink, NgFor, NgIf, DecimalPipe, MatCardModule, MatButtonModule, MatIconModule, MatTabsModule, MatChipsModule, MatProgressSpinnerModule, MatSnackBarModule],
  template: `
    <div class="page-container">
      <!-- Hidden map element required by Google Places API -->
      <div #mapContainer style="width:1px;height:1px;position:absolute;opacity:0;pointer-events:none"></div>

      <h1 class="section-title">Discover Nearby</h1>
      <p class="section-subtitle">Explore what's around you — restaurants, hotels, malls & more</p>

      <!-- Location status -->
      <div *ngIf="!locationEnabled && !loadingLocation" class="location-prompt">
        <mat-card style="text-align:center;padding:40px">
          <mat-icon style="font-size:56px;width:56px;height:56px;color:var(--primary)">my_location</mat-icon>
          <h2 style="margin:16px 0 8px">Enable Location</h2>
          <p style="color:#666;margin-bottom:24px;max-width:400px;margin-left:auto;margin-right:auto">
            Allow location access to discover restaurants, hotels, malls, and attractions near you.
          </p>
          <button mat-raised-button color="primary" (click)="requestLocation()">
            <mat-icon>gps_fixed</mat-icon> Turn On Location
          </button>
        </mat-card>
      </div>

      <!-- Loading location -->
      <div *ngIf="loadingLocation" style="text-align:center;padding:60px">
        <mat-spinner diameter="40" style="margin:0 auto"></mat-spinner>
        <p style="color:#666;margin-top:16px">Detecting your location...</p>
      </div>

      <!-- Location error -->
      <div *ngIf="locationError" class="location-prompt">
        <mat-card style="text-align:center;padding:40px">
          <mat-icon style="font-size:56px;width:56px;height:56px;color:#e53935">location_off</mat-icon>
          <h2 style="margin:16px 0 8px">Location Unavailable</h2>
          <p style="color:#666;margin-bottom:24px">{{ locationError }}</p>
          <button mat-raised-button color="primary" (click)="requestLocation()">
            <mat-icon>refresh</mat-icon> Try Again
          </button>
        </mat-card>
      </div>

      <!-- Results -->
      <div *ngIf="locationEnabled && !loadingLocation">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px;flex-wrap:wrap">
          <mat-icon style="color:var(--primary)">location_on</mat-icon>
          <span style="color:#666">Showing places near you</span>
          <button mat-stroked-button (click)="refreshLocation()" style="font-size:12px">
            <mat-icon style="font-size:16px;height:16px;width:16px">refresh</mat-icon> Refresh
          </button>
        </div>

        <!-- Category tabs -->
        <mat-tab-group (selectedTabChange)="onCategoryChange($event.index)" animationDuration="200ms">
          <mat-tab *ngFor="let cat of categories" [label]="cat.label">
          </mat-tab>
        </mat-tab-group>

        <!-- Category results -->
        <div style="margin-top:20px">
          <div *ngIf="loadingPlaces" style="text-align:center;padding:40px">
            <mat-spinner diameter="32" style="margin:0 auto"></mat-spinner>
            <p style="color:#666;margin-top:12px">Searching nearby {{ categories[activeCategory].label.toLowerCase() }}...</p>
          </div>

          <div *ngIf="!loadingPlaces && currentPlaces.length === 0" style="text-align:center;padding:40px;color:#666">
            <mat-icon style="font-size:48px;color:#ccc">search_off</mat-icon>
            <p>No {{ categories[activeCategory].label.toLowerCase() }} found nearby. Try a different category.</p>
          </div>

          <div *ngIf="!loadingPlaces && currentPlaces.length > 0" style="display:grid;grid-template-columns:repeat(auto-fill, minmax(300px, 1fr));gap:16px">
            <mat-card *ngFor="let place of currentPlaces" class="place-card">
              <div *ngIf="place.photoUrl" class="place-image" [style.background-image]="'url(' + place.photoUrl + ')'"></div>
              <div *ngIf="!place.photoUrl" class="place-image-placeholder">
                <mat-icon style="font-size:40px;color:#ccc">{{ categories[activeCategory].icon }}</mat-icon>
              </div>

              <mat-card-content style="padding:16px">
                <div style="display:flex;justify-content:space-between;align-items:start">
                  <div style="flex:1;min-width:0">
                    <h3 style="margin:0 0 4px;font-size:1rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{{ place.name }}</h3>
                    <p style="margin:0;color:#666;font-size:0.85rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{{ place.address }}</p>
                  </div>
                  <span *ngIf="place.openNow !== undefined" [style.color]="place.openNow ? '#2e7d32' : '#c62828'" style="font-size:0.8rem;font-weight:600;white-space:nowrap;margin-left:8px">
                    {{ place.openNow ? 'Open' : 'Closed' }}
                  </span>
                </div>

                <div style="display:flex;gap:12px;align-items:center;margin-top:10px;flex-wrap:wrap">
                  <span *ngIf="place.rating" style="display:flex;align-items:center;gap:4px;font-size:0.85rem">
                    <span style="color:#f9a825">★</span>
                    <strong>{{ place.rating | number:'1.1-1' }}</strong>
                    <span style="color:#999">({{ place.totalRatings }})</span>
                  </span>
                  <span *ngIf="place.distance" style="display:flex;align-items:center;gap:4px;font-size:0.85rem;color:#666">
                    <mat-icon style="font-size:14px;height:14px;width:14px">near_me</mat-icon>
                    {{ place.distance }}
                  </span>
                  <span *ngIf="place.priceLevel" style="font-size:0.85rem;color:#666">
                    {{ '$'.repeat(place.priceLevel) }}
                  </span>
                </div>

                <div style="margin-top:12px">
                  <mat-chip-set>
                    <mat-chip *ngFor="let type of getDisplayTypes(place.types).slice(0,3)" style="font-size:10px;height:24px">{{ type }}</mat-chip>
                  </mat-chip-set>
                </div>

                <div style="margin-top:12px;display:flex;gap:8px">
                  <a *ngIf="categories[activeCategory].linkPrefix" mat-stroked-button color="primary"
                     [routerLink]="categories[activeCategory].linkPrefix" style="font-size:12px">
                    <mat-icon style="font-size:16px;height:16px;width:16px">open_in_new</mat-icon>
                    {{ getActionLabel() }}
                  </a>
                  <a mat-stroked-button [href]="'https://www.google.com/maps/place/?place_id=' + place.placeId" target="_blank" style="font-size:12px">
                    <mat-icon style="font-size:16px;height:16px;width:16px">map</mat-icon> View on Map
                  </a>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .location-prompt { max-width: 500px; margin: 0 auto; }
    .place-card { overflow: hidden; transition: transform 0.2s, box-shadow 0.2s; cursor: default; }
    .place-card:hover { transform: translateY(-2px); box-shadow: 0 4px 16px rgba(0,0,0,0.12); }
    .place-image { width: 100%; height: 160px; background-size: cover; background-position: center; background-color: #f5f5f5; }
    .place-image-placeholder {
      width: 100%; height: 120px; background: #f5f5f5;
      display: flex; align-items: center; justify-content: center;
    }
    ::ng-deep .mat-mdc-tab-group { margin-bottom: 0; }
    ::ng-deep .mat-mdc-tab-body-content { overflow: visible !important; }
  `]
})
export class NearbyDiscoveryComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapContainer') mapContainer!: ElementRef;

  private googleMaps = inject(GoogleMapsService);
  private snackBar = inject(MatSnackBar);

  private map: any = null;
  private watchId = -1;

  locationEnabled = false;
  loadingLocation = false;
  loadingPlaces = false;
  locationError = '';
  currentLat = 0;
  currentLng = 0;
  activeCategory = 0;
  currentPlaces: NearbyPlace[] = [];
  private allPlaces: Map<number, NearbyPlace[]> = new Map();

  categories: CategoryConfig[] = [
    { label: '🍽️ Restaurants', icon: 'restaurant', placeType: 'restaurant', linkPrefix: '/food', color: '#e65100' },
    { label: '🏨 Hotels', icon: 'hotel', placeType: 'lodging', linkPrefix: '/hotels', color: '#1565c0' },
    { label: '🛍️ Malls & Shopping', icon: 'shopping_cart', placeType: 'shopping_mall', linkPrefix: '', color: '#6a1b9a' },
    { label: '☕ Cafes', icon: 'coffee', placeType: 'cafe', linkPrefix: '/food', color: '#4e342e' },
    { label: '🎭 Attractions', icon: 'attractions', placeType: 'tourist_attraction', linkPrefix: '', color: '#2e7d32' },
    { label: '⛽ Gas Stations', icon: 'local_gas_station', placeType: 'gas_station', linkPrefix: '', color: '#37474f' },
  ];

  ngOnInit() {
    // Check if location was already enabled
    const stored = localStorage.getItem('travelsphere_location_enabled');
    const lat = localStorage.getItem('travelsphere_lat');
    const lng = localStorage.getItem('travelsphere_lng');

    if (stored === 'true' && lat && lng) {
      this.currentLat = parseFloat(lat);
      this.currentLng = parseFloat(lng);
      this.locationEnabled = true;
      this.loadNearbyPlaces();
    }
  }

  async ngAfterViewInit() {
    await this.googleMaps.load();
    // Small delay to ensure the hidden map container is in the DOM
    setTimeout(() => this.initMap(), 500);
  }

  ngOnDestroy() {
    this.googleMaps.clearWatch(this.watchId);
  }

  private initMap() {
    if (this.mapContainer && this.googleMaps.isAvailable()) {
      this.map = this.googleMaps.createMap(this.mapContainer.nativeElement, {
        center: { lat: this.currentLat || 20.5937, lng: this.currentLng || 78.9629 },
        zoom: 14,
      });
    }
  }

  requestLocation() {
    this.loadingLocation = true;
    this.locationError = '';

    if (!('geolocation' in navigator)) {
      this.loadingLocation = false;
      this.locationError = 'Geolocation is not supported by your browser.';
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.currentLat = pos.coords.latitude;
        this.currentLng = pos.coords.longitude;
        this.locationEnabled = true;
        this.loadingLocation = false;

        // Store for other components
        localStorage.setItem('travelsphere_lat', String(this.currentLat));
        localStorage.setItem('travelsphere_lng', String(this.currentLng));
        localStorage.setItem('travelsphere_location_enabled', 'true');

        this.loadNearbyPlaces();
        this.startWatching();
      },
      (err) => {
        this.loadingLocation = false;
        if (err.code === err.PERMISSION_DENIED) {
          this.locationError = 'Location permission denied. Please enable location access in your browser settings.';
        } else if (err.code === err.TIMEOUT) {
          this.locationError = 'Location request timed out. Please try again.';
        } else {
          this.locationError = 'Unable to get your location. Please try again.';
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 }
    );
  }

  private startWatching() {
    this.watchId = this.googleMaps.watchPosition(
      (pos) => {
        this.currentLat = pos.coords.latitude;
        this.currentLng = pos.coords.longitude;
        localStorage.setItem('travelsphere_lat', String(this.currentLat));
        localStorage.setItem('travelsphere_lng', String(this.currentLng));
      }
    );
  }

  refreshLocation() {
    this.allPlaces.clear();
    this.currentPlaces = [];
    if (this.locationEnabled) {
      this.loadNearbyPlaces();
    } else {
      this.requestLocation();
    }
  }

  async loadNearbyPlaces() {
    if (!this.locationEnabled) return;

    // Ensure map is initialized
    if (!this.map && this.googleMaps.isAvailable()) {
      this.initMap();
      await new Promise(r => setTimeout(r, 500));
    }

    this.loadingPlaces = true;
    this.allPlaces.clear();

    const location: MapLocation = { lat: this.currentLat, lng: this.currentLng };

    // Load all categories in parallel
    const promises = this.categories.map((cat, index) =>
      this.googleMaps.searchNearby(this.map, location, cat.placeType, 5000)
        .then(places => {
          this.allPlaces.set(index, places);
        })
        .catch(() => {
          this.allPlaces.set(index, []);
        })
    );

    await Promise.all(promises);

    this.loadingPlaces = false;
    this.currentPlaces = this.allPlaces.get(this.activeCategory) || [];
  }

  onCategoryChange(index: number) {
    this.activeCategory = index;
    this.currentPlaces = this.allPlaces.get(index) || [];
  }

  getDisplayTypes(types: string[]): string[] {
    const prettyNames: Record<string, string> = {
      restaurant: 'Restaurant', cafe: 'Cafe', lodging: 'Hotel',
      shopping_mall: 'Shopping', tourist_attraction: 'Attraction',
      bar: 'Bar', gas_station: 'Gas', hospital: 'Hospital',
      pharmacy: 'Pharmacy', bank: 'Bank', atm: 'ATM',
      gym: 'Gym', park: 'Park', mosque: 'Temple',
      church: 'Church', school: 'School',
    };
    return types
      .filter(t => prettyNames[t])
      .map(t => prettyNames[t])
      .filter((v, i, a) => a.indexOf(v) === i);
  }

  getActionLabel(): string {
    const labels: Record<number, string> = {
      0: 'Order Food',
      1: 'Book Hotel',
      2: 'View Deals',
      3: 'Order Food',
      4: 'Explore',
      5: 'Find Route',
    };
    return labels[this.activeCategory] || 'View';
  }
}
