module.exports = {
  preset: '@react-native/jest-preset',
  // 让 Jest 转译 ESM 格式的第三方包（React Navigation、MMKV 及其 Nitro 依赖）
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@react-navigation/.*|react-native-screens|react-native-safe-area-context|react-native-mmkv|react-native-nitro-modules|react-native-keyboard-controller|react-native-reanimated|react-native-worklets|@rozenite)/)',
  ],
  // react-native-mmkv 依赖原生 TurboModule，Jest 中用内存 mock 替代
  // react-native-worklets 使用官方提供的 mock（模块加载期访问原生模块）
  moduleNameMapper: {
    '^react-native-mmkv$': '<rootDir>/__mocks__/react-native-mmkv.js',
    '^react-native-worklets$': 'react-native-worklets/lib/module/mock.js',
  },
  // mock 原生 TurboModule 与 Rozenite dispatcher（模块加载期即访问）
  setupFiles: [
    '<rootDir>/__mocks__/keyboard-controller-setup.js',
    '<rootDir>/__mocks__/rozenite-setup.js',
  ],
};
