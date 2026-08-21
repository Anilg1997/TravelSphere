import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  UserSettings,
  NotificationSettings,
  PrivacySettings,
  AppearanceSettings,
  SecuritySettings,
  DEFAULT_SETTINGS,
} from '../models/settings.model';

const STORAGE_KEY = 'travelsphere_settings';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private settingsSubject: BehaviorSubject<UserSettings>;

  settings$: Observable<UserSettings>;

  constructor() {
    this.settingsSubject = new BehaviorSubject<UserSettings>(this.loadSettings());
    this.settings$ = this.settingsSubject.asObservable();
  }

  get current(): UserSettings {
    return this.settingsSubject.value;
  }

  // ── Notification Settings ──────────────────────────
  updateNotifications(patch: Partial<NotificationSettings>): void {
    this.update({ notifications: { ...this.current.notifications, ...patch } });
  }

  // ── Privacy Settings ───────────────────────────────
  updatePrivacy(patch: Partial<PrivacySettings>): void {
    this.update({ privacy: { ...this.current.privacy, ...patch } });
  }

  // ── Appearance Settings ────────────────────────────
  updateAppearance(patch: Partial<AppearanceSettings>): void {
    const updated = { ...this.current.appearance, ...patch };
    this.update({ appearance: updated });
    this.applyTheme(updated.theme);
  }

  // ── Security Settings ──────────────────────────────
  updateSecurity(patch: Partial<SecuritySettings>): void {
    this.update({ security: { ...this.current.security, ...patch } });
  }

  // ── Reset ──────────────────────────────────────────
  resetAll(): void {
    this.settingsSubject.next({ ...DEFAULT_SETTINGS });
    this.persist(this.settingsSubject.value);
    this.applyTheme(DEFAULT_SETTINGS.appearance.theme);
  }

  resetCategory<K extends keyof UserSettings>(category: K): void {
    const defaults = { ...DEFAULT_SETTINGS };
    const current = { ...this.current };
    current[category] = defaults[category] as any;
    this.settingsSubject.next(current);
    this.persist(current);
  }

  // ── Theme Application ──────────────────────────────
  applyInitialTheme(): void {
    this.applyTheme(this.current.appearance.theme);
  }

  // ── Private ────────────────────────────────────────
  private update(partial: Partial<UserSettings>): void {
    const updated = { ...this.current, ...partial };
    this.settingsSubject.next(updated);
    this.persist(updated);
  }

  private persist(settings: UserSettings): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Storage full or unavailable
    }
  }

  private loadSettings(): UserSettings {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const stored = JSON.parse(raw) as Partial<UserSettings>;
        return {
          notifications: { ...DEFAULT_SETTINGS.notifications, ...stored.notifications },
          privacy: { ...DEFAULT_SETTINGS.privacy, ...stored.privacy },
          appearance: { ...DEFAULT_SETTINGS.appearance, ...stored.appearance },
          security: { ...DEFAULT_SETTINGS.security, ...stored.security },
        };
      }
    } catch {
      // Corrupted data
    }
    return { ...DEFAULT_SETTINGS };
  }

  private applyTheme(theme: string): void {
    const root = document.documentElement;
    root.classList.remove('dark-theme', 'light-theme');

    if (theme === 'dark') {
      root.classList.add('dark-theme');
    } else if (theme === 'light') {
      root.classList.add('light-theme');
    } else {
      // system: check prefers-color-scheme
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.add(prefersDark ? 'dark-theme' : 'light-theme');
    }
  }
}
