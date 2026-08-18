import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

declare var google: any;

export interface MapLocation {
  lat: number;
  lng: number;
  label?: string;
}

export interface MapStop {
  id: number;
  name: string;
  lat: number;
  lng: number;
  status: 'completed' | 'current' | 'upcoming';
  icon: string;
  description?: string;
  type: string;
}

export interface NearbyPlace {
  name: string;
  address: string;
  rating: number;
  totalRatings: number;
  priceLevel: number;
  openNow: boolean;
  types: string[];
  distance: string;
  duration: string;
  lat: number;
  lng: number;
  photoUrl?: string;
  placeId: string;
}

@Injectable({ providedIn: 'root' })
export class GoogleMapsService {
  private mapsLoaded = false;
  private loadPromise: Promise<void> | null = null;

  /**
   * Dynamically load the Google Maps JavaScript API
   */
  load(): Promise<void> {
    if (this.mapsLoaded) return Promise.resolve();
    if (this.loadPromise) return this.loadPromise;

    this.loadPromise = new Promise((resolve, reject) => {
      const apiKey = environment.googleMapsApiKey;

      // If no API key, use a fallback demo mode
      if (!apiKey) {
        console.warn('Google Maps API key not set — using demo mode');
        this.mapsLoaded = true;
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry&callback=__googleMapsCallback`;
      script.async = true;
      script.defer = true;

      (window as any).__googleMapsCallback = () => {
        this.mapsLoaded = true;
        resolve();
      };

      script.onerror = (error) => {
        console.error('Failed to load Google Maps API:', error);
        this.mapsLoaded = true; // Continue in demo mode
        resolve();
      };

      document.head.appendChild(script);
    });

    return this.loadPromise;
  }

  /**
   * Check if Google Maps is available
   */
  isAvailable(): boolean {
    return typeof google !== 'undefined' && google.maps;
  }

  /**
   * Create a map instance
   */
  createMap(element: HTMLElement, options: google.maps.MapOptions = {}): any {
    if (!this.isAvailable()) return null;

    const defaultOptions: google.maps.MapOptions = {
      center: { lat: 20.5937, lng: 78.9629 }, // India center
      zoom: 12,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
      zoomControl: true,
      styles: this.getCustomMapStyle(),
      ...options,
    };

    return new google.maps.Map(element, defaultOptions);
  }

  /**
   * Create a marker on the map
   */
  createMarker(map: any, position: MapLocation, options: any = {}): any {
    if (!this.isAvailable()) return null;

    return new google.maps.Marker({
      position: { lat: position.lat, lng: position.lng },
      map,
      title: position.label || '',
      animation: google.maps.Animation.DROP,
      ...options,
    });
  }

  /**
   * Create an advanced marker with custom HTML (for status indicators)
   */
  createAdvancedMarker(map: any, position: MapLocation, html: string, options: any = {}): any {
    if (!this.isAvailable()) return null;

    const marker = new google.maps.marker.AdvancedMarkerElement({
      position: { lat: position.lat, lng: position.lng },
      map,
      content: this.createMarkerContent(html),
      ...options,
    });

    return marker;
  }

  /**
   * Create custom marker HTML content
   */
  createMarkerContent(html: string): HTMLElement {
    const div = document.createElement('div');
    div.innerHTML = html;
    div.style.cursor = 'pointer';
    return div;
  }

  /**
   * Draw a polyline route on the map
   */
  drawRoute(map: any, path: MapLocation[], options: any = {}): any {
    if (!this.isAvailable()) return null;

    const pathCoords = path.map(p => ({ lat: p.lat, lng: p.lng }));

    const polyline = new google.maps.Polyline({
      path: pathCoords,
      geodesic: true,
      strokeColor: options.strokeColor || '#1e4b47',
      strokeOpacity: options.strokeOpacity || 0.9,
      strokeWeight: options.strokeWeight || 4,
      map,
      ...options,
    });

    return polyline;
  }

  /**
   * Draw a dashed route for upcoming segments
   */
  drawDashedRoute(map: any, path: MapLocation[], options: any = {}): any {
    if (!this.isAvailable()) return null;

    const pathCoords = path.map(p => ({ lat: p.lat, lng: p.lng }));

    return new google.maps.Polyline({
      path: pathCoords,
      geodesic: true,
      strokeColor: options.strokeColor || '#a09486',
      strokeOpacity: 0.5,
      strokeWeight: 3,
      icons: [{
        icon: { path: 'M 0,-1 0,1', strokeOpacity: 1, strokeWeight: 2, strokeColor: '#a09486' },
        offset: '0',
        repeat: '10px',
      }],
      map,
    });
  }

  /**
   * Create an info window
   */
  createInfoWindow(content: string): any {
    if (!this.isAvailable()) return null;

    return new google.maps.InfoWindow({ content });
  }

  /**
   * Fit map to show all markers
   */
  fitBounds(map: any, locations: MapLocation[]): void {
    if (!this.isAvailable() || locations.length === 0) return;

    const bounds = new google.maps.LatLngBounds();
    locations.forEach(loc => bounds.extend({ lat: loc.lat, lng: loc.lng }));
    map.fitBounds(bounds, { padding: 60 });
  }

  /**
   * Search nearby places (restaurants, etc.)
   */
  searchNearby(
    map: any,
    location: MapLocation,
    type: string = 'restaurant',
    radius: number = 5000
  ): Promise<NearbyPlace[]> {
    return new Promise((resolve) => {
      if (!this.isAvailable()) {
        resolve(this.getFallbackPlaces(location));
        return;
      }

      const service = new google.maps.places.PlacesService(map);
      const request: google.maps.places.PlaceSearchRequest = {
        location: { lat: location.lat, lng: location.lng },
        radius,
        type,
        rankBy: google.maps.places.RankBy.PROMINENCE,
      };

      service.nearbySearch(request, (results: any[], status: any) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          const places: NearbyPlace[] = results.slice(0, 8).map((place: any) => ({
            name: place.name,
            address: place.vicinity || '',
            rating: place.rating || 0,
            totalRatings: place.user_ratings_total || 0,
            priceLevel: place.price_level || 0,
            openNow: place.opening_hours?.open_now ?? false,
            types: place.types || [],
            distance: '',
            duration: '',
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
            photoUrl: place.photos?.[0]?.getUrl({ maxWidth: 300, maxHeight: 200 }),
            placeId: place.place_id,
          }));

          // Calculate distances
          const currentLoc = new google.maps.LatLng(location.lat, location.lng);
          places.forEach(place => {
            const placeLoc = new google.maps.LatLng(place.lat, place.lng);
            const distMeters = google.maps.geometry.spherical.computeDistanceBetween(currentLoc, placeLoc);
            place.distance = distMeters > 1000
              ? `${(distMeters / 1000).toFixed(1)} km`
              : `${Math.round(distMeters)} m`;
          });

          resolve(places);
        } else {
          resolve(this.getFallbackPlaces(location));
        }
      });
    });
  }

  /**
   * Get directions between two points
   */
  getDirections(origin: MapLocation, destination: MapLocation, travelMode: string = 'DRIVING'): Promise<any> {
    return new Promise((resolve) => {
      if (!this.isAvailable()) {
        resolve(null);
        return;
      }

      const directionsService = new google.maps.DirectionsService();
      directionsService.route(
        {
          origin: { lat: origin.lat, lng: origin.lng },
          destination: { lat: destination.lat, lng: destination.lng },
          travelMode: google.maps.TravelMode[travelMode] || google.maps.TravelMode.DRIVING,
          drivingOptions: {
            departureTime: new Date(),
            trafficModel: google.maps.TrafficModel.BEST_GUESS,
          },
        },
        (result: any, status: any) => {
          if (status === 'OK') {
            resolve(result);
          } else {
            resolve(null);
          }
        }
      );
    });
  }

  /**
   * Watch user's real-time geolocation
   */
  watchPosition(callback: (position: GeolocationPosition) => void, errorCallback?: (error: GeolocationPositionError) => void): number {
    if (!navigator.geolocation) {
      console.warn('Geolocation not supported');
      return -1;
    }

    return navigator.geolocation.watchPosition(
      callback,
      errorCallback || (() => {}),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    );
  }

  /**
   * Stop watching position
   */
  clearWatch(watchId: number): void {
    if (watchId >= 0) {
      navigator.geolocation.clearWatch(watchId);
    }
  }

  /**
   * Calculate distance between two points (Haversine)
   */
  calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    if (this.isAvailable()) {
      const p1 = new google.maps.LatLng(lat1, lng1);
      const p2 = new google.maps.LatLng(lat2, lng2);
      return google.maps.geometry.spherical.computeDistanceBetween(p1, p2);
    }

    // Fallback Haversine formula
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  /**
   * Fallback places when Google API is unavailable
   */
  private getFallbackPlaces(location: MapLocation): NearbyPlace[] {
    return [
      { name: 'Hotel Restaurant', address: 'Nearby', rating: 4.2, totalRatings: 120, priceLevel: 2, openNow: true, types: ['restaurant'], distance: '0.5 km', duration: '5 min', lat: location.lat + 0.005, lng: location.lng + 0.003, placeId: 'demo1' },
      { name: 'Local Dhaba', address: 'Highway side', rating: 4.0, totalRatings: 85, priceLevel: 1, openNow: true, types: ['restaurant'], distance: '1.2 km', duration: '8 min', lat: location.lat + 0.01, lng: location.lng - 0.005, placeId: 'demo2' },
      { name: 'Coffee House', address: 'City center', rating: 4.5, totalRatings: 200, priceLevel: 2, openNow: true, types: ['cafe'], distance: '2.0 km', duration: '12 min', lat: location.lat - 0.008, lng: location.lng + 0.01, placeId: 'demo3' },
    ];
  }

  /**
   * Custom map styling (TravelSphere brand theme)
   */
  private getCustomMapStyle(): any[] {
    return [
      { elementType: 'geometry', stylers: [{ color: '#e8f0ee' }] },
      { elementType: 'labels.text.fill', stylers: [{ color: '#5c5046' }] },
      { elementType: 'labels.text.stroke', stylers: [{ color: '#faf8f5' }] },
      { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#c8e6e2' }] },
      { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
      { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#7a6e63' }] },
      { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#1e4b47' }] },
      { featureType: 'transit', elementType: 'labels.text.fill', stylers: [{ color: '#7c3aed' }] },
      { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#f4f1ec' }] },
    ];
  }
}
