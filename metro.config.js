// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname, {
  // [Web-only]: Enables CSS support in Metro.
  isCSSEnabled: true,
});

// Add support for CSS/SCSS file extensions
config.resolver.sourceExts.push('css', 'scss', 'sass');

// Enable async requires for Expo Router
config.transformer.unstable_allowRequireContext = true;

// Ensure proper module resolution
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
];

config.resolver.disableHierarchicalLookup = false;

// Remove react-dom mock as it might interfere with Clerk
delete config.resolver.extraNodeModules['react-dom'];

// Add any custom configuration here
config.resolver.sourceExts = [...config.resolver.sourceExts, 'mjs', 'cjs'];

// Remove unnecessary mocks
config.resolver.unstable_mockModules = [];

module.exports = config; 