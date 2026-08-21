/**
 * TravelSphere — Automated Demo Screenshot Capture
 *
 * Prerequisites:
 *   cd frontend/travelsphere-ui && npm install && ng serve
 *   (in another terminal)
 *
 * Usage:
 *   cd docs/demo
 *   npm init -y && npm install playwright
 *   node capture-demo.js
 *
 * This script captures screenshots of every key page for use in the
 * README, demo video thumbnail, and GitHub repository showcase.
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'http://localhost:4200';
const SCREENSHOT_DIR = path.join(__dirname, 'screenshots');

async function captureDemo() {
  // Ensure output directory exists
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 2,
  });

  const page = await context.newPage();

  console.log('🎬 TravelSphere Demo Screenshot Capture');
  console.log('========================================\n');

  const screenshots = [
    // ── Public Pages ────────────────────────────────────────
    {
      name: '01-landing-page',
      url: '/home',
      description: 'Landing page with hero section and feature cards',
    },
    {
      name: '02-flight-search',
      url: '/flights',
      description: 'Flight search form',
    },
    {
      name: '03-hotel-search',
      url: '/hotels',
      description: 'Hotel search form',
    },
    {
      name: '04-food-restaurants',
      url: '/food',
      description: 'Food delivery restaurant listing',
    },
    {
      name: '05-car-search',
      url: '/cars',
      description: 'Car rental search',
    },
    {
      name: '06-transport',
      url: '/transport',
      description: 'Transport search',
    },
    {
      name: '07-insurance',
      url: '/insurance',
      description: 'Insurance plans listing',
    },
    {
      name: '08-packages',
      url: '/packages',
      description: 'Travel packages',
    },
    {
      name: '09-ai-agent',
      url: '/ai/agent',
      description: 'AI chat agent interface',
    },
    {
      name: '10-ai-trip-planner',
      url: '/ai/plan-trip',
      description: 'AI trip planner form',
    },
    {
      name: '11-nearby-discovery',
      url: '/nearby',
      description: 'Nearby discovery map',
    },
    {
      name: '12-journey-tracker',
      url: '/journey-tracker',
      description: 'Journey tracker with live map',
    },
    {
      name: '13-login',
      url: '/login',
      description: 'Login page',
    },
    {
      name: '14-register',
      url: '/register',
      description: 'Registration page',
    },
  ];

  const authScreenshots = [
    // ── Authenticated Pages ─────────────────────────────────
    {
      name: '15-profile',
      url: '/profile',
      description: 'User profile page',
    },
    {
      name: '16-settings',
      url: '/settings',
      description: 'Settings page with tabs',
    },
    {
      name: '17-settings-dark',
      url: '/settings',
      description: 'Settings in dark mode',
      darkMode: true,
    },
    {
      name: '18-bookings',
      url: '/bookings',
      description: 'My bookings page',
    },
    {
      name: '19-food-orders',
      url: '/food/orders',
      description: 'Food order history',
    },
    {
      name: '20-loyalty',
      url: '/loyalty',
      description: 'Loyalty points page',
    },
    {
      name: '21-notifications',
      url: '/notifications',
      description: 'Notifications page',
    },
    {
      name: '22-admin-dashboard',
      url: '/admin',
      description: 'Admin dashboard',
    },
    {
      name: '23-admin-users',
      url: '/admin/users',
      description: 'Admin user management',
    },
    {
      name: '24-admin-analytics',
      url: '/admin/analytics',
      description: 'Admin analytics',
    },
  ];

  let captured = 0;
  let failed = 0;

  // Capture public pages
  for (const shot of screenshots) {
    try {
      console.log(`📸 Capturing: ${shot.name} — ${shot.description}`);
      await page.goto(`${BASE_URL}${shot.url}`, {
        waitUntil: 'networkidle',
        timeout: 15000,
      });
      await page.waitForTimeout(1000); // Let animations complete
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, `${shot.name}.png`),
        fullPage: false,
      });
      captured++;
    } catch (err) {
      console.log(`  ⚠️  Failed: ${err.message}`);
      failed++;
    }
  }

  // Register a demo user for authenticated pages
  console.log('\n🔐 Creating demo user for authenticated pages...');
  try {
    await page.goto(`${BASE_URL}/register`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(500);

    // Fill registration form (adapt selectors as needed)
    const fullNameInput = page.locator('input[formcontrolname="fullName"]');
    if (await fullNameInput.isVisible()) {
      await fullNameInput.fill('Demo User');
      await page.locator('input[formcontrolname="email"]').fill('demo@travelsphere.com');
      await page.locator('input[formcontrolname="phone"]').fill('+91 98765 43210');
      await page.locator('input[formcontrolname="password"]').fill('Demo@1234');
      await page.locator('button[type="submit"]').click();
      await page.waitForTimeout(2000);
      console.log('  ✅ Demo user registered');
    }
  } catch (err) {
    console.log(`  ⚠️  Registration failed: ${err.message}`);
  }

  // Capture authenticated pages
  for (const shot of authScreenshots) {
    try {
      console.log(`📸 Capturing: ${shot.name} — ${shot.description}`);

      if (shot.darkMode) {
        // Enable dark mode before navigating
        await page.evaluate(() => {
          document.documentElement.classList.add('dark-theme');
          localStorage.setItem('travelsphere_settings', JSON.stringify({
            notifications: {},
            privacy: {},
            appearance: { theme: 'dark', language: 'en', currency: 'INR', compactMode: false },
            security: {},
          }));
        });
      }

      await page.goto(`${BASE_URL}${shot.url}`, {
        waitUntil: 'networkidle',
        timeout: 15000,
      });
      await page.waitForTimeout(1000);
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, `${shot.name}.png`),
        fullPage: false,
      });
      captured++;

      // Reset dark mode for next screenshot
      if (shot.darkMode) {
        await page.evaluate(() => {
          document.documentElement.classList.remove('dark-theme');
        });
      }
    } catch (err) {
      console.log(`  ⚠️  Failed: ${err.message}`);
      failed++;
    }
  }

  // Capture header notification panel
  try {
    console.log('📸 Capturing: 25-notification-panel — Notification dropdown');
    await page.goto(`${BASE_URL}/home`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(1000);
    const notifButton = page.locator('button:has(mat-icon:text("notifications"))').first();
    if (await notifButton.isVisible()) {
      await notifButton.click();
      await page.waitForTimeout(500);
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, '25-notification-panel.png'),
        fullPage: false,
      });
      captured++;
    }
  } catch (err) {
    console.log(`  ⚠️  Failed: ${err.message}`);
    failed++;
  }

  // Capture mini-map expanded
  try {
    console.log('📸 Capturing: 26-mini-map — Mini-map widget expanded');
    await page.goto(`${BASE_URL}/home`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(1000);
    const mapToggle = page.locator('.mini-map-toggle').first();
    if (await mapToggle.isVisible()) {
      await mapToggle.click();
      await page.waitForTimeout(1500);
      const expandBtn = page.locator('.mini-map-btn:has(mat-icon:text("fullscreen"))').first();
      if (await expandBtn.isVisible()) {
        await expandBtn.click();
        await page.waitForTimeout(1000);
      }
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, '26-mini-map.png'),
        fullPage: false,
      });
      captured++;
    }
  } catch (err) {
    console.log(`  ⚠️  Failed: ${err.message}`);
    failed++;
  }

  await browser.close();

  console.log('\n========================================');
  console.log(`✅ Captured: ${captured} screenshots`);
  if (failed > 0) console.log(`⚠️  Failed: ${failed} screenshots`);
  console.log(`📁 Output: ${SCREENSHOT_DIR}`);
  console.log('\nUse these screenshots in your README:');
  console.log('![Landing Page](docs/demo/screenshots/01-landing-page.png)');
}

captureDemo().catch(console.error);
