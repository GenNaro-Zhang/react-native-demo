module.exports = {
  preset: '@react-native/jest-preset',
  // 让 Jest 转译 ESM 格式的第三方包（React Navigation、MMKV 及其 Nitro 依赖）
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@react-navigation/.*|react-native-screens|react-native-safe-area-context|react-native-mmkv|react-native-nitro-modules|@rozenite)/)',
  ],
  // react-native-mmkv 依赖原生 TurboModule，Jest 中用内存 mock 替代
  moduleNameMapper: {
    '^react-native-mmkv$': '<rootDir>/__mocks__/react-native-mmkv.js',
  },
};
