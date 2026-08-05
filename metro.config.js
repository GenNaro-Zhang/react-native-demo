const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { withNativeWind } = require('nativewind/metro');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * withNativeWind: 让 Metro 识别并编译 global.css（Tailwind 样式管线）
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {};

module.exports = withNativeWind(
  mergeConfig(getDefaultConfig(__dirname), config),
  { input: './global.css' },
);
