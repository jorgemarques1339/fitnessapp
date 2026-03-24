const { withInfoPlist, withXcodeProject } = require('@expo/config-plugins');

/**
 * Expo Config Plugin to enable Live Activities in Info.plist
 */
const withLiveActivityPermissions = (config) => {
  return withInfoPlist(config, (config) => {
    config.modResults.NSSupportsLiveActivities = true;
    return config;
  });
};

/**
 * Note: Real Swift Widget Extension injection requires complex withXcodeProject modifications.
 * This plugin handles the basic Info.plist permission.
 */
module.exports = (config) => {
  return withLiveActivityPermissions(config);
};
