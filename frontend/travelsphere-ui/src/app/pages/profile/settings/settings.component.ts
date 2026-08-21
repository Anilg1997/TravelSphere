import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { SettingsService } from '../../../services/settings.service';
import { AuthService } from '../../../services/auth.service';
import { UserService, UserDataExport } from '../../../services/user.service';
import { ChangeEmailRequest } from '../../../models/user.model';
import {
  NotificationSettings,
  PrivacySettings,
  AppearanceSettings,
  SecuritySettings,
} from '../../../models/settings.model';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatTabsModule,
    MatSliderModule,
    MatSnackBarModule,
    MatDividerModule,
    MatButtonToggleModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatDialogModule,
  ],
  template: `
    <div class="page-container" style="max-width: 800px">
      <div class="settings-header">
        <div>
          <h1 class="section-title">Settings</h1>
          <p class="section-subtitle">Manage your account preferences and privacy</p>
        </div>
        <a mat-stroked-button routerLink="/profile">
          <mat-icon>arrow_back</mat-icon> Back to Profile
        </a>
      </div>

      <mat-tab-group animationDuration="300ms" class="settings-tabs">
        <!-- ═══════════════════ Notifications ═══════════════════ -->
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon>notifications</mat-icon>
            <span class="tab-label">Notifications</span>
          </ng-template>
          <div class="tab-content">
            <mat-card class="settings-card">
              <mat-card-header>
                <mat-icon mat-card-avatar color="primary">email</mat-icon>
                <mat-card-title>Email Notifications</mat-card-title>
                <mat-card-subtitle>Choose what emails you receive</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <div class="setting-row">
                  <div class="setting-info">
                    <span class="setting-label">Booking confirmations</span>
                    <span class="setting-desc">Receive emails when a booking is confirmed or updated</span>
                  </div>
                  <mat-slide-toggle
                    [ngModel]="notifications.emailBookings"
                    (ngModelChange)="onNotificationChange('emailBookings', $event)"
                    color="primary"
                  ></mat-slide-toggle>
                </div>
                <mat-divider></mat-divider>
                <div class="setting-row">
                  <div class="setting-info">
                    <span class="setting-label">Promotions & deals</span>
                    <span class="setting-desc">Get notified about special offers and discounts</span>
                  </div>
                  <mat-slide-toggle
                    [ngModel]="notifications.emailPromotions"
                    (ngModelChange)="onNotificationChange('emailPromotions', $event)"
                    color="primary"
                  ></mat-slide-toggle>
                </div>
                <mat-divider></mat-divider>
                <div class="setting-row">
                  <div class="setting-info">
                    <span class="setting-label">Newsletter</span>
                    <span class="setting-desc">Monthly travel tips and destination guides</span>
                  </div>
                  <mat-slide-toggle
                    [ngModel]="notifications.emailNewsletter"
                    (ngModelChange)="onNotificationChange('emailNewsletter', $event)"
                    color="primary"
                  ></mat-slide-toggle>
                </div>
              </mat-card-content>
            </mat-card>

            <mat-card class="settings-card">
              <mat-card-header>
                <mat-icon mat-card-avatar color="primary">phone_android</mat-icon>
                <mat-card-title>Push Notifications</mat-card-title>
                <mat-card-subtitle>Manage in-app push alerts</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <div class="setting-row">
                  <div class="setting-info">
                    <span class="setting-label">Booking updates</span>
                    <span class="setting-desc">Real-time updates on your active bookings</span>
                  </div>
                  <mat-slide-toggle
                    [ngModel]="notifications.pushBookings"
                    (ngModelChange)="onNotificationChange('pushBookings', $event)"
                    color="primary"
                  ></mat-slide-toggle>
                </div>
                <mat-divider></mat-divider>
                <div class="setting-row">
                  <div class="setting-info">
                    <span class="setting-label">Promotions</span>
                    <span class="setting-desc">Flash sales and limited-time offers</span>
                  </div>
                  <mat-slide-toggle
                    [ngModel]="notifications.pushPromotions"
                    (ngModelChange)="onNotificationChange('pushPromotions', $event)"
                    color="primary"
                  ></mat-slide-toggle>
                </div>
                <mat-divider></mat-divider>
                <div class="setting-row">
                  <div class="setting-info">
                    <span class="setting-label">Nearby alerts</span>
                    <span class="setting-desc">Points of interest and deals near your location</span>
                  </div>
                  <mat-slide-toggle
                    [ngModel]="notifications.pushNearbyAlerts"
                    (ngModelChange)="onNotificationChange('pushNearbyAlerts', $event)"
                    color="primary"
                  ></mat-slide-toggle>
                </div>
              </mat-card-content>
            </mat-card>

            <mat-card class="settings-card">
              <mat-card-header>
                <mat-icon mat-card-avatar color="primary">sms</mat-icon>
                <mat-card-title>SMS Notifications</mat-card-title>
                <mat-card-subtitle>Text message alerts for critical updates</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <div class="setting-row">
                  <div class="setting-info">
                    <span class="setting-label">Booking alerts</span>
                    <span class="setting-desc">SMS confirmation for flight changes and cancellations</span>
                  </div>
                  <mat-slide-toggle
                    [ngModel]="notifications.smsBookings"
                    (ngModelChange)="onNotificationChange('smsBookings', $event)"
                    color="primary"
                  ></mat-slide-toggle>
                </div>
                <mat-divider></mat-divider>
                <div class="setting-row">
                  <div class="setting-info">
                    <span class="setting-label">Security alerts</span>
                    <span class="setting-desc">Login attempts and password changes</span>
                  </div>
                  <mat-slide-toggle
                    [ngModel]="notifications.smsSecurity"
                    (ngModelChange)="onNotificationChange('smsSecurity', $event)"
                    color="primary"
                  ></mat-slide-toggle>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

        <!-- ═══════════════════ Privacy ═══════════════════ -->
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon>privacy_tip</mat-icon>
            <span class="tab-label">Privacy</span>
          </ng-template>
          <div class="tab-content">
            <mat-card class="settings-card">
              <mat-card-header>
                <mat-icon mat-card-avatar color="primary">visibility</mat-icon>
                <mat-card-title>Profile Visibility</mat-card-title>
                <mat-card-subtitle>Control who can see your profile information</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <div class="setting-row">
                  <div class="setting-info">
                    <span class="setting-label">Profile visibility</span>
                    <span class="setting-desc">Public profiles are visible to everyone. Private profiles are hidden.</span>
                  </div>
                  <mat-button-toggle-group
                    [ngModel]="privacy.profileVisibility"
                    (ngModelChange)="onPrivacyChange('profileVisibility', $event)"
                    class="visibility-toggle"
                  >
                    <mat-button-toggle value="public">
                      <mat-icon>public</mat-icon> Public
                    </mat-button-toggle>
                    <mat-button-toggle value="contacts">
                      <mat-icon>people</mat-icon> Contacts
                    </mat-button-toggle>
                    <mat-button-toggle value="private">
                      <mat-icon>lock</mat-icon> Private
                    </mat-button-toggle>
                  </mat-button-toggle-group>
                </div>
                <mat-divider></mat-divider>
                <div class="setting-row">
                  <div class="setting-info">
                    <span class="setting-label">Show email address</span>
                    <span class="setting-desc">Allow others to see your email on your profile</span>
                  </div>
                  <mat-slide-toggle
                    [ngModel]="privacy.showEmail"
                    (ngModelChange)="onPrivacyChange('showEmail', $event)"
                    color="primary"
                  ></mat-slide-toggle>
                </div>
                <mat-divider></mat-divider>
                <div class="setting-row">
                  <div class="setting-info">
                    <span class="setting-label">Show phone number</span>
                    <span class="setting-desc">Allow others to see your phone on your profile</span>
                  </div>
                  <mat-slide-toggle
                    [ngModel]="privacy.showPhone"
                    (ngModelChange)="onPrivacyChange('showPhone', $event)"
                    color="primary"
                  ></mat-slide-toggle>
                </div>
                <mat-divider></mat-divider>
                <div class="setting-row">
                  <div class="setting-info">
                    <span class="setting-label">Location sharing</span>
                    <span class="setting-desc">Share your location for nearby discoveries and personalized recommendations</span>
                  </div>
                  <mat-slide-toggle
                    [ngModel]="privacy.allowLocationSharing"
                    (ngModelChange)="onPrivacyChange('allowLocationSharing', $event)"
                    color="primary"
                  ></mat-slide-toggle>
                </div>
                <mat-divider></mat-divider>
                <div class="setting-row">
                  <div class="setting-info">
                    <span class="setting-label">Online status</span>
                    <span class="setting-desc">Show when you're active on the platform</span>
                  </div>
                  <mat-slide-toggle
                    [ngModel]="privacy.showOnlineStatus"
                    (ngModelChange)="onPrivacyChange('showOnlineStatus', $event)"
                    color="primary"
                  ></mat-slide-toggle>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

        <!-- ═══════════════════ Appearance ═══════════════════ -->
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon>palette</mat-icon>
            <span class="tab-label">Appearance</span>
          </ng-template>
          <div class="tab-content">
            <mat-card class="settings-card">
              <mat-card-header>
                <mat-icon mat-card-avatar color="primary">dark_mode</mat-icon>
                <mat-card-title>Theme</mat-card-title>
                <mat-card-subtitle>Choose your preferred color scheme</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <div class="theme-grid">
                  <div
                    class="theme-option"
                    [class.selected]="appearance.theme === 'light'"
                    (click)="onAppearanceChange('theme', 'light')"
                  >
                    <mat-icon>light_mode</mat-icon>
                    <span>Light</span>
                  </div>
                  <div
                    class="theme-option"
                    [class.selected]="appearance.theme === 'dark'"
                    (click)="onAppearanceChange('theme', 'dark')"
                  >
                    <mat-icon>dark_mode</mat-icon>
                    <span>Dark</span>
                  </div>
                  <div
                    class="theme-option"
                    [class.selected]="appearance.theme === 'system'"
                    (click)="onAppearanceChange('theme', 'system')"
                  >
                    <mat-icon>contrast</mat-icon>
                    <span>System</span>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>

            <mat-card class="settings-card">
              <mat-card-header>
                <mat-icon mat-card-avatar color="primary">translate</mat-icon>
                <mat-card-title>Language & Region</mat-card-title>
                <mat-card-subtitle>Set your preferred language and currency</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <div class="setting-row">
                  <div class="setting-info">
                    <span class="setting-label">Language</span>
                    <span class="setting-desc">Interface language for the application</span>
                  </div>
                  <mat-form-field appearance="outline" class="compact-field">
                    <mat-select
                      [ngModel]="appearance.language"
                      (ngModelChange)="onAppearanceChange('language', $event)"
                    >
                      <mat-option value="en">English</mat-option>
                      <mat-option value="es">Español</mat-option>
                      <mat-option value="fr">Français</mat-option>
                      <mat-option value="de">Deutsch</mat-option>
                      <mat-option value="it">Italiano</mat-option>
                      <mat-option value="pt">Português</mat-option>
                      <mat-option value="ja">日本語</mat-option>
                      <mat-option value="ko">한국어</mat-option>
                      <mat-option value="zh">中文</mat-option>
                      <mat-option value="ar">العربية</mat-option>
                      <mat-option value="hi">हिन्दी</mat-option>
                    </mat-select>
                  </mat-form-field>
                </div>
                <mat-divider></mat-divider>
                <div class="setting-row">
                  <div class="setting-info">
                    <span class="setting-label">Currency</span>
                    <span class="setting-desc">Displayed currency for prices</span>
                  </div>
                  <mat-form-field appearance="outline" class="compact-field">
                    <mat-select
                      [ngModel]="appearance.currency"
                      (ngModelChange)="onAppearanceChange('currency', $event)"
                    >
                      <mat-option value="USD">USD ($)</mat-option>
                      <mat-option value="EUR">EUR (€)</mat-option>
                      <mat-option value="GBP">GBP (£)</mat-option>
                      <mat-option value="JPY">JPY (¥)</mat-option>
                      <mat-option value="INR">INR (₹)</mat-option>
                      <mat-option value="AUD">AUD (A$)</mat-option>
                      <mat-option value="CAD">CAD (C$)</mat-option>
                      <mat-option value="SGD">SGD (S$)</mat-option>
                    </mat-select>
                  </mat-form-field>
                </div>
                <mat-divider></mat-divider>
                <div class="setting-row">
                  <div class="setting-info">
                    <span class="setting-label">Compact mode</span>
                    <span class="setting-desc">Reduce spacing for more content on screen</span>
                  </div>
                  <mat-slide-toggle
                    [ngModel]="appearance.compactMode"
                    (ngModelChange)="onAppearanceChange('compactMode', $event)"
                    color="primary"
                  ></mat-slide-toggle>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

        <!-- ═══════════════════ Security ═══════════════════ -->
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon>security</mat-icon>
            <span class="tab-label">Security</span>
          </ng-template>
          <div class="tab-content">
            <mat-card class="settings-card">
              <mat-card-header>
                <mat-icon mat-card-avatar color="primary">verified_user</mat-icon>
                <mat-card-title>Two-Factor Authentication</mat-card-title>
                <mat-card-subtitle>Add an extra layer of security to your account</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <div class="setting-row">
                  <div class="setting-info">
                    <span class="setting-label">Enable 2FA</span>
                    <span class="setting-desc">Require a verification code when signing in from a new device</span>
                  </div>
                  <mat-slide-toggle
                    [ngModel]="security.twoFactorEnabled"
                    (ngModelChange)="onSecurityChange('twoFactorEnabled', $event)"
                    color="primary"
                  ></mat-slide-toggle>
                </div>
              </mat-card-content>
            </mat-card>

            <mat-card class="settings-card">
              <mat-card-header>
                <mat-icon mat-card-avatar color="primary">login</mat-icon>
                <mat-card-title>Login Security</mat-card-title>
                <mat-card-subtitle>Control login-related security features</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <div class="setting-row">
                  <div class="setting-info">
                    <span class="setting-label">Login notifications</span>
                    <span class="setting-desc">Get alerted when your account is accessed from a new device</span>
                  </div>
                  <mat-slide-toggle
                    [ngModel]="security.loginNotifications"
                    (ngModelChange)="onSecurityChange('loginNotifications', $event)"
                    color="primary"
                  ></mat-slide-toggle>
                </div>
                <mat-divider></mat-divider>
                <div class="setting-row">
                  <div class="setting-info">
                    <span class="setting-label">Session timeout</span>
                    <span class="setting-desc">Automatically log out after inactivity (minutes)</span>
                  </div>
                  <div class="timeout-control">
                    <mat-button-toggle-group
                      [ngModel]="security.sessionTimeout"
                      (ngModelChange)="onSecurityChange('sessionTimeout', $event)"
                      class="timeout-toggle"
                    >
                      <mat-button-toggle [value]="15">15m</mat-button-toggle>
                      <mat-button-toggle [value]="30">30m</mat-button-toggle>
                      <mat-button-toggle [value]="60">1h</mat-button-toggle>
                      <mat-button-toggle [value]="120">2h</mat-button-toggle>
                    </mat-button-toggle-group>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>

            <mat-card class="settings-card">
              <mat-card-header>
                <mat-icon mat-card-avatar color="primary">email</mat-icon>
                <mat-card-title>Change Email Address</mat-card-title>
                <mat-card-subtitle>Update your email address. You'll need to verify your new email.</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <div class="current-email-display">
                  <span class="setting-label">Current email:</span>
                  <span class="current-email">{{ currentEmail }}</span>
                </div>
                <form [formGroup]="emailForm" class="password-form">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>New Email Address</mat-label>
                    <input
                      matInput
                      formControlName="newEmail"
                      type="email"
                      autocomplete="email"
                    />
                    <mat-error *ngIf="emailForm.get('newEmail')?.hasError('required')">
                      New email is required
                    </mat-error>
                    <mat-error *ngIf="emailForm.get('newEmail')?.hasError('email')">
                      Please enter a valid email address
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Current Password</mat-label>
                    <input
                      matInput
                      formControlName="currentPassword"
                      [type]="showEmailPassword ? 'text' : 'password'"
                      autocomplete="current-password"
                    />
                    <button
                      mat-icon-button
                      matSuffix
                      type="button"
                      (click)="showEmailPassword = !showEmailPassword"
                      matTooltip="Toggle visibility"
                    >
                      <mat-icon>{{ showEmailPassword ? 'visibility_off' : 'visibility' }}</mat-icon>
                    </button>
                    <mat-error *ngIf="emailForm.get('currentPassword')?.hasError('required')">
                      Password is required to change email
                    </mat-error>
                  </mat-form-field>

                  <div class="password-actions">
                    <button
                      mat-raised-button
                      color="primary"
                      [disabled]="emailForm.invalid || changingEmail"
                      (click)="changeEmail()"
                    >
                      <mat-spinner *ngIf="changingEmail" diameter="20" class="btn-spinner"></mat-spinner>
                      <mat-icon *ngIf="!changingEmail">email</mat-icon>
                      {{ changingEmail ? 'Changing...' : 'Change Email' }}
                    </button>
                  </div>
                </form>
              </mat-card-content>
            </mat-card>

            <mat-card class="settings-card">
              <mat-card-header>
                <mat-icon mat-card-avatar color="primary">lock</mat-icon>
                <mat-card-title>Change Password</mat-card-title>
                <mat-card-subtitle>Update your account password regularly for better security</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <form [formGroup]="passwordForm" class="password-form">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Current Password</mat-label>
                    <input
                      matInput
                      formControlName="currentPassword"
                      [type]="showCurrentPassword ? 'text' : 'password'"
                      autocomplete="current-password"
                    />
                    <button
                      mat-icon-button
                      matSuffix
                      type="button"
                      (click)="showCurrentPassword = !showCurrentPassword"
                      matTooltip="Toggle visibility"
                    >
                      <mat-icon>{{ showCurrentPassword ? 'visibility_off' : 'visibility' }}</mat-icon>
                    </button>
                    <mat-error *ngIf="passwordForm.get('currentPassword')?.hasError('required')">
                      Current password is required
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>New Password</mat-label>
                    <input
                      matInput
                      formControlName="newPassword"
                      [type]="showNewPassword ? 'text' : 'password'"
                      autocomplete="new-password"
                    />
                    <button
                      mat-icon-button
                      matSuffix
                      type="button"
                      (click)="showNewPassword = !showNewPassword"
                      matTooltip="Toggle visibility"
                    >
                      <mat-icon>{{ showNewPassword ? 'visibility_off' : 'visibility' }}</mat-icon>
                    </button>
                    <mat-hint *ngIf="passwordForm.get('newPassword')?.value">
                      {{ getPasswordStrengthLabel() }}
                    </mat-hint>
                    <mat-error *ngIf="passwordForm.get('newPassword')?.hasError('required')">
                      New password is required
                    </mat-error>
                    <mat-error *ngIf="passwordForm.get('newPassword')?.hasError('minlength')">
                      Password must be at least 8 characters
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Confirm New Password</mat-label>
                    <input
                      matInput
                      formControlName="confirmPassword"
                      [type]="showConfirmPassword ? 'text' : 'password'"
                      autocomplete="new-password"
                    />
                    <button
                      mat-icon-button
                      matSuffix
                      type="button"
                      (click)="showConfirmPassword = !showConfirmPassword"
                      matTooltip="Toggle visibility"
                    >
                      <mat-icon>{{ showConfirmPassword ? 'visibility_off' : 'visibility' }}</mat-icon>
                    </button>
                    <mat-error *ngIf="passwordForm.get('confirmPassword')?.hasError('required')">
                      Please confirm your new password
                    </mat-error>
                    <mat-error *ngIf="passwordForm.get('confirmPassword')?.hasError('passwordMismatch')">
                      Passwords do not match
                    </mat-error>
                  </mat-form-field>

                  <div class="password-actions">
                    <button
                      mat-raised-button
                      color="primary"
                      [disabled]="passwordForm.invalid || changingPassword"
                      (click)="changePassword()"
                    >
                      <mat-spinner *ngIf="changingPassword" diameter="20" class="btn-spinner"></mat-spinner>
                      <mat-icon *ngIf="!changingPassword">lock</mat-icon>
                      {{ changingPassword ? 'Changing...' : 'Change Password' }}
                    </button>
                  </div>
                </form>
              </mat-card-content>
            </mat-card>

            <mat-card class="settings-card danger-zone">
              <mat-card-header>
                <mat-icon mat-card-avatar color="warn">warning</mat-icon>
                <mat-card-title>Danger Zone</mat-card-title>
                <mat-card-subtitle>Irreversible account actions</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <div class="setting-row">
                  <div class="setting-info">
                    <span class="setting-label">Export your data</span>
                    <span class="setting-desc">Download a copy of all your personal data including profile, loyalty history, and referrals</span>
                  </div>
                  <button mat-stroked-button color="primary" (click)="exportData()" [disabled]="exportingData">
                    <mat-spinner *ngIf="exportingData" diameter="20" class="btn-spinner"></mat-spinner>
                    <mat-icon *ngIf="!exportingData">download</mat-icon>
                    {{ exportingData ? 'Exporting...' : 'Export Data' }}
                  </button>
                </div>
                <mat-divider></mat-divider>
                <div class="setting-row">
                  <div class="setting-info">
                    <span class="setting-label">Reset all settings</span>
                    <span class="setting-desc">Restore all settings to their default values</span>
                  </div>
                  <button mat-stroked-button color="warn" (click)="resetAll()">
                    <mat-icon>restart_alt</mat-icon> Reset All
                  </button>
                </div>
                <mat-divider></mat-divider>
                <div class="setting-row">
                  <div class="setting-info">
                    <span class="setting-label">Delete account</span>
                    <span class="setting-desc">Permanently delete your account and all associated data. This action cannot be undone.</span>
                  </div>
                  <button mat-raised-button color="warn" (click)="confirmDeleteAccount()" [disabled]="deletingAccount">
                    <mat-spinner *ngIf="deletingAccount" diameter="20" class="btn-spinner"></mat-spinner>
                    <mat-icon *ngIf="!deletingAccount">delete_forever</mat-icon>
                    {{ deletingAccount ? 'Deleting...' : 'Delete Account' }}
                  </button>
                </div>

                <!-- Export Data Preview -->
                <div class="export-preview" *ngIf="exportedData">
                  <mat-divider></mat-divider>
                  <div class="export-preview-content">
                    <div class="export-preview-header">
                      <mat-icon color="primary">check_circle</mat-icon>
                      <span>Data exported successfully</span>
                    </div>
                    <pre class="export-json">{{ exportedData | json }}</pre>
                    <button mat-stroked-button color="primary" (click)="downloadExport()">
                      <mat-icon>save_alt</mat-icon> Download as JSON
                    </button>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>

            <!-- Delete Confirmation Overlay -->
            <div class="delete-overlay" *ngIf="showDeleteConfirm">
              <div class="delete-dialog">
                <div class="delete-dialog-header">
                  <mat-icon color="warn">warning_amber</mat-icon>
                  <h3>Delete Account?</h3>
                </div>
                <p class="delete-dialog-body">
                  This will permanently delete your account and all associated data including bookings, preferences, and loyalty points. This action <strong>cannot be undone</strong>.
                </p>
                <div class="delete-dialog-actions">
                  <button mat-stroked-button (click)="showDeleteConfirm = false" [disabled]="deletingAccount">
                    Cancel
                  </button>
                  <button mat-raised-button color="warn" (click)="deleteAccount()" [disabled]="deletingAccount">
                    <mat-spinner *ngIf="deletingAccount" diameter="20" class="btn-spinner"></mat-spinner>
                    {{ deletingAccount ? 'Deleting...' : 'Yes, Delete My Account' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .settings-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
    }

    .settings-tabs {
      margin-top: 8px;
    }

    .tab-content {
      padding: 24px 0;
    }

    .settings-card {
      margin-bottom: 16px;
    }

    .settings-card mat-card-content {
      padding-top: 16px !important;
    }

    .setting-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 0;
      gap: 16px;
    }

    .setting-info {
      flex: 1;
      min-width: 0;
    }

    .setting-label {
      display: block;
      font-weight: 500;
      margin-bottom: 2px;
      font-size: 0.95rem;
    }

    .setting-desc {
      display: block;
      color: #666;
      font-size: 0.85rem;
      line-height: 1.4;
    }

    .tab-label {
      margin-left: 8px;
    }

    .compact-field {
      width: 180px;
    }

    .theme-grid {
      display: flex;
      gap: 16px;
      padding: 12px 0;
    }

    .theme-option {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 20px 32px;
      border-radius: 12px;
      border: 2px solid #e0e0e0;
      cursor: pointer;
      transition: all 0.2s;
    }

    .theme-option:hover {
      border-color: var(--primary);
      background: rgba(63, 81, 181, 0.04);
    }

    .theme-option.selected {
      border-color: var(--primary);
      background: rgba(63, 81, 181, 0.08);
    }

    .theme-option mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: var(--primary);
    }

    .visibility-toggle {
      flex-shrink: 0;
    }

    .timeout-control {
      flex-shrink: 0;
    }

    .timeout-toggle .mat-button-toggle {
      font-size: 0.85rem;
    }

    .danger-zone {
      border: 1px solid rgba(244, 67, 54, 0.3);
    }

    .danger-zone mat-card-header mat-icon {
      color: #f44336 !important;
    }

    /* ── Responsive ───────────────────────────── */
    @media (max-width: 768px) {
      .settings-header {
        flex-direction: column;
        gap: 12px;
      }

      .setting-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }

      .theme-grid {
        flex-wrap: wrap;
      }

      .theme-option {
        padding: 16px 24px;
        flex: 1;
        min-width: 120px;
      }

      .compact-field {
        width: 100%;
      }
    }

    .password-form {
      max-width: 480px;
      padding-top: 16px;
    }

    .password-form .full-width {
      width: 100%;
      margin-bottom: 8px;
    }

    .password-actions {
      display: flex;
      gap: 12px;
      margin-top: 16px;
    }

    .current-email-display {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;
      padding: 12px 16px;
      background: #f5f5f5;
      border-radius: 8px;
    }

    .current-email {
      font-weight: 500;
      color: var(--primary);
    }

    .btn-spinner {
      display: inline-block;
      margin-right: 8px;
    }

    /* ── Delete Confirmation Dialog ───────────── */
    .delete-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      animation: fadeIn 0.2s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .delete-dialog {
      background: white;
      border-radius: 16px;
      padding: 32px;
      max-width: 440px;
      width: 90%;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      animation: slideUp 0.3s ease-out;
    }

    @keyframes slideUp {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    .delete-dialog-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
    }

    .delete-dialog-header mat-icon {
      font-size: 36px;
      width: 36px;
      height: 36px;
    }

    .delete-dialog-header h3 {
      margin: 0;
      font-size: 1.3rem;
      color: #c62828;
    }

    .delete-dialog-body {
      color: #555;
      line-height: 1.6;
      margin-bottom: 24px;
    }

    .delete-dialog-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
    }

    /* ── Export Preview ───────────────────────── */
    .export-preview {
      margin-top: 16px;
      padding-top: 16px;
    }

    .export-preview-content {
      padding-top: 16px;
    }

    .export-preview-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;
      color: var(--success);
      font-weight: 500;
    }

    .export-json {
      background: #f5f5f5;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 16px;
      font-size: 0.8rem;
      max-height: 300px;
      overflow-y: auto;
      white-space: pre-wrap;
      word-break: break-all;
      margin-bottom: 16px;
    }

    /* ── Dark Theme Overrides ─────────────────── */
    :host-context(.dark-theme) {
      .setting-desc {
        color: #aaa;
      }

      .theme-option {
        border-color: #444;
        background: #1e1e1e;
      }

      .theme-option:hover {
        border-color: var(--primary);
        background: rgba(63, 81, 181, 0.12);
      }

      .theme-option.selected {
        border-color: var(--primary);
        background: rgba(63, 81, 181, 0.18);
      }

      .delete-dialog {
        background: #2a2a2a;
      }

      .delete-dialog-body {
        color: #ccc;
      }

      .export-json {
        background: #1e1e1e;
        border-color: #444;
        color: #e0e0e0;
      }
    }
  `],
})
export class SettingsComponent implements OnInit {
  private settingsService = inject(SettingsService);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private snackBar = inject(MatSnackBar);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private dialog = inject(MatDialog);

  notifications!: NotificationSettings;
  privacy!: PrivacySettings;
  appearance!: AppearanceSettings;
  security!: SecuritySettings;

  // Password change
  passwordForm: FormGroup;
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;
  changingPassword = false;

  // Account deletion
  showDeleteConfirm = false;
  deletingAccount = false;

  // Data export
  exportingData = false;
  exportedData: UserDataExport | null = null;

  // Email change
  emailForm: FormGroup;
  showEmailPassword = false;
  changingEmail = false;
  currentEmail = '';

  constructor() {
    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
    }, { validators: this.passwordMatchValidator });

    this.emailForm = this.fb.group({
      newEmail: ['', [Validators.required, Validators.email]],
      currentPassword: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadSettings();
    this.loadCurrentEmail();
  }

  private loadSettings(): void {
    const s = this.settingsService.current;
    this.notifications = { ...s.notifications };
    this.privacy = { ...s.privacy };
    this.appearance = { ...s.appearance };
    this.security = { ...s.security };
  }

  private loadCurrentEmail(): void {
    this.authService.user$.subscribe(user => {
      if (user) {
        this.currentEmail = user.email;
      }
    });
  }

  private passwordMatchValidator(form: FormGroup) {
    const newPw = form.get('newPassword')?.value;
    const confirmPw = form.get('confirmPassword')?.value;
    if (newPw && confirmPw && newPw !== confirmPw) {
      form.get('confirmPassword')?.setErrors({ passwordMismatch: true });
    }
    return null;
  }

  getPasswordStrengthLabel(): string {
    const pw = this.passwordForm.get('newPassword')?.value || '';
    if (pw.length === 0) return '';
    if (pw.length < 8) return 'Weak';
    const hasUpper = /[A-Z]/.test(pw);
    const hasLower = /[a-z]/.test(pw);
    const hasDigit = /[0-9]/.test(pw);
    const hasSpecial = /[^A-Za-z0-9]/.test(pw);
    const score = [hasUpper, hasLower, hasDigit, hasSpecial].filter(Boolean).length;
    if (score <= 2) return 'Weak';
    if (score === 3) return 'Medium';
    return 'Strong';
  }

  changePassword(): void {
    if (this.passwordForm.invalid || this.changingPassword) return;

    this.changingPassword = true;
    const { currentPassword, newPassword } = this.passwordForm.value;

    this.authService.changePassword({ currentPassword, newPassword }).subscribe({
      next: () => {
        this.snackBar.open('Password changed successfully. Please log in again.', 'OK', { duration: 5000 });
        this.passwordForm.reset();
        this.changingPassword = false;
        this.authService.logout();
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.changingPassword = false;
        const message = err?.error?.message || 'Failed to change password. Please try again.';
        this.snackBar.open(message, 'Close', { duration: 4000 });
      }
    });
  }

  changeEmail(): void {
    if (this.emailForm.invalid || this.changingEmail) return;

    this.changingEmail = true;
    const { newEmail, currentPassword } = this.emailForm.value;

    this.authService.changeEmail({ newEmail, currentPassword }).subscribe({
      next: () => {
        this.snackBar.open('Email changed successfully. Please verify your new email and log in again.', 'OK', { duration: 5000 });
        this.emailForm.reset();
        this.changingEmail = false;
        this.authService.logout();
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.changingEmail = false;
        const message = err?.error?.message || 'Failed to change email. Please try again.';
        this.snackBar.open(message, 'Close', { duration: 4000 });
      }
    });
  }

  onNotificationChange(key: keyof NotificationSettings, value: boolean): void {
    this.notifications[key] = value;
    this.settingsService.updateNotifications({ [key]: value });
    this.showSaved('Notification settings saved');
  }

  onPrivacyChange(key: keyof PrivacySettings, value: any): void {
    (this.privacy as any)[key] = value;
    this.settingsService.updatePrivacy({ [key]: value });
    this.showSaved('Privacy settings saved');
  }

  onAppearanceChange(key: keyof AppearanceSettings, value: any): void {
    (this.appearance as any)[key] = value;
    this.settingsService.updateAppearance({ [key]: value });
    this.showSaved('Appearance settings saved');
  }

  onSecurityChange(key: keyof SecuritySettings, value: any): void {
    (this.security as any)[key] = value;
    this.settingsService.updateSecurity({ [key]: value });
    this.showSaved('Security settings saved');
  }

  resetAll(): void {
    this.settingsService.resetAll();
    this.loadSettings();
    this.showSaved('All settings have been reset');
  }

  confirmDeleteAccount(): void {
    this.showDeleteConfirm = true;
  }

  exportData(): void {
    if (this.exportingData) return;

    this.exportingData = true;
    this.exportedData = null;

    this.userService.exportUserData().subscribe({
      next: (data) => {
        this.exportedData = data;
        this.exportingData = false;
        this.snackBar.open('Data exported successfully!', 'OK', { duration: 3000 });
      },
      error: (err) => {
        this.exportingData = false;
        const message = err?.error?.message || 'Failed to export data. Please try again.';
        this.snackBar.open(message, 'Close', { duration: 4000 });
      }
    });
  }

  downloadExport(): void {
    if (!this.exportedData) return;

    const dataStr = JSON.stringify(this.exportedData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `travelsphere-data-export-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    this.snackBar.open('Download started!', 'OK', { duration: 2000 });
  }

  deleteAccount(): void {
    if (this.deletingAccount) return;

    this.deletingAccount = true;
    this.authService.deleteAccount().subscribe({
      next: () => {
        this.snackBar.open('Account deleted successfully. We\'re sorry to see you go.', 'OK', { duration: 5000 });
        this.deletingAccount = false;
        this.showDeleteConfirm = false;
        this.authService.logout();
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.deletingAccount = false;
        this.showDeleteConfirm = false;
        const message = err?.error?.message || 'Failed to delete account. Please try again.';
        this.snackBar.open(message, 'Close', { duration: 4000 });
      }
    });
  }

  private showSaved(message: string): void {
    this.snackBar.open(message, 'OK', { duration: 2000 });
  }
}
