const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Building Lambda function...');

// Clean directories
const distDir = path.join(__dirname, '../dist');
const distCompiledDir = path.join(__dirname, '../dist-compiled');

[distDir, distCompiledDir].forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`Cleaning ${dir}...`);
    fs.rmSync(dir, { recursive: true });
  }
  fs.mkdirSync(dir, { recursive: true });
});

try {
  // Step 1: TypeScript compilation
  console.log('📝 Compiling TypeScript with tsconfig.lambda.json...');
  execSync('npx tsc --project tsconfig.lambda.json', { stdio: 'inherit' });
  
  // Check if handler.js was created
  const compiledHandlerPath = path.join(distCompiledDir, 'handler.js');
  if (!fs.existsSync(compiledHandlerPath)) {
    throw new Error(`Compilation failed: ${compiledHandlerPath} not found`);
  }
  console.log('✅ TypeScript compilation successful');

  // Step 2: Bundle with esbuild
  console.log('📦 Bundling with esbuild...');
  execSync(
    'npx esbuild ./dist-compiled/handler.js --bundle --platform=node --target=node22 --outfile=./dist/app.js --sourcemap',
    { stdio: 'inherit' }
  );

  // Step 3: Create minimal package.json for Lambda
  console.log('📄 Creating package.json for Lambda...');
  const packageJson = require('../package.json');
  
  const lambdaPackageJson = {
    name: packageJson.name + '-lambda',
    version: packageJson.version,
    private: true,
    main: 'app.js',
    dependencies: {
      // Only include actual runtime dependencies
      // Remove Next.js/React since they're not needed in Lambda
      ...(packageJson.dependencies || {})
    },
    engines: {
      node: '>=20'
    }
  };

  // Remove Next.js/React from Lambda dependencies (not needed)
  delete lambdaPackageJson.dependencies.next;
  delete lambdaPackageJson.dependencies.react;
  delete lambdaPackageJson.dependencies['react-dom'];
  delete lambdaPackageJson.dependencies['@types/react'];
  delete lambdaPackageJson.dependencies['@types/react-dom'];

  fs.writeFileSync(
    path.join(distDir, 'package.json'),
    JSON.stringify(lambdaPackageJson, null, 2)
  );

  // Step 4: Verify the build
  console.log('🔍 Verifying build...');
  const appJsPath = path.join(distDir, 'app.js');
  const appMapPath = path.join(distDir, 'app.js.map');
  
  if (!fs.existsSync(appJsPath)) {
    throw new Error('app.js not created');
  }
  if (!fs.existsSync(appMapPath)) {
    throw new Error('app.js.map not created');
  }

  const stats = fs.statSync(appJsPath);
  console.log(`📊 Build size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
  
  console.log('\n✅ Lambda built successfully!');
  console.log('📁 Output structure:');
  console.log('  dist/');
  console.log('  ├── app.js');
  console.log('  ├── app.js.map');
  console.log('  └── package.json');
  console.log('\n🚀 Ready for SAM deployment!');

} catch (error) {
  console.error('\n❌ Build failed:', error.message);
  process.exit(1);
}