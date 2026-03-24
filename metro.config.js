const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Ensure we support mjs and cjs for modern libraries
const sourceExts = config.resolver.sourceExts;
if (!sourceExts.includes('mjs')) sourceExts.push('mjs');
if (!sourceExts.includes('cjs')) sourceExts.push('cjs');

// Support wasm for expo-sqlite web
config.resolver.assetExts.push('wasm');

// Resolution order: react-native, then browser, then module, then main
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];
config.resolver.unstable_enablePackageExports = true;

module.exports = config;
