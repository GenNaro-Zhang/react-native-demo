module.exports = api => {
  // Jest 环境下禁用 nativewind/babel：它会改写 JSX pragma 并注入运行时代码，
  // 而 Jest 转译 node_modules 中 ESM 包（如 @react-navigation）时无法执行该检查，
  // 会报 Unexpected token '<'。测试不需要样式编译，用 RN 默认 preset 即可。
  const isTest = api.env('test');

  return {
    presets: [
      'module:@react-native/babel-preset',
      ...(isTest ? [] : ['nativewind/babel']),
    ],
  };
};
