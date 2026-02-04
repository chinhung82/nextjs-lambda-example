const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Lambda build...');

const requiredFiles = [
  'dist/app.js',
  'dist/app.js.map',
  'dist/package.json',
  'app/lambda/handler.ts',
  'template.yaml',
  'tsconfig.lambda.json'
];

let allGood = true;

requiredFiles.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, '..', file));
  console.log(`${exists ? '✅' : '❌'} ${file}`);
  if (!exists) allGood = false;
});

// Check template.yaml for correct handler
const template = fs.readFileSync(path.join(__dirname, '../template.yaml'), 'utf8');
const hasCorrectHandler = template.includes('Handler: app.handler');
console.log(`${hasCorrectHandler ? '✅' : '❌'} template.yaml has Handler: app.handler`);

if (!hasCorrectHandler) allGood = false;

if (allGood) {
  console.log('\n✅ All checks passed! Ready to build and deploy.');
} else {
  console.log('\n❌ Some checks failed. Please fix before deployment.');
  process.exit(1);
}