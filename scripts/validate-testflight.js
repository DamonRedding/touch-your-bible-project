#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating TestFlight readiness...\n');

const checks = [
  {
    name: 'EAS Configuration',
    check: () => fs.existsSync('eas.json'),
    fix: 'Run: eas build:configure'
  },
  {
    name: 'App Configuration',
    check: () => {
      const configPath = 'app.config.ts';
      if (!fs.existsSync(configPath)) return false;
      const content = fs.readFileSync(configPath, 'utf8');
      return content.includes('bundleIdentifier') && content.includes('buildNumber');
    },
    fix: 'Update app.config.ts with proper iOS configuration'
  },
  {
    name: 'Camera Permissions',
    check: () => {
      const configPath = 'app.config.ts';
      if (!fs.existsSync(configPath)) return false;
      const content = fs.readFileSync(configPath, 'utf8');
      return content.includes('NSCameraUsageDescription');
    },
    fix: 'Add camera permissions to app.config.ts'
  },
  {
    name: 'Package.json Scripts',
    check: () => {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      return packageJson.scripts && packageJson.scripts['build:testflight'];
    },
    fix: 'Add TestFlight build scripts to package.json'
  },
  {
    name: 'Assets',
    check: () => {
      return fs.existsSync('assets/icon.png') && fs.existsSync('assets/splash.png');
    },
    fix: 'Ensure icon.png and splash.png exist in assets/'
  }
];

let allPassed = true;

checks.forEach(({ name, check, fix }) => {
  const passed = check();
  console.log(`${passed ? '✅' : '❌'} ${name}`);
  if (!passed) {
    console.log(`   Fix: ${fix}\n`);
    allPassed = false;
  }
});

console.log('\n' + '='.repeat(50));

if (allPassed) {
  console.log('🎉 All checks passed! Your app is ready for TestFlight.');
  console.log('\nNext steps:');
  console.log('1. Run: eas login');
  console.log('2. Run: npm run build:testflight');
  console.log('3. Run: npm run submit:ios');
} else {
  console.log('⚠️  Some checks failed. Please fix the issues above before building for TestFlight.');
}

console.log('\nFor detailed instructions, see: TESTFLIGHT_SETUP_GUIDE.md');
