const { execSync } = require('child_process');

console.log('🚀 Starting deployment process...');

try {
  // Step 1: Build
  console.log('📦 Building application...');
  execSync('node scripts/build.js', { stdio: 'inherit' });

  // Step 2: SAM deployment
  console.log('☁️  Deploying with SAM...');
  execSync('sam deploy --guided', { stdio: 'inherit' });

  console.log('✅ Deployment completed successfully!');
} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
}