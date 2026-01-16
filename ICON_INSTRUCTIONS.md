# Icon Generation Instructions

To make the PWA work properly, you need to create two icon files:

1. `public/icon-192.png` (192x192 pixels)
2. `public/icon-512.png` (512x512 pixels)

## Method 1: Using the HTML Generator (Easiest)

1. Open `public/generate-icons.html` in your web browser
2. Click "Generate & Download 192x192" button
3. Click "Generate & Download 512x512" button
4. Move the downloaded files to the `public/` directory
5. Rename them to `icon-192.png` and `icon-512.png`

## Method 2: Using Online Tools

1. Create or find an image (logo, icon, etc.)
2. Use an online image resizer (like https://www.iloveimg.com/resize-image)
3. Resize to 192x192 and save as `public/icon-192.png`
4. Resize to 512x512 and save as `public/icon-512.png`

## Method 3: Using Image Editing Software

Use Photoshop, GIMP, or any image editor to create the icons at the specified sizes.

## Quick Placeholder (For Testing)

If you just want to test the PWA functionality, you can create simple colored square images:
- Solid color background (#0f172a - dark slate)
- Text "R1T" in amber (#fbbf24)
- Save as PNG format

The icons are required for the PWA to install properly on iOS devices.
