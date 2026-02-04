const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting build process...');

try {
  // Step 1: Run tests
  console.log('📋 Running tests...');
  execSync('yarn test', { stdio: 'inherit' });

  // Step 2: Build Lambda function
  console.log('🔨 Building Lambda function...');
  execSync('yarn build:lambda', { stdio: 'inherit' });

  // Step 3: Create dist directory if it doesn't exist
  const distDir = path.join(__dirname, '../dist');
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  // Step 4: Copy package.json to dist
  const packageJson = require('../package.json');
  const { scripts, devDependencies, ...prodPackage } = packageJson;
  
  prodPackage.dependencies = packageJson.dependencies || {};
  prodPackage.scripts = {
    start: "node handler.js"
  };

  fs.writeFileSync(
    path.join(distDir, 'package.json'),
    JSON.stringify(prodPackage, null, 2)
  );

  console.log('✅ Build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}