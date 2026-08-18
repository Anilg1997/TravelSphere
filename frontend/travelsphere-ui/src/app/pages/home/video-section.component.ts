import { Component, ViewChild, ElementRef } from '@angular/core';
import { NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

/**
 * Mid-page product-demo video section.
 *
 * Deliberately NOT autoplaying: a large thumbnail frame with a centered play
 * button opens the video in a lightbox modal — the demo is something the
 * visitor chooses to watch, after the hero and steps have made the pitch.
 */
@Component({
  selector: 'app-video-section',
  standalone: true,
  imports: [NgIf, MatIconModule],
  template: `
    <section class="vs-wrap">
      <div class="vs-head">
        <span class="vs-eyebrow">Watch it in action</span>
        <h2 class="vs-title">Plan a full week in Goa — <em>door to door</em></h2>
        <p class="vs-sub">Watch TravelSphere plan a full week in Goa, door to door, in under 2 minutes.</p>
      </div>

      <button class="vs-thumb" (click)="open()" aria-label="Play the TravelSphere demo video">
        <img [src]="poster" alt="TravelSphere demo — planning a Goa trip" />
        <span class="vs-play"><mat-icon>play_arrow</mat-icon></span>
        <span class="vs-dur">≈ 2 min</span>
      </button>

      <!-- Lightbox -->
      <div *ngIf="isOpen" class="vs-modal" (click)="close()" (window:keydown.escape)="close()">
        <div class="vs-modal-box" (click)="$event.stopPropagation()">
          <video #vid controls autoplay [muted]="true" playsinline [src]="videoUrl" (ended)="close()"></video>
          <button class="vs-close" (click)="close()" aria-label="Close video">✕</button>
        </div>
      </div>
    </section>
  `,
  styles: [`
    :host { display: block; }

    .vs-wrap {
      max-width: 1080px;
      margin: 0 auto;
      padding: 72px 24px 8px;
      text-align: center;
    }
    .vs-head { margin-bottom: 30px; }
    .vs-eyebrow {
      display: inline-block;
      font: 600 0.72rem/1 'Inter', sans-serif;
      letter-spacing: 0.22em; text-transform: uppercase;
      color: var(--clay, #c05b33);
      margin-bottom: 12px;
    }
    .vs-title {
      font-family: var(--serif, 'Fraunces', Georgia, serif);
      font-weight: 600;
      font-size: clamp(1.7rem, 3.4vw, 2.5rem);
      line-height: 1.15;
      color: var(--ink, #2b2420);
      margin: 0 0 10px;
    }
    .vs-title em { font-style: italic; color: var(--clay, #c05b33); }
    .vs-sub { color: var(--ink-muted, #7a6e63); margin: 0; font-size: 1rem; }

    .vs-thumb {
      position: relative;
      width: 100%;
      aspect-ratio: 16 / 9;
      border: 0; padding: 0; cursor: pointer;
      border-radius: 26px;
      overflow: hidden;
      background: #17130f;
      box-shadow: 0 24px 60px rgba(43, 36, 32, 0.28);
      transition: box-shadow 0.25s ease, transform 0.25s ease;
      display: block;
    }
    .vs-thumb:hover { transform: translateY(-3px); box-shadow: 0 30px 80px rgba(43, 36, 32, 0.34); }
    .vs-thumb img {
      width: 100%; height: 100%;
      object-fit: cover;
      display: block;
      transition: transform 0.6s ease;
    }
    .vs-thumb:hover img { transform: scale(1.04); }

    .vs-play {
      position: absolute; inset: 0;
      margin: auto;
      width: 88px; height: 88px;
      display: flex; align-items: center; justify-content: center;
      background: rgba(251, 247, 241, 0.95);
      color: var(--teal, #1e4b47);
      border-radius: 50%;
      box-shadow: 0 12px 34px rgba(10, 8, 6, 0.45);
      transition: transform 0.2s ease;
    }
    .vs-play mat-icon { font-size: 46px; width: 46px; height: 46px; margin-left: 4px; }
    .vs-thumb:hover .vs-play { transform: scale(1.08); }
    .vs-play::after {
      content: '';
      position: absolute; inset: -14px;
      border-radius: 50%;
      border: 2px solid rgba(251, 247, 241, 0.55);
      animation: vsPulse 2.2s ease-out infinite;
    }
    @keyframes vsPulse {
      0% { transform: scale(0.85); opacity: 1; }
      70%, 100% { transform: scale(1.25); opacity: 0; }
    }

    .vs-dur {
      position: absolute; right: 16px; bottom: 14px;
      font: 600 0.76rem/1 'Inter', sans-serif; letter-spacing: 0.06em;
      color: rgba(255, 249, 240, 0.92);
      background: rgba(15, 25, 23, 0.55);
      padding: 7px 12px; border-radius: 999px;
      backdrop-filter: blur(6px);
    }

    /* ── Lightbox ─────────────────────────────────── */
    .vs-modal {
      position: fixed; inset: 0; z-index: 1200;
      background: rgba(12, 10, 8, 0.88);
      backdrop-filter: blur(8px);
      display: flex; align-items: center; justify-content: center;
      padding: 24px;
      animation: vsFade 0.25s ease;
    }
    @keyframes vsFade { from { opacity: 0; } to { opacity: 1; } }
    .vs-modal-box {
      position: relative;
      width: min(1120px, 94vw);
    }
    .vs-modal-box video {
      width: 100%;
      border-radius: 18px;
      background: #000;
      box-shadow: 0 40px 120px rgba(0, 0, 0, 0.6);
      display: block;
    }
    .vs-close {
      position: absolute; top: -16px; right: -16px;
      width: 42px; height: 42px;
      border: 0; border-radius: 50%;
      background: var(--cream, #fbf7f1);
      color: var(--ink, #2b2420);
      font-size: 1.05rem; font-weight: 600;
      cursor: pointer;
      box-shadow: 0 8px 22px rgba(0, 0, 0, 0.35);
      transition: transform 0.15s ease;
      display: flex; align-items: center; justify-content: center;
    }
    .vs-close:hover { transform: scale(1.1); }

    @media (max-width: 640px) {
      .vs-wrap { padding: 48px 16px 0; }
      .vs-play { width: 66px; height: 66px; }
      .vs-play mat-icon { font-size: 34px; width: 34px; height: 34px; }
      .vs-close { top: -12px; right: -8px; }
    }
  `]
})
export class VideoSectionComponent {
  @ViewChild('vid') vid!: ElementRef<HTMLVideoElement>;

  poster = 'assets/video/demo-poster.jpg';
  videoUrl = 'assets/video/demo.mp4';
  isOpen = false;

  open() {
    this.isOpen = true;
    // muted autoplay is allowed without a user gesture — start it once rendered
    setTimeout(() => {
      const v = this.vid?.nativeElement;
      if (v) { v.muted = true; v.play().catch(() => {}); }
    }, 0);
  }

  close() {
    this.isOpen = false;
    // stop playback when the lightbox closes
    this.vid?.nativeElement?.pause();
  }

}
