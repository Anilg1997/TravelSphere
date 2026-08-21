export interface NotificationSettings {
  emailBookings: boolean;
  emailPromotions: boolean;
  emailNewsletter: boolean;
  pushBookings: boolean;
  pushPromotions: boolean;
  pushNearbyAlerts: boolean;
  smsBookings: boolean;
  smsSecurity: boolean;
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'contacts';
  showEmail: boolean;
  showPhone: boolean;
  allowLocationSharing: boolean;
  showOnlineStatus: boolean;
}

export interface AppearanceSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  currency: string;
  compactMode: boolean;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  loginNotifications: boolean;
  sessionTimeout: number; // minutes
}

export interface UserSettings {
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  appearance: AppearanceSettings;
  security: SecuritySettings;
}

export const DEFAULT_SETTINGS: UserSettings = {
  notifications: {
    emailBookings: true,
    emailPromotions: false,
    emailNewsletter: false,
    pushBookings: true,
    pushPromotions: false,
    pushNearbyAlerts: true,
    smsBookings: false,
    smsSecurity: true,
  },
  privacy: {
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    allowLocationSharing: true,
    showOnlineStatus: true,
  },
  appearance: {
    theme: 'system',
    language: 'en',
    currency: 'USD',
    compactMode: false,
  },
  security: {
    twoFactorEnabled: false,
    loginNotifications: true,
    sessionTimeout: 30,
  },
};
