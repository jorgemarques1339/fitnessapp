module.exports = function (api) {
  // Cache bust v15
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
      // Fix for 'import.meta' error on web when not using type="module"
      {
        visitor: {
          MetaProperty(path) {
            if (path.node.meta.name === 'import' && path.node.property.name === 'meta') {
              path.replaceWithSourceString('({ url: "" })');
            }
          }
        }
      }
    ],
  };
};
