import { Component, inject, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatSliderModule } from '@angular/material/slider';
import { FormsModule } from '@angular/forms';
import { GoogleMapsService, MapLocation, NearbyPlace } from '../../services/google-maps.service';

declare var google: any;

@Component({
  selector: 'app-mini-map',
  standalone: true,
  imports: [NgIf, NgFor, FormsModule, MatIconModule, MatButtonModule, MatTooltipModule, MatChipsModule, MatSliderModule],
  template: `
    <div class="mini-map-container" [class.minimized]="isMinimized" [class.expanded]="isExpanded"
         [style.top.px]="dragPos.top" [style.right.px]="dragPos.right"
         [style.bottom]="dragPos.top !== null ? 'auto' : '24px'">
      <!-- Toggle button when minimized -->
      <button *ngIf="isMinimized" mat-mini-fab class="mini-map-toggle" (click)="toggle()" matTooltip="Show map">
        <mat-icon>map</mat-icon>
      </button>

      <!-- Expanded mini map -->
      <div *ngIf="!isMinimized" class="mini-map-panel">
        <div class="mini-map-header" (mousedown)="startDrag($event)" (touchstart)="startDrag($event)" class="drag-handle">
          <span class="mini-map-title">
            <mat-icon style="font-size:16px;width:16px;height:16px;cursor:grab">drag_indicator</mat-icon>
            Map
          </span>
          <div class="mini-map-actions">
            <button mat-icon-button class="mini-map-btn" (click)="centerOnUser()" matTooltip="My location">
              <mat-icon>my_location</mat-icon>
            </button>
            <button mat-icon-button class="mini-map-btn" (click)="toggleExpand()" matTooltip="Expand">
              <mat-icon>{{ isExpanded ? 'fullscreen_exit' : 'fullscreen' }}</mat-icon>
            </button>
            <button *ngIf="isPositionChanged" mat-icon-button class="mini-map-btn reset-btn" (click)="resetPosition()" matTooltip="Reset position">
              <mat-icon>restart_alt</mat-icon>
            </button>
            <button mat-icon-button class="mini-map-btn" (click)="toggle()" matTooltip="Minimize">
              <mat-icon>close</mat-icon>
            </button>
          </div>
        </div>

        <!-- Category chips (shown when expanded) -->
        <div class="mini-map-controls" *ngIf="isExpanded && showPlaces">
          <div class="mini-map-categories">
            <button *ngFor="let cat of categories; let i = index"
                    mat-stroked-button
                    class="category-chip"
                    [class.active]="activeCategory === i"
                    (click)="selectCategory(i)">
              {{ cat.icon }} {{ cat.label }}
            </button>
          </div>
          <div class="radius-control">
            <div class="radius-label">
              <mat-icon style="font-size:14px;width:14px;height:14px">radio_button_unchecked</mat-icon>
              <span>Radius: {{ formatRadius(searchRadius) }}</span>
            </div>
            <input type="range"
                   class="radius-slider"
                   [(ngModel)]="searchRadius"
                   [min]="500"
                   [max]="10000"
                   [step]="500"
                   (ngModelChange)="onRadiusChange($event)">          <div class="radius-presets">
            <button *ngFor="let preset of radiusPresets"
                    class="radius-preset"
                    [class.active]="searchRadius === preset.value"
                    (click)="setRadius(preset.value)">
              {{ preset.label }}
            </button>
          </div>
          <div class="layer-toggles">
            <button class="layer-toggle" [class.off]="!showMarkers" (click)="toggleMarkers()">
              <mat-icon [style.opacity]="showMarkers ? 1 : 0.4">place</mat-icon>
              <span>Markers</span>
            </button>
            <button class="layer-toggle" [class.off]="!showCircle" (click)="toggleCircle()">
              <mat-icon [style.opacity]="showCircle ? 1 : 0.4">radio_button_unchecked</mat-icon>
              <span>Radius</span>
            </button>
          </div>
          </div>
        </div>

        <div #mapContainer class="mini-map-canvas" [style.height]="isExpanded ? '400px' : '220px'"></div>

        <!-- Places count badge -->
        <div class="mini-map-places-badge" *ngIf="showPlaces && nearbyPlaces.length > 0">
          <mat-icon style="font-size:12px;width:12px;height:12px">place</mat-icon>
          {{ nearbyPlaces.length }} places nearby
        </div>

        <div class="mini-map-footer" *ngIf="userLocation">
          <mat-icon style="font-size:12px;width:12px;height:12px;color:var(--primary)">circle</mat-icon>
          <span>{{ userLocation.lat.toFixed(4) }}, {{ userLocation.lng.toFixed(4) }}</span>
          <span class="shortcut-hint" *ngIf="isExpanded">
            <kbd>M</kbd> map &nbsp; <kbd>F</kbd> expand &nbsp; <kbd>R</kbd> reset &nbsp; <kbd>Ctrl++/-</kbd> zoom
          </span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .mini-map-container {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 1000;
      transition: all 0.3s ease;
    }

    .mini-map-toggle {
      background: linear-gradient(135deg, #1e4b47, #2f6a63) !important;
      color: #fff !important;
      box-shadow: 0 4px 16px rgba(30, 75, 71, 0.4) !important;
      animation: miniMapPulse 3s ease-in-out infinite;
    }

    @keyframes miniMapPulse {
      0%, 100% { box-shadow: 0 4px 16px rgba(30, 75, 71, 0.4); }
      50% { box-shadow: 0 4px 24px rgba(30, 75, 71, 0.6); }
    }

    .mini-map-panel {
      background: #fff;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
      overflow: hidden;
      width: 320px;
      transition: width 0.3s ease, height 0.3s ease;
      animation: slideUp 0.3s ease;
    }

    .expanded .mini-map-panel {
      width: 480px;
    }

    @keyframes slideUp {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .drag-handle {
      cursor: grab;
      user-select: none;
      -webkit-user-select: none;
    }

    .drag-handle:active {
      cursor: grabbing;
    }

    .mini-map-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 12px;
      background: linear-gradient(135deg, #1e4b47, #2f6a63);
      color: #fff;
    }

    .mini-map-title {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.85rem;
      font-weight: 600;
    }

    .mini-map-actions {
      display: flex;
      gap: 0;
    }

    .mini-map-btn {
      color: #fff !important;
      width: 32px !important;
      height: 32px !important;
      line-height: 32px !important;
    }

    .mini-map-btn mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .reset-btn {
      animation: resetSpin 0.3s ease;
    }

    @keyframes resetSpin {
      from { transform: rotate(0deg); }
      to { transform: rotate(-360deg); }
    }

    .mini-map-canvas {
      width: 100%;
      transition: height 0.3s ease;
    }

    .mini-map-controls {
      background: #faf8f5;
      border-bottom: 1px solid #e8e4de;
    }

    .mini-map-categories {
      display: flex;
      gap: 6px;
      padding: 10px 12px;
      overflow-x: auto;
    }

    .mini-map-categories::-webkit-scrollbar {
      height: 0;
    }

    .category-chip {
      flex-shrink: 0;
      font-size: 0.72rem !important;
      padding: 0 10px !important;
      height: 28px !important;
      line-height: 28px !important;
      border-radius: 14px !important;
      border: 1px solid #e0dbd4 !important;
      color: #5c5046 !important;
      background: #fff !important;
    }

    .category-chip.active {
      background: #1e4b47 !important;
      color: #fff !important;
      border-color: #1e4b47 !important;
    }

    .radius-control {
      padding: 6px 12px 10px;
    }

    .radius-label {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 0.72rem;
      color: #5c5046;
      margin-bottom: 6px;
      font-weight: 600;
    }

    .radius-slider {
      width: 100%;
      height: 4px;
      -webkit-appearance: none;
      appearance: none;
      background: #e0dbd4;
      border-radius: 2px;
      outline: none;
    }

    .radius-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: #1e4b47;
      cursor: pointer;
      border: 2px solid #fff;
      box-shadow: 0 1px 4px rgba(0,0,0,0.2);
    }

    .radius-slider::-moz-range-thumb {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: #1e4b47;
      cursor: pointer;
      border: 2px solid #fff;
      box-shadow: 0 1px 4px rgba(0,0,0,0.2);
    }

    .radius-presets {
      display: flex;
      gap: 4px;
      margin-top: 6px;
    }

    .radius-preset {
      flex: 1;
      font-size: 0.65rem;
      padding: 3px 0;
      border: 1px solid #e0dbd4;
      border-radius: 10px;
      background: #fff;
      color: #5c5046;
      cursor: pointer;
      transition: all 0.2s;
    }

    .radius-preset:hover {
      border-color: #1e4b47;
      color: #1e4b47;
    }

    .radius-preset.active {
      background: #1e4b47;
      color: #fff;
      border-color: #1e4b47;
    }

    .layer-toggles {
      display: flex;
      gap: 8px;
      padding: 0 12px 10px;
    }

    .layer-toggle {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 0.7rem;
      padding: 4px 10px;
      border-radius: 12px;
      border: 1px solid #1e4b47;
      background: #1e4b47;
      color: #fff;
      cursor: pointer;
      transition: all 0.2s;
    }

    .layer-toggle mat-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
    }

    .layer-toggle.off {
      background: #fff;
      color: #a09486;
      border-color: #e0dbd4;
    }

    .mini-map-places-badge {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px 12px;
      font-size: 0.7rem;
      font-weight: 600;
      color: #1e4b47;
      background: #dcfce7;
      border-top: 1px solid #c8e6e2;
    }

    .mini-map-footer {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      font-size: 0.72rem;
      color: #7a6e63;
      background: #faf8f5;
      border-top: 1px solid #e8e4de;
    }

    .shortcut-hint {
      margin-left: auto;
      font-size: 0.6rem;
      color: #a09486;
    }

    .shortcut-hint kbd {
      display: inline-block;
      padding: 1px 4px;
      font-size: 0.58rem;
      font-family: monospace;
      background: #e8e4de;
      border-radius: 3px;
      border: 1px solid #d4cfc8;
    }
  `]
})
export class MiniMapComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapContainer') mapContainer!: ElementRef;
  @Input() center?: MapLocation;
  @Input() zoom: number = 14;
  @Output() locationClick = new EventEmitter<MapLocation>();

  private mapsService = inject(GoogleMapsService);

  isMinimized = false;
  isExpanded = false;
  showPlaces = true;
  userLocation: MapLocation | null = null;
  activeCategory = 0;
  searchRadius = 3000;
  nearbyPlaces: NearbyPlace[] = [];
  showMarkers = true;
  showCircle = true;
  private map: any = null;
  private userMarker: any = null;
  private placeMarkers: any[] = [];
  private radiusCircle: any = null;
  private infoWindow: any = null;

  // Drag state
  dragPos: { top: number | null; right: number } = { top: null, right: 24 };
  private readonly defaultPos = { top: null, right: 24 };
  isPositionChanged = false;
  private boundKeyDown: ((e: KeyboardEvent) => void) | null = null;
  private isDragging = false;
  private dragStartX = 0;
  private dragStartY = 0;
  private dragOffsetX = 0;
  private dragOffsetY = 0;
  private boundMouseMove: ((e: MouseEvent) => void) | null = null;
  private boundMouseUp: ((e: MouseEvent) => void) | null = null;
  private boundTouchMove: ((e: TouchEvent) => void) | null = null;
  private boundTouchEnd: ((e: TouchEvent) => void) | null = null;

  radiusPresets = [
    { label: '500m', value: 500 },
    { label: '1km', value: 1000 },
    { label: '3km', value: 3000 },
    { label: '5km', value: 5000 },
    { label: '10km', value: 10000 },
  ];

  categories = [
    { label: 'Food', icon: '🍽️', placeType: 'restaurant', color: '#e65100' },
    { label: 'Hotels', icon: '🏨', placeType: 'lodging', color: '#1565c0' },
    { label: 'Cafes', icon: '☕', placeType: 'cafe', color: '#4e342e' },
    { label: 'Shops', icon: '🛍️', placeType: 'shopping_mall', color: '#6a1b9a' },
    { label: 'Attractions', icon: '🎭', placeType: 'tourist_attraction', color: '#2e7d32' },
  ];

  ngOnInit() {
    const stored = localStorage.getItem('travelsphere_location_enabled');
    const lat = localStorage.getItem('travelsphere_lat');
    const lng = localStorage.getItem('travelsphere_lng');

    if (stored === 'true' && lat && lng) {
      this.userLocation = { lat: parseFloat(lat), lng: parseFloat(lng) };
    }

    // Restore saved position and radius
    this.loadSavedPosition();
    this.loadSavedRadius();

    // Register keyboard shortcuts
    this.boundKeyDown = this.onKeyDown.bind(this);
    document.addEventListener('keydown', this.boundKeyDown);
  }

  async ngAfterViewInit() {
    await this.mapsService.load();
    this.initMap();
  }

  private initMap() {
    if (!this.mapContainer || !this.mapsService.isAvailable()) return;

    const center = this.center || this.userLocation || { lat: 20.5937, lng: 78.9629 };

    this.map = this.mapsService.createMap(this.mapContainer.nativeElement, {
      center: { lat: center.lat, lng: center.lng },
      zoom: this.zoom,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });

    if (this.userLocation) {
      this.addUserMarker(this.userLocation);
    }

    // Try to get live location
    this.trackLocation();
  }

  private trackLocation() {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc: MapLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        this.userLocation = loc;
        localStorage.setItem('travelsphere_lat', String(loc.lat));
        localStorage.setItem('travelsphere_lng', String(loc.lng));
        this.addUserMarker(loc);
        if (this.map) this.map.panTo({ lat: loc.lat, lng: loc.lng });
      },
      () => {},
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  private addUserMarker(location: MapLocation) {
    if (!this.map) return;

    if (this.userMarker) {
      this.userMarker.setMap(null);
    }

    this.userMarker = this.mapsService.createMarker(this.map, location, {
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: '#3b82f6',
        fillOpacity: 1,
        strokeColor: '#fff',
        strokeWeight: 3,
      },
      title: 'You are here',
    });
  }

  toggle() {
    this.isMinimized = !this.isMinimized;
    if (!this.isMinimized) {
      setTimeout(() => this.initMap(), 100);
    }
  }

  toggleExpand() {
    this.isExpanded = !this.isExpanded;
    if (this.map) {
      setTimeout(() => {
        google.maps.event.trigger(this.map, 'resize');
        if (this.isExpanded && this.showPlaces && this.userLocation) {
          this.loadNearbyPlaces();
        }
      }, 300);
    }
  }

  selectCategory(index: number) {
    this.activeCategory = index;
    if (this.userLocation && this.map) {
      this.loadNearbyPlaces();
    }
  }

  private async loadNearbyPlaces() {
    if (!this.userLocation || !this.map) return;

    this.clearPlaceMarkers();

    const cat = this.categories[this.activeCategory];
    this.nearbyPlaces = await this.mapsService.searchNearby(
      this.map,
      this.userLocation,
      cat.placeType,
      this.searchRadius
    );

    this.updateMarkersVisibility();
    this.updateCircleVisibility();
  }

  private drawRadiusCircle() {
    if (!this.map || !this.userLocation) return;

    // Remove existing circle
    if (this.radiusCircle) {
      this.radiusCircle.setMap(null);
    }

    this.radiusCircle = new google.maps.Circle({
      strokeColor: '#1e4b47',
      strokeOpacity: 0.4,
      strokeWeight: 2,
      fillColor: '#1e4b47',
      fillOpacity: 0.08,
      map: this.showCircle ? this.map : null,
      center: { lat: this.userLocation.lat, lng: this.userLocation.lng },
      radius: this.searchRadius,
    });
  }

  toggleMarkers() {
    this.showMarkers = !this.showMarkers;
    this.updateMarkersVisibility();
  }

  toggleCircle() {
    this.showCircle = !this.showCircle;
    this.updateCircleVisibility();
  }

  private updateMarkersVisibility() {
    const mapInstance = this.showMarkers ? this.map : null;
    this.placeMarkers.forEach(m => m?.setMap(mapInstance));
  }

  private updateCircleVisibility() {
    if (this.radiusCircle) {
      this.radiusCircle.setMap(this.showCircle ? this.map : null);
    } else if (this.showCircle && this.userLocation) {
      this.drawRadiusCircle();
    }
  }

  onRadiusChange(value: number) {
    this.searchRadius = value;
    this.saveRadius();
    if (this.userLocation && this.map) {
      this.loadNearbyPlaces();
    }
  }

  setRadius(value: number) {
    this.searchRadius = value;
    this.saveRadius();
    if (this.userLocation && this.map) {
      this.loadNearbyPlaces();
    }
  }

  private loadSavedRadius() {
    try {
      const saved = localStorage.getItem('minimap_radius');
      if (saved) {
        const radius = parseInt(saved, 10);
        if (!isNaN(radius) && radius >= 500 && radius <= 10000) {
          this.searchRadius = radius;
        }
      }
    } catch {
      // Ignore corrupted localStorage data
    }
  }

  private saveRadius() {
    localStorage.setItem('minimap_radius', String(this.searchRadius));
  }

  formatRadius(meters: number): string {
    return meters >= 1000 ? `${(meters / 1000).toFixed(meters % 1000 === 0 ? 0 : 1)} km` : `${meters} m`;
  }

  private addPlaceMarkers() {
    if (!this.map || !this.nearbyPlaces.length) return;

    this.infoWindow = this.mapsService.createInfoWindow('');

    // Always draw the circle
    this.drawRadiusCircle();

    const category = this.categories[this.activeCategory];

    this.nearbyPlaces.forEach((place) => {
      const markerHtml = `
        <div style="
          width:28px;height:28px;border-radius:50%;
          background:${category.color};
          color:#fff;display:flex;align-items:center;justify-content:center;
          font-size:13px;border:2px solid #fff;
          box-shadow:0 2px 8px rgba(0,0,0,0.3);cursor:pointer;
          transition:transform 0.2s;
        " onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'">
          ${category.icon}
        </div>
      `;

      const marker = this.mapsService.createAdvancedMarker(this.map, place, markerHtml);

      if (marker) {
        google.maps.event.addListener(marker, 'click', () => {
          const rating = place.rating > 0 ? `⭐ ${place.rating.toFixed(1)}` : '';
          const distance = place.distance ? `📍 ${place.distance}` : '';
          const openStatus = place.openNow
            ? '<span style="color:#16a34a;font-weight:600">Open</span>'
            : '<span style="color:#dc2626;font-weight:600">Closed</span>';
          const price = place.priceLevel ? '$'.repeat(place.priceLevel) : '';

          this.infoWindow.setContent(`
            <div style="padding:10px;max-width:220px;font-family:system-ui">
              <div style="font-size:1.1rem;margin-bottom:6px">${category.icon} ${place.name}</div>
              <div style="font-size:0.8rem;color:#666;margin-bottom:6px">${place.address}</div>
              <div style="display:flex;gap:12px;font-size:0.78rem">
                <span>${rating}</span>
                <span>${distance}</span>
                <span>${price}</span>
                ${openStatus}
              </div>
              <a href="https://www.google.com/maps/place/?place_id=${place.placeId}" target="_blank"
                 style="display:inline-block;margin-top:8px;font-size:0.78rem;color:#1e4b47;font-weight:600;text-decoration:none">
                View on Google Maps →
              </a>
            </div>
          `);
          this.infoWindow.open(this.map, marker);
        });
      }

      this.placeMarkers.push(marker);
    });

    // Apply visibility after adding
    this.updateMarkersVisibility();
  }

  private clearPlaceMarkers() {
    this.placeMarkers.forEach(m => m?.setMap(null));
    this.placeMarkers = [];
    this.nearbyPlaces = [];
  }

  centerOnUser() {
    if (this.userLocation && this.map) {
      this.map.panTo({ lat: this.userLocation.lat, lng: this.userLocation.lng });
      this.map.setZoom(16);
    } else {
      this.trackLocation();
    }
  }

  // ── Keyboard Shortcuts ──

  private onKeyDown(event: KeyboardEvent) {
    // Ignore if user is typing in an input field
    const tag = (event.target as HTMLElement).tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

    const key = event.key.toLowerCase();

    // R — Reset position
    if (key === 'r' && !event.ctrlKey && !event.metaKey) {
      if (this.isPositionChanged) {
        this.resetPosition();
        event.preventDefault();
      }
    }

    // + / = — Zoom in
    if ((key === '+' || key === '=') && (event.ctrlKey || event.metaKey)) {
      this.zoomIn();
      event.preventDefault();
    }

    // - — Zoom out
    if (key === '-' && (event.ctrlKey || event.metaKey)) {
      this.zoomOut();
      event.preventDefault();
    }

    // M — Toggle mini-map
    if (key === 'm' && !event.ctrlKey && !event.metaKey) {
      this.toggle();
      event.preventDefault();
    }

    // F — Toggle expand
    if (key === 'f' && !event.ctrlKey && !event.metaKey && !this.isMinimized) {
      this.toggleExpand();
      event.preventDefault();
    }

    // 1-5 — Select category
    if (['1', '2', '3', '4', '5'].includes(key) && !event.ctrlKey && !event.metaKey && this.isExpanded) {
      const index = parseInt(key, 10) - 1;
      if (index < this.categories.length) {
        this.selectCategory(index);
        event.preventDefault();
      }
    }
  }

  zoomIn() {
    if (this.map) {
      const currentZoom = this.map.getZoom();
      this.map.setZoom(Math.min(currentZoom + 1, 21));
    }
  }

  zoomOut() {
    if (this.map) {
      const currentZoom = this.map.getZoom();
      this.map.setZoom(Math.max(currentZoom - 1, 1));
    }
  }

  // ── Drag Logic ──

  private loadSavedPosition() {
    try {
      const saved = localStorage.getItem('minimap_position');
      if (saved) {
        const pos = JSON.parse(saved);
        if (typeof pos.top === 'number' && typeof pos.right === 'number') {
          this.dragPos = pos;
        }
      }
    } catch {
      // Ignore corrupted localStorage data
    }
  }

  private savePosition() {
    localStorage.setItem('minimap_position', JSON.stringify(this.dragPos));
    this.isPositionChanged = this.dragPos.top !== this.defaultPos.top || this.dragPos.right !== this.defaultPos.right;
  }

  resetPosition() {
    this.dragPos = { ...this.defaultPos };
    localStorage.removeItem('minimap_position');
    this.isPositionChanged = false;
  }

  startDrag(event: MouseEvent | TouchEvent) {
    // Don't drag if clicking on an action button
    const target = event.target as HTMLElement;
    if (target.closest('.mini-map-actions') || target.closest('button')) return;

    event.preventDefault();
    this.isDragging = true;

    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;

    // Calculate offset from the panel top-right corner
    const panel = (event.currentTarget as HTMLElement).closest('.mini-map-panel') as HTMLElement;
    const rect = panel.getBoundingClientRect();

    this.dragOffsetX = window.innerWidth - rect.right - clientX;
    this.dragOffsetY = clientY - rect.top;
    this.dragStartX = clientX;
    this.dragStartY = clientY;

    // Bind move/end handlers
    this.boundMouseMove = (e: MouseEvent) => this.onDrag(e.clientX, e.clientY);
    this.boundMouseUp = () => this.endDrag();
    this.boundTouchMove = (e: TouchEvent) => this.onDrag(e.touches[0].clientX, e.touches[0].clientY);
    this.boundTouchEnd = () => this.endDrag();

    document.addEventListener('mousemove', this.boundMouseMove);
    document.addEventListener('mouseup', this.boundMouseUp);
    document.addEventListener('touchmove', this.boundTouchMove, { passive: false });
    document.addEventListener('touchend', this.boundTouchEnd);
  }

  private onDrag(clientX: number, clientY: number) {
    if (!this.isDragging) return;

    const newRight = window.innerWidth - clientX - this.dragOffsetX;
    const newTop = clientY - this.dragOffsetY;

    // Clamp within viewport
    const maxRight = window.innerWidth - 40;
    const maxTop = window.innerHeight - 40;

    this.dragPos = {
      top: Math.max(0, Math.min(newTop, maxTop)),
      right: Math.max(0, Math.min(newRight, maxRight)),
    };
  }

  private endDrag() {
    this.isDragging = false;

    // Snap to nearest edge
    this.snapToEdge();

    // Save position
    this.savePosition();

    // Clean up
    if (this.boundMouseMove) document.removeEventListener('mousemove', this.boundMouseMove);
    if (this.boundMouseUp) document.removeEventListener('mouseup', this.boundMouseUp);
    if (this.boundTouchMove) document.removeEventListener('touchmove', this.boundTouchMove);
    if (this.boundTouchEnd) document.removeEventListener('touchend', this.boundTouchEnd);
    this.boundMouseMove = null;
    this.boundMouseUp = null;
    this.boundTouchMove = null;
    this.boundTouchEnd = null;
  }

  private snapToEdge() {
    const threshold = 60;
    const panelWidth = this.isExpanded ? 480 : 320;

    // Snap horizontally to left or right edge
    if (this.dragPos.right > window.innerWidth / 2) {
      this.dragPos.right = window.innerWidth - 24; // snap left
    } else if (this.dragPos.right < window.innerWidth - panelWidth - 24) {
      this.dragPos.right = 24; // snap right
    }

    // Snap vertically to top, center, or bottom
    if (this.dragPos.top! < threshold) {
      this.dragPos.top = 16; // snap top
    } else if (this.dragPos.top! > window.innerHeight - threshold) {
      this.dragPos.top = window.innerHeight - 80; // snap bottom
    }
  }

  ngOnDestroy() {
    this.clearPlaceMarkers();
    if (this.radiusCircle) {
      this.radiusCircle.setMap(null);
    }
    if (this.boundMouseMove) document.removeEventListener('mousemove', this.boundMouseMove);
    if (this.boundMouseUp) document.removeEventListener('mouseup', this.boundMouseUp);
    if (this.boundTouchMove) document.removeEventListener('touchmove', this.boundTouchMove);
    if (this.boundTouchEnd) document.removeEventListener('touchend', this.boundTouchEnd);
    if (this.boundKeyDown) document.removeEventListener('keydown', this.boundKeyDown);
  }
}
