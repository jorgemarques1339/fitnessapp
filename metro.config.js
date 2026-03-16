const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Ensure we support mjs for modern libraries like Lucide
if (!config.resolver.sourceExts.includes('mjs')) {
  config.resolver.sourceExts.push('mjs');
}

// Resolution order: web, then module, then browser, then main
config.resolver.resolverMainFields = ['sbmodern', 'browser', 'module', 'main'];

module.exports = config;
