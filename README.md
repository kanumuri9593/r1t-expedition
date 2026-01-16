# 🚗 R1T Southern Coast Expedition Planner

A beautiful, interactive Progressive Web App (PWA) for planning and tracking your ultimate Rivian R1T road trip from Jersey City to Cape Lookout. Perfect for iPhone installation and offline use during your adventure.

## 🌐 Live App

**[👉 View Live App on GitHub Pages](https://kanumuri9593.github.io/r1t-expedition)**

![Preview](https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800)

## 🌟 What This App Does

Plan, track, and navigate your 5-day, 1,400+ mile R1T expedition with:
- **Real-time location tracking** with proximity alerts
- **Day-by-day itinerary** with detailed checkpoints and timing
- **Interactive checklist** to ensure you're fully prepared
- **Campsite selection** with beautiful options for each night
- **Offline functionality** - works without internet once installed
- **Copy-to-clipboard** for easy sharing of checkpoint details

## ✨ Key Features

### 🗺️ Road Trip Itinerary
- **5-day detailed timeline** with checkpoints, times, and descriptions
- **Tesla Supercharger optimization** with off-peak savings tips
- **Must-visit highlights** clearly marked
- **Pro tips** for each day
- **Copy checkpoint details** with one click

### 📍 Smart Location Features
- **Proximity alerts** when within 10 miles of itinerary checkpoints
- **Nearby attractions** notifications for must-visit places (within 5 miles)
- **Real-time location tracking** with permission-based access
- **Distance calculations** using GPS coordinates

### ⛺ Campsite Selection
- **3 beautiful options** for each of the 4 nights
- **Detailed descriptions** with ratings, prices, and features
- **Visual selection** with stunning imagery
- **Track your choices** across the trip

### 📋 Pre-Trip Checklist
- **4 organized categories**: Permits, Recovery Gear, Camping Essentials, Documents & Tech
- **Progress tracking** with visual completion indicators
- **Critical items** clearly marked
- **Local storage** - your progress is saved

### 📱 Progressive Web App (PWA)
- **Install on iPhone** - Add to home screen for app-like experience
- **Offline support** - Works without internet connection
- **Service worker caching** - Fast loading and offline access
- **Native app feel** - Standalone mode with custom icons

### 🎨 Beautiful Design
- **Modern, dark theme** optimized for road trips
- **Fully responsive** - Works on phone, tablet, and desktop
- **Smooth animations** and transitions
- **Intuitive navigation** with clear sections

## 🚀 Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm start

# The app will open at http://localhost:3000
```

### Deploy to GitHub Pages

1. Update `package.json` with your GitHub username:
   ```json
   "homepage": "https://YOUR_USERNAME.github.io/r1t-expedition"
   ```

2. Deploy:
   ```bash
   npm run deploy
   ```

3. Enable GitHub Pages in your repo settings (gh-pages branch)

## 📱 Install on iPhone

1. Open the app in **Safari** on your iPhone
2. Tap the **Share** button (square with arrow)
3. Scroll down and tap **"Add to Home Screen"**
4. Customize the name if desired
5. Tap **"Add"**
6. The app will now appear on your home screen and work offline!

### Generate App Icons

Before deploying, create the required icon files:

1. Open `public/generate-icons.html` in your browser
2. Click buttons to generate and download `icon-192.png` and `icon-512.png`
3. Place both files in the `public/` directory

See `ICON_INSTRUCTIONS.md` for detailed instructions.

## 🗺️ Trip Overview

**Route:** Jersey City → Front Royal, VA → Outer Banks, NC → Cape Lookout → Mount Airy, NC → Home

**Highlights:**
- Skyline Drive through Shenandoah National Park
- Outer Banks beach driving
- Cape Lookout barrier island (roadless!)
- Pilot Mountain State Park
- Wild horses, lighthouses, and pristine beaches

**Duration:** 5 days | **Distance:** 1,400+ miles | **States:** 3 (NJ, VA, NC)

## 🛠️ Tech Stack

- **React** - UI framework
- **Tailwind CSS** - Styling
- **Progressive Web App** - Offline support and installation
- **Geolocation API** - Location tracking
- **Service Workers** - Caching and offline functionality
- **Local Storage** - Progress persistence

## 📁 Project Structure

```
r1t-expedition/
├── public/
│   ├── index.html              # HTML template with PWA meta tags
│   ├── manifest.json           # PWA manifest
│   ├── service-worker.js       # Offline caching
│   └── generate-icons.html     # Icon generator tool
├── src/
│   ├── index.js                # React entry + service worker registration
│   ├── index.css               # Tailwind CSS
│   └── ExpeditionPlanner.jsx   # Main component
├── package.json
├── tailwind.config.js
└── README.md
```

## 🎯 Usage Tips

- **Enable location** for proximity alerts and nearby attractions
- **Copy checkpoints** to share with travel companions
- **Track progress** by checking off completed items
- **Select campsites** before your trip for better planning
- **Install as PWA** for the best mobile experience

## 📝 Notes

- Location features require **HTTPS** (or localhost for development)
- Service worker requires **HTTPS** for production
- Icons must be **PNG format** for proper PWA installation
- All data is stored **locally** in your browser

---

**Built for adventure. Safe travels! 🏔️**
