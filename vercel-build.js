const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Make the next binary executable
try {
  const nextBinPath = path.join(process.cwd(), 'node_modules', '.bin', 'next');
  if (fs.existsSync(nextBinPath)) {
    fs.chmodSync(nextBinPath, '755');
    console.log('Made next binary executable');
  } else {
    console.log('Next binary not found at:', nextBinPath);
  }
} catch (error) {
  console.error('Error making next binary executable:', error);
}

// Run the next build command
try {
  console.log('Running next build...');
  execSync('node node_modules/next/dist/bin/next build', { stdio: 'inherit' });
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
} 