# 🎬 TravelSphere — Demo Recording Script

This document provides a step-by-step script for recording a demo video of the entire TravelSphere application. Follow each section sequentially for a complete walkthrough.

---

## 📋 Pre-Recording Checklist

- [ ] Docker Desktop is running
- [ ] Run `./start.sh` and wait for all services to be healthy (~60s)
- [ ] Run `cd frontend/travelsphere-ui && npm install && ng serve`
- [ ] Open http://localhost:4200 in Chrome (full-screen, 1920×1080)
- [ ] Have a screen recorder running (OBS, Loom, or built-in)
- [ ] Close all notifications / do-not-disturb mode
- [ ] Set browser zoom to 100%

---

## 🎬 Scene 1: Landing Page & Navigation (0:00 – 0:45)

### What to show:
1. **Open the app** → Landing page loads with hero slideshow
2. **Scroll down** → Feature cards (Flights, Hotels, Food, Cars, Insurance, AI)
3. **Point out the stats** → "Trusted by 50K+ travelers"
4. **Show the header** → Navigation links, search icon, Sign In/Sign Up buttons
5. **Show the mini-map widget** → Floating map in bottom-right corner

### Narration script:
> "Welcome to TravelSphere — an AI-powered travel booking platform. This is the landing page with our hero slideshow and feature overview. Notice the floating mini-map widget in the bottom-right corner that shows nearby points of interest. The header has quick access to all services — flights, hotels, food delivery, cars, packages, insurance, and our AI agent."

---

## 🎬 Scene 2: User Registration & Login (0:45 – 1:45)

### What to show:
1. Click **Sign Up** button
2. Fill in registration form:
   - Full Name: `Demo User`
   - Email: `demo@travelsphere.com`
   - Phone: `+91 98765 43210`
   - Password: `Demo@1234`
3. Click **Register** → Redirects to home, user is logged in
4. Show the **header changes** → Profile icon appears, notification bell
5. Click **profile icon** → Show dropdown menu (Profile, Bookings, Food Orders, Loyalty, Wallet, Settings, Admin Panel)
6. Click **Logout**
7. Click **Sign In** → Login with the same credentials
8. Show successful login → Redirected to home

### Narration script:
> "Let's start by creating an account. I'll fill in the registration form with demo details. After registering, you can see the header now shows a profile icon and notification bell. The dropdown menu gives access to profile, bookings, food orders, loyalty points, wallet, settings, and the admin panel. Let me log out and log back in to show the login flow."

---

## 🎬 Scene 3: Flight Search & Booking (1:45 – 3:00)

### What to show:
1. Click **Flights** in the header
2. Search form appears:
   - From: `Mumbai (BOM)`
   - To: `Delhi (DEL)`
   - Date: Select a future date
   - Passengers: 1
3. Click **Search Flights**
4. Show flight results list with prices, airlines, times
5. Click on a flight → Show flight detail page
6. Click **Book Now** → Redirects to booking form
7. Fill in passenger details:
   - Name: `Demo User`
   - Email: `demo@travelsphere.com`
   - Phone: `+91 98765 43210`
   - Seat: `12A`
8. Click **Confirm Booking**
9. Show booking confirmation with reference number

### Narration script:
> "Let's search for flights from Mumbai to Delhi. Here are the available flights with prices and timings. I'll select this one and proceed to book. Filling in passenger details and confirming... We get a booking confirmation with a reference number that can be tracked."

---

## 🎬 Scene 4: Hotel Search & Booking (3:00 – 4:00)

### What to show:
1. Click **Hotels** in the header
2. Search form:
   - City: `Mumbai`
   - Check-in: Select date
   - Check-out: Select date +2
   - Guests: 2
3. Click **Search Hotels**
4. Show hotel results with photos, ratings, prices
5. Click a hotel → Show detail page with amenities
6. Click **Book Room**
7. Fill in guest details and confirm
8. Show booking confirmation

### Narration script:
> "Now let's search for hotels in Mumbai. Here are the available hotels with ratings and prices. This one looks great — let me book it. The booking is confirmed and we get a reference number."

---

## 🎬 Scene 5: Food Delivery (4:00 – 5:30)

### What to show:
1. Click **Food** in the header
2. Show restaurant search page
3. Search by city: `Mumbai` → Show restaurants
4. Click on **Spice Garden** → Show restaurant detail with menu
5. Show menu categories (Starters, Main Course, Breads, Beverages)
6. Add items to cart:
   - Butter Chicken × 1
   - Garlic Naan × 2
   - Mango Lassi × 1
7. Click **Proceed to Order**
8. Fill delivery address: `456 Park Lane, Mumbai`
9. Click **Place Order**
10. Show **Order Tracking** page with animated timeline
11. Show the status steps: Placed → Preparing → On the way → Delivered
12. Click **My Food Orders** → Show order history

### Narration script:
> "TravelSphere also has a full food delivery system. Let me search for restaurants in Mumbai. I'll order from Spice Garden — adding Butter Chicken, Garlic Naan, and a Mango Lassi. After placing the order, we see the real-time tracking page with an animated timeline showing each status step. The order auto-refreshes every 15 seconds to show live updates."

---

## 🎬 Scene 6: Nearby Discovery & Mini-Map (5:30 – 6:30)

### What to show:
1. Click **Nearby** in the header
2. Show the nearby discovery page with a full-page map
3. Click different category buttons: Food, Hotels, Cafes, Shops, Attractions
4. Show markers appearing on the map
5. Click a marker → Show info window with name, rating, address
6. Click **View on Google Maps** link
7. Go back to home page
8. Show the **floating mini-map** widget
9. Click **expand** button → Map expands
10. Show category chips and radius slider
11. Drag the mini-map to a different position
12. Show the **My Location** button centers the map

### Narration script:
> "The Nearby Discovery page shows points of interest on a full-screen map. You can filter by category — food, hotels, cafes, shops, and attractions. Clicking a marker shows details with a link to Google Maps. The floating mini-map widget provides the same functionality from any page — it's draggable, expandable, and has keyboard shortcuts."

---

## 🎬 Scene 7: AI Agent & Trip Planner (6:30 – 7:45)

### What to show:
1. Click **AI Agent** in the header
2. Show the AI chat interface
3. Type: `Plan a 3-day trip to Goa for 2 people with a budget of ₹40,000`
4. Show AI response with itinerary
5. Navigate to **AI Trip Planner**
6. Fill in form:
   - Destination: `Goa`
   - Duration: `3 days`
   - Budget: `40000`
   - Preferences: `beach, adventure, food`
7. Click **Generate Trip Plan**
8. Show the generated itinerary
9. Navigate to **AI Recommendations**
10. Show personalized recommendations

### Narration script:
> "TravelSphere has an AI-powered agent that can help plan trips. I'm asking it to create a 3-day Goa itinerary. The AI generates a detailed plan with activities, restaurants, and budget breakdown. The Trip Planner form provides a more structured way to generate itineraries, and the Recommendations page shows personalized suggestions."

---

## 🎬 Scene 8: Insurance & Packages (7:45 – 8:30)

### What to show:
1. Click **Insurance** in the header
2. Show insurance plans with coverage details
3. Click a plan → Show detail page
4. Click **Purchase** → Show purchase form
5. Navigate to **Packages**
6. Show travel packages with prices
7. Click a package → Show itinerary and inclusions
8. Click **Book Package**

### Narration script:
> "We also offer travel insurance with different coverage tiers. And here are curated travel packages with complete itineraries, accommodations, and activities included."

---

## 🎬 Scene 9: Profile, Settings & Dark Theme (8:30 – 9:30)

### What to show:
1. Click **Profile** from the dropdown
2. Show profile page with user info, loyalty points, referrals
3. Click **Settings**
4. Show settings tabs: Notifications, Privacy, Appearance, Security
5. Click **Appearance** tab
6. Toggle **Dark Mode** → Show the entire app in dark theme
7. Scroll through different pages to show dark theme consistency
8. Switch back to **Light Mode**
9. Go to **Security** tab
10. Show **Change Password** and **Change Email** forms
11. Show **Export Data** button
12. Click **Export Data** → Show JSON preview and download option

### Narration script:
> "The profile page shows loyalty points, trip history, and referrals. In Settings, you can manage notifications, privacy, appearance, and security. Let me switch to dark mode — notice how the entire application updates. You can also change your password, email, and export all your personal data."

---

## 🎬 Scene 10: Notifications (9:30 – 10:00)

### What to show:
1. Click the **notification bell** in the header
2. Show the notification dropdown panel
3. Show the **Live** status indicator (green dot)
4. Show notifications with different types (booking, payment, system)
5. Click a notification → Mark as read
6. Click **Mark all as read** button
7. Click **View all notifications** → Full notifications page

### Narration script:
> "The notification panel shows real-time alerts with a live connection indicator. Different notification types have color-coded icons. You can mark individual notifications as read or mark all at once."

---

## 🎬 Scene 11: Admin Panel (10:00 – 11:00)

### What to show:
1. Click **Admin Panel** from the profile dropdown
2. Show admin dashboard with stats cards (Total Users, Bookings, Revenue, Active Alerts)
3. Navigate to **User Management** → Show user table with search
4. Navigate to **Booking Management** → Show booking table
5. Navigate to **Analytics** → Show charts and graphs
6. Navigate to **Fraud Alerts** → Show alert cards
7. Navigate to **Support Tickets** → Show ticket list
8. Navigate to **System Health** → Show service health status
9. Navigate to **n8n Workflows** → Show webhook configuration

### Narration script:
> "The admin panel provides a complete dashboard for managing the platform. Here we see key metrics, user management, booking oversight, analytics charts, fraud detection, support tickets, system health monitoring, and n8n workflow configuration."

---

## 🎬 Scene 12: Closing & Architecture Overview (11:00 – 11:30)

### What to show:
1. Navigate back to the **home page**
2. Show the complete header with all navigation
3. Open **Docker Desktop** → Show all running containers
4. Show the **Eureka dashboard** at localhost:8761 → Show all registered services
5. Show the **Swagger UI** at localhost:8080/swagger-ui.html
6. Return to the app for final shot

### Narration script:
> "Behind the scenes, TravelSphere runs on 17 microservices orchestrated with Docker Compose. Here's the Eureka dashboard showing all registered services, and the Swagger UI with complete API documentation. The entire platform is built with Spring Boot, Angular, PostgreSQL, Kafka, Redis, and Google Maps integration."

---

## 🎬 Post-Recording

### Upload to YouTube:
1. Upload the video to YouTube (unlisted or public)
2. Copy the YouTube video URL
3. Update the README badge:
   ```markdown
   [![Demo Video](https://img.shields.io/badge/▶_Watch_Demo-FF0000?style=for-the-badge&logo=youtube&logoColor=white)](YOUR_YOUTUBE_URL)
   ```

### Create GIF snippets:
Use [LICEcap](https://www.cockos.com/licecap/) or [ScreenToGif](https://www.screentogif.com/) to create short GIF clips:
- Registration flow (5s)
- Flight search (5s)
- Food ordering (5s)
- Dark theme toggle (3s)
- AI trip planner (5s)

Save them in a `docs/demo/` folder.

---

## 📝 Quick Version (2 minutes)

If you need a shorter demo, follow this condensed script:

| Time | Feature |
|------|---------|
| 0:00–0:15 | Landing page + mini-map |
| 0:15–0:30 | Register + Login |
| 0:30–0:50 | Flight search + booking |
| 0:50–1:10 | Food delivery + order tracking |
| 1:10–1:25 | AI trip planner |
| 1:25–1:35 | Dark theme toggle |
| 1:35–1:45 | Nearby discovery map |
| 1:45–2:00 | Admin panel overview |
