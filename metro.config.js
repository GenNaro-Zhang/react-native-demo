const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { withNativeWind } = require('nativewind/metro');
const { withRozenite } = require('@rozenite/metro');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * - withNativeWind: 让 Metro 识别并编译 global.css（Tailwind 样式管线）
 * - withRozenite: 接入 Rozenite DevTools 插件体系（自动发现 node_modules 中的插件，
 *   如 @rozenite/mmkv-plugin）。默认关闭，仅开发环境启用：
 *     WITH_ROZENITE=true npm start
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {};

// 说明：nativewind 的 WithNativeWindOptions 类型从 react-native-css-interop 继承，
// 其中 getCSSForPlatform 被库声明为必填，但实际由 withNativeWind 内部自动生成，
// 调用方无需传入。此处用 JSDoc 断言绕过该库的类型缺陷。
const nativeWindConfig = withNativeWind(
  mergeConfig(getDefaultConfig(__dirname), config),
  /** @type {any} */ ({ input: './global.css' }),
);

module.exports = withRozenite(nativeWindConfig, {
  enabled: process.env.WITH_ROZENITE === 'true',
});
