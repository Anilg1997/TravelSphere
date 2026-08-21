# 📸 Demo Screenshots

This directory contains automated screenshots of the TravelSphere application.

## How to Capture

1. Start the app:
   ```bash
   ./start.sh
   cd frontend/travelsphere-ui && npm install && ng serve
   ```

2. Run the capture script:
   ```bash
   cd docs/demo
   npm init -y
   npm install playwright
   npx playwright install chromium
   node capture-demo.js
   ```

3. Screenshots are saved to `screenshots/` directory.

## Screenshot Files

| File | Description |
|------|-------------|
| `01-landing-page.png` | Home page with hero section |
| `02-flight-search.png` | Flight search form |
| `03-hotel-search.png` | Hotel search form |
| `04-food-restaurants.png` | Food delivery restaurants |
| `05-car-search.png` | Car rental search |
| `06-transport.png` | Transport search |
| `07-insurance.png` | Insurance plans |
| `08-packages.png` | Travel packages |
| `09-ai-agent.png` | AI chat interface |
| `10-ai-trip-planner.png` | Trip planner form |
| `11-nearby-discovery.png` | Nearby discovery map |
| `12-journey-tracker.png` | Journey tracker |
| `13-login.png` | Login page |
| `14-register.png` | Registration page |
| `15-profile.png` | User profile |
| `16-settings.png` | Settings (light mode) |
| `17-settings-dark.png` | Settings (dark mode) |
| `18-bookings.png` | My bookings |
| `19-food-orders.png` | Food order history |
| `20-loyalty.png` | Loyalty points |
| `21-notifications.png` | Notifications |
| `22-admin-dashboard.png` | Admin dashboard |
| `23-admin-users.png` | User management |
| `24-admin-analytics.png` | Analytics |
| `25-notification-panel.png` | Notification dropdown |
| `26-mini-map.png` | Mini-map widget |

## Usage in README

```markdown
![Landing Page](docs/demo/screenshots/01-landing-page.png)
```
