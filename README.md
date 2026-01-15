# 🚗 R1T Southern Coast Expedition Planner

An interactive trip planner for the ultimate Rivian R1T road trip from Jersey City to Cape Lookout.

**Live Demo:** `https://YOUR_USERNAME.github.io/r1t-expedition`

![Preview](https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800)

## ✨ Features

- 📋 Interactive pre-trip checklist
- ⛺ Campsite selector with 3 beautiful options per night
- 🗺️ Day-by-day timeline with must-visit checkpoints
- ⚡ Tesla Supercharger optimization (off-peak savings!)
- 📞 Emergency contacts
- 📱 Fully responsive design

## 🚀 Quick Deploy to GitHub Pages

## 🌟 Trip Highlights

The R1T Southern Coast Expedition offers a unique blend of adventure and luxury, making it the perfect choice for road trippers. Here are some highlights:

- **Stunning Coastal Views:** Experience breathtaking scenery along the southern coast, with picturesque stops that showcase nature's beauty.
- **Tailored for the R1T:** The R1T is designed for off-road capabilities, ensuring a smooth ride on diverse terrains, from sandy beaches to rugged trails.
- **Sustainable Travel:** Enjoy eco-friendly travel with the R1T's electric powertrain, reducing your carbon footprint while exploring.
- **Comfort and Convenience:** With ample storage and advanced technology, the R1T provides a comfortable journey for all passengers.

This trip is not just about reaching a destination; it's about the journey itself, and the R1T is the perfect vehicle to make it unforgettable.

### Step 1: Create GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. Name it `r1t-expedition` (or whatever you prefer)
3. Make it **Public**
4. Click **Create repository**

### Step 2: Upload Files

**Option A: Using GitHub Web Interface (Easiest)**

1. In your new repo, click **"uploading an existing file"**
2. Drag and drop ALL files from this folder
3. Click **Commit changes**

**Option B: Using Git Command Line**

```bash
cd r1t-expedition-github
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/r1t-expedition.git
git push -u origin main
```

### Step 3: Update Homepage URL

1. Open `package.json`
2. Change this line:
   ```json
   "homepage": "https://YOUR_GITHUB_USERNAME.github.io/r1t-expedition"
   ```
   Replace `YOUR_GITHUB_USERNAME` with your actual GitHub username.

### Step 4: Deploy

**Option A: Local Deploy (Recommended)**

```bash
# Install dependencies
npm install

# Deploy to GitHub Pages
npm run deploy
```

**Option B: GitHub Actions (Automatic)**

Create `.github/workflows/deploy.yml` with the content from the GITHUB_ACTIONS.yml file in this folder.

### Step 5: Enable GitHub Pages

1. Go to your repo → **Settings** → **Pages**
2. Under "Source", select **gh-pages** branch
3. Click **Save**
4. Wait 2-3 minutes for deployment

### 🎉 Done!

Your site will be live at:
```
https://YOUR_USERNAME.github.io/r1t-expedition
```

## 📁 Project Structure

```
r1t-expedition-github/
├── public/
│   └── index.html          # HTML template
├── src/
│   ├── index.js            # React entry point
│   ├── index.css           # Tailwind CSS
│   └── ExpeditionPlanner.jsx  # Main component
├── package.json            # Dependencies & scripts
├── tailwind.config.js      # Tailwind configuration
├── postcss.config.js       # PostCSS configuration
└── README.md               # This file
```

## 🛠️ Local Development

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

## 📱 Share Your Trip

Once deployed, share the URL with friends and family:
- They can view the full itinerary
- Track their own checklist progress (stored locally)
- Select campsites together

---

**Safe travels! Leave no trace. Adventure awaits. 🏔️**
