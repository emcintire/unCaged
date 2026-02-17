const path = require('path');
const { getDefaultConfig } = require('@expo/metro-config');

const monorepoRoot = path.resolve(__dirname, '../..');

module.exports = (() => {
  const config = getDefaultConfig(__dirname);

  const { transformer, resolver } = config;

  // SVG transformer
  config.transformer = {
    ...transformer,
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  };

  config.resolver = {
    ...resolver,
    assetExts: resolver.assetExts.filter((ext) => ext !== 'svg'),
    sourceExts: [...resolver.sourceExts, 'svg'],
    // Monorepo: resolve node_modules from both app and root
    nodeModulesPaths: [
      path.resolve(__dirname, 'node_modules'),
      path.resolve(monorepoRoot, 'node_modules'),
    ],
  };

  // Monorepo: watch shared packages
  config.watchFolders = [monorepoRoot];

  return config;
})();
