const fs = require('fs');
const path = require('path');

// Create the directory if it doesn't exist
const bannerDir = path.join(__dirname, '..', 'public', 'images', 'banners');
if (!fs.existsSync(bannerDir)) {
  fs.mkdirSync(bannerDir, { recursive: true });
}

// Since we can't use node-canvas in this environment, we'll create simple SVG files
// which can be directly used as images
const generatePlaceholderImage = (name, color, width, height) => {
  const svg = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="${color}"/>
  <text x="50%" y="45%" font-family="Arial" font-size="32" fill="white" text-anchor="middle" dominant-baseline="middle" font-weight="bold" style="text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">Nikhil's Jeans</text>
  <text x="50%" y="55%" font-family="Arial" font-size="18" fill="white" text-anchor="middle" dominant-baseline="middle">${name}</text>
  <text x="50%" y="65%" font-family="Arial" font-size="14" fill="white" text-anchor="middle" dominant-baseline="middle">${width}x${height}</text>
</svg>`;

  const filePath = path.join(bannerDir, `${name.toLowerCase().replace(/\s+/g, '-')}.svg`);
  fs.writeFileSync(filePath, svg);
  console.log(`Created placeholder SVG: ${filePath}`);
};

// Generate placeholder images
const banners = [
  { name: 'Banner 1', color: '#3b82f6', width: 1200, height: 400 },
  { name: 'Banner 2', color: '#10b981', width: 1200, height: 400 },
  { name: 'Banner 3', color: '#f59e0b', width: 1200, height: 400 },
  { name: 'Banner 4', color: '#ef4444', width: 1200, height: 400 },
  { name: 'Banner 5', color: '#8b5cf6', width: 1200, height: 400 },
];

// Create a README file with instructions
const readmeContent = `
# Banner Placeholder Images

This directory contains placeholder SVG files for banners.

To convert these SVG files to actual images:
1. Open each SVG file in a browser
2. Take a screenshot of the page
3. Save the screenshot as a JPG or PNG with the same name (e.g., banner-1.jpg)

Or use a tool like html2canvas or a screenshot service to automate this process.
`;

fs.writeFileSync(path.join(bannerDir, 'README.md'), readmeContent);
console.log('Created README.md with instructions');

// Generate all banner placeholders
banners.forEach(banner => {
  generatePlaceholderImage(banner.name, banner.color, banner.width, banner.height);
});

// Update the paths in the code
const updateBannerPaths = () => {
  const filePath = path.join(__dirname, '..', 'pages', 'admin', 'banners-client.tsx');
  
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Update the paths to use the SVG files
    banners.forEach((banner, index) => {
      const svgPath = `/images/banners/${banner.name.toLowerCase().replace(/\s+/g, '-')}.svg`;
      const searchPattern = new RegExp(`id: 'banner${index + 1}', src: '[^']*'`);
      content = content.replace(searchPattern, `id: 'banner${index + 1}', src: '${svgPath}'`);
    });
    
    fs.writeFileSync(filePath, content);
    console.log('Updated banner paths in banners-client.tsx');
  } else {
    console.log('banners-client.tsx not found, skipping path updates');
  }
};

updateBannerPaths();

console.log('All placeholder banners created successfully!'); 