import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/home' },

  // Auth
  { path: 'login', loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent) },
  { path: 'enable-location', loadComponent: () => import('./components/location-permission/location-permission.component').then(m => m.LocationPermissionComponent) },

  // Main
  { path: 'home', loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) },
  { path: 'search', loadComponent: () => import('./pages/search/search.component').then(m => m.SearchComponent) },

  // Flights
  { path: 'flights', loadComponent: () => import('./pages/flights/flight-search/flight-search.component').then(m => m.FlightSearchComponent) },
  { path: 'flights/:id', loadComponent: () => import('./pages/flights/flight-detail/flight-detail.component').then(m => m.FlightDetailComponent) },
  { path: 'flights/:id/book', loadComponent: () => import('./pages/flights/flight-booking/flight-booking.component').then(m => m.FlightBookingComponent), canActivate: [authGuard] },

  // Hotels
  { path: 'hotels', loadComponent: () => import('./pages/hotels/hotel-search/hotel-search.component').then(m => m.HotelSearchComponent) },
  { path: 'hotels/:id', loadComponent: () => import('./pages/hotels/hotel-detail/hotel-detail.component').then(m => m.HotelDetailComponent) },
  { path: 'hotels/:id/book', loadComponent: () => import('./pages/hotels/hotel-booking/hotel-booking.component').then(m => m.HotelBookingComponent), canActivate: [authGuard] },

  // Cars
  { path: 'cars', loadComponent: () => import('./pages/cars/car-search/car-search.component').then(m => m.CarSearchComponent) },
  { path: 'cars/:id/book', loadComponent: () => import('./pages/cars/car-booking/car-booking.component').then(m => m.CarBookingComponent), canActivate: [authGuard] },

  // Transport
  { path: 'transport', loadComponent: () => import('./pages/transport/transport-search/transport-search.component').then(m => m.TransportSearchComponent) },
  { path: 'transport/booking/:ref', loadComponent: () => import('./pages/transport/transport-booking/transport-booking.component').then(m => m.TransportBookingComponent), canActivate: [authGuard] },

  // Insurance
  { path: 'insurance', loadComponent: () => import('./pages/insurance/insurance-list/insurance-list.component').then(m => m.InsuranceListComponent) },
  { path: 'insurance/purchase', loadComponent: () => import('./pages/insurance/insurance-purchase/insurance-purchase.component').then(m => m.InsurancePurchaseComponent), canActivate: [authGuard] },
  { path: 'insurance/claims', loadComponent: () => import('./pages/insurance/insurance-claims/insurance-claims.component').then(m => m.InsuranceClaimsComponent), canActivate: [authGuard] },

  // Packages
  { path: 'packages', loadComponent: () => import('./pages/packages/package-list/package-list.component').then(m => m.PackageListComponent) },
  { path: 'packages/:id', loadComponent: () => import('./pages/packages/package-detail/package-detail.component').then(m => m.PackageDetailComponent) },
  { path: 'packages/:id/book', loadComponent: () => import('./pages/packages/package-booking/package-booking.component').then(m => m.PackageBookingComponent), canActivate: [authGuard] },

  // Payments
  { path: 'payments', loadComponent: () => import('./pages/payments/payment-init/payment-init.component').then(m => m.PaymentInitComponent), canActivate: [authGuard] },
  { path: 'payments/confirm/:ref', loadComponent: () => import('./pages/payments/payment-confirm/payment-confirm.component').then(m => m.PaymentConfirmComponent), canActivate: [authGuard] },
  { path: 'wallet', loadComponent: () => import('./pages/payments/wallet/wallet.component').then(m => m.WalletComponent), canActivate: [authGuard] },

  // AI Agent
  { path: 'ai/chat', loadComponent: () => import('./pages/ai/ai-chat/ai-chat.component').then(m => m.AiChatComponent) },
  { path: 'ai/agent', loadComponent: () => import('./pages/ai/ai-agent/ai-agent.component').then(m => m.AiAgentComponent) },
  { path: 'ai/plan-trip', loadComponent: () => import('./pages/ai/trip-planner/trip-planner.component').then(m => m.TripPlannerComponent) },
  { path: 'ai/recommendations', loadComponent: () => import('./pages/ai/recommendations/recommendations.component').then(m => m.RecommendationsComponent), canActivate: [authGuard] },

  // Journey Tracker
  { path: 'journey-tracker', loadComponent: () => import('./pages/journey/journey-tracker.component').then(m => m.JourneyTrackerComponent) },

  // User
  { path: 'profile', loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent), canActivate: [authGuard] },
  { path: 'bookings', loadComponent: () => import('./pages/profile/bookings/bookings.component').then(m => m.BookingsComponent), canActivate: [authGuard] },
  { path: 'loyalty', loadComponent: () => import('./pages/profile/loyalty/loyalty.component').then(m => m.LoyaltyComponent), canActivate: [authGuard] },
  { path: 'referrals', loadComponent: () => import('./pages/profile/referrals/referrals.component').then(m => m.ReferralsComponent), canActivate: [authGuard] },

  // Notifications
  { path: 'notifications', loadComponent: () => import('./pages/notifications/notifications.component').then(m => m.NotificationsComponent), canActivate: [authGuard] },

  // Documents
  { path: 'documents', loadComponent: () => import('./pages/documents/documents.component').then(m => m.DocumentsComponent), canActivate: [authGuard] },

  // Admin
  { path: 'admin', loadComponent: () => import('./pages/admin/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent), canActivate: [authGuard] },
  { path: 'admin/users', loadComponent: () => import('./pages/admin/user-management/user-management.component').then(m => m.UserManagementComponent), canActivate: [authGuard] },
  { path: 'admin/bookings', loadComponent: () => import('./pages/admin/booking-management/booking-management.component').then(m => m.BookingManagementComponent), canActivate: [authGuard] },
  { path: 'admin/analytics', loadComponent: () => import('./pages/admin/analytics/analytics.component').then(m => m.AnalyticsComponent), canActivate: [authGuard] },
  { path: 'admin/fraud-alerts', loadComponent: () => import('./pages/admin/fraud-alerts/fraud-alerts.component').then(m => m.FraudAlertsComponent), canActivate: [authGuard] },
  { path: 'admin/tickets', loadComponent: () => import('./pages/admin/support-tickets/support-tickets.component').then(m => m.SupportTicketsComponent), canActivate: [authGuard] },
  { path: 'admin/system-health', loadComponent: () => import('./pages/admin/system-health/system-health.component').then(m => m.SystemHealthComponent), canActivate: [authGuard] },

  { path: '**', redirectTo: '/home' },
];
