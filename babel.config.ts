import type { ConfigAPI, TransformOptions } from '@babel/core';

/**
 * Babel 配置工厂。api 为 Babel 提供的配置上下文。
 * @param api Babel 配置上下文
 */
const babelConfig = (api: ConfigAPI): TransformOptions => {
  // Jest 环境下禁用 nativewind/babel：它会改写 JSX pragma 并注入运行时代码，
  // 而 Jest 转译 node_modules 中 ESM 包（如 @react-navigation）时无法执行该检查，
  // 会报 Unexpected token '<'。测试不需要样式编译，用 RN 默认 preset 即可。
  const isTest = api.env('test');

  return {
    presets: [
      'module:@react-native/babel-preset',
      ...(isTest ? [] : ['nativewind/babel']),
    ],
    // Reanimated 4.x 基于 worklets 重构，必须在 plugins 末尾声明该插件，
    // 否则 react-native-keyboard-controller 等依赖 Reanimated 的库会报
    // "Reanimated plugin not found"。
    plugins: ['react-native-worklets/plugin'],
  };
};

export default babelConfig;
