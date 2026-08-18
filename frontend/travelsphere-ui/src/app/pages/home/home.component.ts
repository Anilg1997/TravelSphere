import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { NgFor } from '@angular/common';
import { VideoSectionComponent } from './video-section.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule, MatCardModule, NgFor, VideoSectionComponent],
  template: `
    <!-- ═══════════════ Hero — full-bleed destination photography ═══════════════ -->
    <section class="voy-hero">
      <div class="voy-slides">
        <div *ngFor="let slide of heroSlides; let i = index"
             class="voy-slide" [class.active]="i === activeSlide"
             [style.background-image]="'url(' + slide.url + ')'"></div>
        <div class="voy-scrim"></div>
      </div>

      <div class="voy-hero-inner">
        <p class="voy-eyebrow"><span class="voy-dot"></span> AI travel agent · door-to-door planning</p>
        <h1 class="voy-title">Your whole trip.<br /><em>One conversation.</em></h1>
        <p class="voy-sub">
          From your doorstep to the destination and back home again — flights, stays, local rides,
          activities and insurance. TravelSphere plans it, books it, and puts it on your calendar.
        </p>

        <!-- Floating chat-first card over the hero photography -->
        <div class="voy-card">
          <div class="voy-card-head">
            <span class="voy-avatar">🤖</span>
            <div class="voy-card-copy">
              <strong>Plan with the TravelSphere AI</strong>
              <span>Destination · days · budget — in one sentence</span>
            </div>
          </div>
          <div class="voy-card-row">
            <mat-icon class="voy-msg-icon">chat_bubble_outline</mat-icon>
            <input #planInput class="voy-input" placeholder="Try “Goa, 5 days, ₹40,000, by train”"
                   (keyup.enter)="startPlanning(planInput.value)" />
            <button class="voy-plan-btn" (click)="startPlanning(planInput.value)">Plan with AI <span>→</span></button>
          </div>
          <div class="voy-chips">
            <button *ngFor="let c of quickPlans" class="voy-chip" (click)="startPlanning(c)">{{ c }}</button>
          </div>
        </div>
      </div>

      <span class="voy-slide-tag">{{ heroSlides[activeSlide].place }}</span>
    </section>

    <!-- Trust / scale bar -->
    <div class="voy-trust">
      <span><b>10</b> destinations</span><i>·</i>
      <span><b>18</b> microservices</span><i>·</i>
      <span><b>500+</b> airlines</span><i>·</i>
      <span><b>24×7</b> AI support</span>
    </div>

    <div class="page-container">
      <!-- Quick Services -->
      <div class="voy-sec-head">
        <span class="voy-eyebrow dark">Book your trip</span>
        <h2 class="voy-h2">Everything a journey needs</h2>
        <p class="voy-sec-sub">Flights, stays, rides, insurance and packages — or let the AI put it all together.</p>
      </div>
      <div class="responsive-grid">
        <mat-card class="feature-card voy-service" *ngFor="let service of services" [routerLink]="service.link">
          <mat-card-header>
            <mat-icon class="card-icon">{{ service.icon }}</mat-icon>
            <mat-card-title>{{ service.title }}</mat-card-title>
            <mat-card-subtitle>{{ service.subtitle }}</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p>{{ service.description }}</p>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Mid-page demo video (click-to-play, no autoplay) -->
      <app-video-section></app-video-section>

      <!-- Stats -->
      <div class="stats-grid">
        <mat-card class="stat-card" *ngFor="let stat of stats">
          <div class="stat-value">{{ stat.value }}{{ stat.suffix }}</div>
          <div class="stat-label">{{ stat.label }}</div>
        </mat-card>
      </div>

      <!-- AI Travel Assistant -->
      <mat-card class="ai-cta-card voy-ai-card">
        <mat-card-content>
          <div class="ai-cta-content">
            <div class="ai-cta-text">
              <h2>Meet the TravelSphere AI</h2>
              <p>One conversation plans the whole journey — transport, stay, food, activities and the way home. Ask for changes, it re-plans live.</p>
              <button mat-raised-button color="accent" class="cta-button" routerLink="/ai/agent">
                <mat-icon>chat</mat-icon> Chat with AI Agent
              </button>
              <button mat-raised-button class="cta-button" style="margin-left:12px;background:white;color:var(--teal)" routerLink="/ai/plan-trip">
                <mat-icon>edit</mat-icon> Plan a Trip
              </button>
            </div>
            <div class="ai-cta-visual">
              <span style="font-size:120px">🧭</span>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    :host { display: block; }

    /* ── Hero ─────────────────────────────────────────── */
    .voy-hero {
      position: relative;
      min-height: min(92vh, 920px);
      display: flex;
      align-items: flex-start;
      justify-content: center;
      overflow: hidden;
      background: var(--teal, #1e4b47); /* fallback while photos load */
      color: #fff;
    }
    .voy-slides { position: absolute; inset: 0; }
    .voy-slide {
      position: absolute; inset: 0;
      background-size: cover; background-position: center;
      opacity: 0;
      transition: opacity 1.6s ease;
    }
    .voy-slide.active { opacity: 1; animation: voyKenburns 9s ease-out forwards; }
    @keyframes voyKenburns { from { transform: scale(1.02); } to { transform: scale(1.12); } }
    .voy-scrim {
      position: absolute; inset: 0;
      background:
        linear-gradient(180deg, rgba(15, 28, 26, 0.55) 0%, rgba(15, 28, 26, 0) 30%),
        linear-gradient(0deg, rgba(21, 16, 12, 0.62) 0%, rgba(21, 16, 12, 0) 46%);
    }
    .voy-hero-inner {
      position: relative; z-index: 2;
      width: 100%; max-width: 1120px;
      margin: 0 auto;
      padding: 172px 24px 110px;
      display: flex; flex-direction: column; align-items: center;
      text-align: center;
    }
    .voy-eyebrow {
      display: inline-flex; align-items: center; gap: 9px;
      font: 600 0.74rem/1 'Inter', sans-serif;
      letter-spacing: 0.22em; text-transform: uppercase;
      color: rgba(255, 249, 240, 0.86);
      background: rgba(20, 32, 30, 0.35);
      border: 1px solid rgba(255, 249, 240, 0.26);
      padding: 9px 16px; border-radius: 999px;
      backdrop-filter: blur(6px);
      margin: 0 0 26px;
    }
    .voy-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--amber); box-shadow: 0 0 10px var(--amber); flex: none; }
    .voy-title {
      font-family: var(--serif, 'Fraunces', Georgia, serif);
      font-weight: 500;
      font-size: clamp(2.7rem, 6vw, 4.6rem);
      line-height: 1.05;
      margin: 0 0 22px;
      color: #fff9f0;
      text-wrap: balance;
    }
    .voy-title em { font-style: italic; color: #f0b46e; }
    .voy-sub {
      max-width: 640px;
      font-size: 1.06rem; line-height: 1.65;
      color: rgba(255, 249, 240, 0.92);
      margin: 0 0 42px;
    }

    /* ── Floating chat card ───────────────────────────── */
    .voy-card {
      width: min(660px, 100%);
      background: rgba(251, 247, 241, 0.96);
      backdrop-filter: blur(18px);
      -webkit-backdrop-filter: blur(18px);
      border: 1px solid rgba(255, 255, 255, 0.7);
      border-radius: 26px;
      box-shadow: 0 30px 70px rgba(10, 8, 6, 0.42), 0 4px 18px rgba(10, 8, 6, 0.25);
      padding: 22px;
      text-align: left;
    }
    .voy-card-head { display: flex; align-items: center; gap: 13px; margin-bottom: 16px; }
    .voy-avatar {
      width: 44px; height: 44px; border-radius: 14px; flex: none;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.4rem;
      background: linear-gradient(135deg, #ecdcc2, #d8b98e);
      border: 1px solid rgba(122, 84, 44, 0.25);
    }
    .voy-card-copy { display: flex; flex-direction: column; }
    .voy-card-copy strong { font-family: var(--serif); font-size: 1.08rem; font-weight: 600; color: var(--teal); }
    .voy-card-copy span { font-size: 0.82rem; color: var(--ink-muted); margin-top: 2px; }
    .voy-card-row {
      display: flex; align-items: center; gap: 10px;
      background: #fff;
      border: 1px solid #e5d9c7;
      border-radius: 16px;
      padding: 6px 6px 6px 14px;
      transition: border-color .2s ease, box-shadow .2s ease;
    }
    .voy-card-row:focus-within { border-color: var(--clay); box-shadow: 0 0 0 4px rgba(192, 91, 51, 0.14); }
    .voy-msg-icon { color: var(--clay); font-size: 20px; width: 20px; height: 20px; flex: none; }
    .voy-input {
      flex: 1; min-width: 0;
      border: 0; outline: 0; background: transparent;
      font: 400 0.98rem 'Inter', sans-serif; color: var(--ink);
      padding: 12px 0;
    }
    .voy-input::placeholder { color: #a79a8c; }
    .voy-plan-btn {
      flex: none;
      background: var(--teal); color: #fdf9f2;
      border: 0; border-radius: 12px;
      font: 600 0.95rem 'Inter', sans-serif;
      padding: 12px 20px; cursor: pointer;
      transition: background .2s ease, transform .15s ease;
    }
    .voy-plan-btn:hover { background: #153a37; transform: translateY(-1px); }
    .voy-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px; }
    .voy-chip {
      border: 1px solid #e0d2bc; background: #f4ebde;
      color: #5c5046;
      font: 500 0.8rem 'Inter', sans-serif;
      border-radius: 999px; padding: 7px 13px; cursor: pointer;
      transition: all .18s ease;
    }
    .voy-chip:hover { background: var(--teal); border-color: var(--teal); color: #fdf9f2; }
    .voy-slide-tag {
      position: absolute; right: 26px; bottom: 22px; z-index: 2;
      font: 500 0.76rem 'Inter', sans-serif; letter-spacing: 0.09em; text-transform: uppercase;
      color: rgba(255, 249, 240, 0.86);
      background: rgba(15, 25, 23, 0.4);
      padding: 6px 12px; border-radius: 999px;
      backdrop-filter: blur(6px);
    }

    /* ── Trust / scale bar ────────────────────────────── */
    .voy-trust {
      background: var(--cream);
      border-top: 1px solid var(--sand);
      display: flex; justify-content: center; align-items: center;
      flex-wrap: wrap; gap: 10px 18px;
      padding: 22px 24px;
      font-size: 0.86rem; color: var(--ink-muted);
    }
    .voy-trust b { color: var(--teal); font-weight: 700; }
    .voy-trust i { font-style: normal; color: #d9c8ae; }

    /* ── Harmonized sections ──────────────────────────── */
    .voy-sec-head { text-align: center; margin: 64px 0 30px; }
    :host .voy-eyebrow.dark {
      color: var(--clay); background: transparent; border: 0; padding: 0;
      letter-spacing: 0.2em; font-size: 0.72rem; margin-bottom: 12px;
    }
    .voy-h2 { font-family: var(--serif); font-weight: 600; font-size: 2.1rem; color: var(--ink); margin: 0 0 10px; }
    .voy-sec-sub { color: var(--ink-muted); margin: 0 0 28px; }
    :host .voy-service { background: #fffdf9; }
    :host .voy-service .card-icon { color: var(--clay); }
    :host .stat-card .stat-value { color: var(--teal); font-family: var(--serif); font-weight: 600; }
    .voy-ai-card { background: linear-gradient(120deg, #1e4b47 0%, #2f6a63 55%, #9e4423 135%) !important; }
    .voy-ai-card h2 { font-family: var(--serif); font-weight: 600; }

    /* ── Responsive ───────────────────────────────────── */
    @media (max-width: 640px) {
      .voy-hero-inner { padding: 128px 16px 72px; }
      .voy-card-row { flex-wrap: wrap; }
      .voy-plan-btn { width: 100%; justify-content: center; }
      .voy-trust { gap: 6px 14px; font-size: 0.78rem; }
      .voy-sec-head { margin-top: 44px; }
    }
  `]
})
export class HomeComponent implements OnInit, OnDestroy {
  services = [
    { icon: 'flight', title: 'Flights', subtitle: 'Search & Book', description: 'Find the best flight deals across 500+ airlines worldwide.', link: '/flights' },
    { icon: 'hotel', title: 'Hotels', subtitle: 'Stay Anywhere', description: 'Book hotels, resorts, and homestays at the best prices.', link: '/hotels' },
    { icon: 'directions_car', title: 'Car Rental', subtitle: 'Drive Free', description: 'Ride in style with our premium car rental services.', link: '/cars' },
    { icon: 'train', title: 'Transport', subtitle: 'Bus & Train', description: 'Book bus and train tickets for intercity travel.', link: '/transport' },
    { icon: 'umbrella', title: 'Insurance', subtitle: 'Travel Safe', description: 'Protect your trip with comprehensive travel insurance.', link: '/insurance' },
    { icon: 'card_giftcard', title: 'Packages', subtitle: 'Holiday Deals', description: 'All-in-one holiday packages at unbeatable prices.', link: '/packages' },
  ];

  stats = [
    { value: '500+', suffix: '', label: 'Airlines Partnered' },
    { value: '50K', suffix: '+', label: 'Happy Travelers' },
    { value: '100', suffix: '+', label: 'Countries Covered' },
    { value: '24/7', suffix: '', label: 'Customer Support' },
  ];

  heroSlides = [
    { url: 'assets/hero/goa.jpg', place: 'Goa · beaches & sunsets' },
    { url: 'assets/hero/kerala.jpg', place: 'Kerala · backwaters' },
    { url: 'assets/hero/tajmahal.jpg', place: 'Agra · the Taj Mahal' },
    { url: 'assets/hero/mountain.jpg', place: 'The Himalayas' },
  ];

  quickPlans = [
    'Goa · 5 days · ₹40,000',
    'Kerala · 7 days · ₹60,000',
    'Manali · 4 days · ₹35,000',
  ];

  activeSlide = 0;
  private slideTimer: ReturnType<typeof setInterval> | null = null;
  private router = inject(Router);

  ngOnInit() {
    this.slideTimer = setInterval(() => {
      this.activeSlide = (this.activeSlide + 1) % this.heroSlides.length;
    }, 7000);
  }

  ngOnDestroy() {
    if (this.slideTimer) clearInterval(this.slideTimer);
  }

  startPlanning(prompt: string) {
    const q = (prompt || '').trim();
    this.router.navigate(['/ai/agent'], q ? { queryParams: { q } } : undefined);
  }
}
