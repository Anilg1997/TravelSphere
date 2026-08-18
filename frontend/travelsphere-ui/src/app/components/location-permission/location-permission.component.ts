import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-location-permission',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatCardModule, NgIf],
  template: `
    <div class="loc-overlay" *ngIf="visible">
      <div class="loc-card">
        <div class="loc-icon-wrap">
          <div class="loc-pulse"></div>
          <mat-icon class="loc-icon">my_location</mat-icon>
        </div>

        <h2 class="loc-title">Enable Location Services</h2>
        <p class="loc-desc">
          TravelSphere needs your location to find the <strong>best nearby deals</strong>,
          suggest <strong>local transport</strong>, and plan
          <strong>door-to-door trips</strong> starting from your home.
        </p>

        <div class="loc-features">
          <div class="loc-feature">
            <mat-icon>directions</mat-icon>
            <span>Auto-detect your departure point</span>
          </div>
          <div class="loc-feature">
            <mat-icon>restaurant</mat-icon>
            <span>Find restaurants near your route</span>
          </div>
          <div class="loc-feature">
            <mat-icon>local_taxi</mat-icon>
            <span>Suggest nearest transport options</span>
          </div>
          <div class="loc-feature">
            <mat-icon>map</mat-icon>
            <span>Live journey tracking on map</span>
          </div>
        </div>

        <div class="loc-actions">
          <button mat-raised-button color="primary" class="cta-button loc-btn-primary" (click)="allowLocation()">
            <mat-icon>gps_fixed</mat-icon> Enable Location
          </button>
          <button mat-stroked-button class="loc-btn-skip" (click)="skip()">
            Skip for now
          </button>
        </div>

        <p class="loc-note">
          <mat-icon style="font-size:14px;width:14px;height:14px">lock</mat-icon>
          Your location is only used during your trip and is never shared with third parties.
        </p>
      </div>
    </div>
  `,
  styles: [`
    .loc-overlay {
      position: fixed; inset: 0; z-index: 2000;
      background: rgba(15, 28, 26, 0.82);
      backdrop-filter: blur(12px);
      display: flex; align-items: center; justify-content: center;
      padding: 24px;
      animation: locFadeIn 0.35s ease;
    }
    @keyframes locFadeIn { from { opacity: 0; } to { opacity: 1; } }

    .loc-card {
      background: #fffdf9;
      border-radius: 28px;
      max-width: 460px; width: 100%;
      padding: 44px 36px 36px;
      text-align: center;
      box-shadow: 0 40px 100px rgba(10, 8, 6, 0.35);
      animation: locSlideUp 0.4s ease;
    }
    @keyframes locSlideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

    .loc-icon-wrap {
      position: relative;
      width: 88px; height: 88px;
      margin: 0 auto 24px;
      display: flex; align-items: center; justify-content: center;
    }
    .loc-pulse {
      position: absolute; inset: 0;
      border-radius: 50%;
      border: 2px solid var(--teal, #1e4b47);
      animation: locPulse 2s ease-out infinite;
    }
    @keyframes locPulse {
      0% { transform: scale(0.8); opacity: 1; }
      70%, 100% { transform: scale(1.5); opacity: 0; }
    }
    .loc-icon {
      font-size: 42px; width: 42px; height: 42px;
      color: var(--teal, #1e4b47);
    }

    .loc-title {
      font-family: var(--serif, 'Fraunces', Georgia, serif);
      font-weight: 600;
      font-size: 1.6rem;
      color: #2b2420;
      margin: 0 0 12px;
    }
    .loc-desc {
      color: #5c5046;
      font-size: 0.95rem;
      line-height: 1.6;
      margin: 0 0 28px;
    }

    .loc-features {
      display: flex; flex-direction: column; gap: 12px;
      margin-bottom: 32px;
      text-align: left;
    }
    .loc-feature {
      display: flex; align-items: center; gap: 12px;
      padding: 10px 14px;
      background: #f4f1ec;
      border-radius: 12px;
      font-size: 0.88rem;
      color: #3d3429;
    }
    .loc-feature mat-icon {
      color: var(--teal, #1e4b47);
      font-size: 20px; width: 20px; height: 20px;
    }

    .loc-actions {
      display: flex; flex-direction: column; gap: 12px;
    }
    .loc-btn-primary {
      height: 48px; font-size: 1rem; font-weight: 600;
      border-radius: 14px;
    }
    .loc-btn-skip {
      height: 42px; font-size: 0.88rem;
      border-radius: 12px;
      color: #7a6e63;
    }

    .loc-note {
      display: flex; align-items: center; justify-content: center; gap: 4px;
      margin-top: 20px;
      font-size: 0.75rem;
      color: #a09486;
    }

    @media (max-width: 480px) {
      .loc-card { padding: 32px 20px 28px; }
      .loc-title { font-size: 1.35rem; }
    }
  `]
})
export class LocationPermissionComponent {
  private router = inject(Router);
  visible = true;

  allowLocation() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          localStorage.setItem('travelsphere_lat', String(pos.coords.latitude));
          localStorage.setItem('travelsphere_lng', String(pos.coords.longitude));
          localStorage.setItem('travelsphere_location_enabled', 'true');
          this.visible = false;
          this.router.navigate(['/home']);
        },
        () => {
          // User denied — still proceed
          localStorage.setItem('travelsphere_location_enabled', 'false');
          this.visible = false;
          this.router.navigate(['/home']);
        }
      );
    } else {
      localStorage.setItem('travelsphere_location_enabled', 'false');
      this.visible = false;
      this.router.navigate(['/home']);
    }
  }

  skip() {
    localStorage.setItem('travelsphere_location_enabled', 'false');
    this.visible = false;
    this.router.navigate(['/home']);
  }
}
