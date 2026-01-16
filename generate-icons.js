// Simple script to generate PWA icons
// Run with: node generate-icons.js
// Requires: npm install canvas (or use browser-based generator)

const fs = require('fs');
const path = require('path');

// For now, create a simple SVG-based icon that browsers can use
// Note: For production, you should use actual PNG files

const createIconSVG = (size) => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#0f172a"/>
  <text x="50%" y="45%" font-family="Arial, sans-serif" font-size="${size * 0.3}" font-weight="bold" fill="#fbbf24" text-anchor="middle" dominant-baseline="middle">R1T</text>
  <text x="50%" y="60%" font-family="Arial, sans-serif" font-size="${size * 0.1}" fill="#fbbf24" text-anchor="middle" dominant-baseline="middle">EXPEDITION</text>
</svg>`;
};

// Create SVG icons (browsers can use these, but PNG is preferred)
const icon192 = createIconSVG(192);
const icon512 = createIconSVG(512);

fs.writeFileSync(path.join(__dirname, 'public', 'icon-192.svg'), icon192);
fs.writeFileSync(path.join(__dirname, 'public', 'icon-512.svg'), icon512);

console.log('SVG icons created. For production, convert these to PNG format.');
console.log('You can use the generate-icons.html file in the browser to create PNG files.');
