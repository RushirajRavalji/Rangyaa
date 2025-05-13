const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Function to make a file executable
const makeExecutable = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.chmodSync(filePath, 0o755); // Using octal notation for permissions
      console.log(`Made ${filePath} executable`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error setting permissions for ${filePath}:`, error);
    return false;
  }
};

// Paths to check and make executable
const binariesToFix = [
  path.join(process.cwd(), 'node_modules', '.bin', 'next'),
  path.join(process.cwd(), 'node_modules', 'next/dist/bin/next')
];

// Make binaries executable
binariesToFix.forEach(makeExecutable);

// Run the build command with explicit node execution
try {
  console.log('Running next build...');
  // Using direct path to next/dist/bin/next
  execSync('node node_modules/next/dist/bin/next build', {
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
  });
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}