// @ts-nocheck — Jest 测试辅助 mock 文件，无需严格类型检查。
// 说明：jest.mock 工厂回调内对象属性的箭头函数参数，tsserver 无法可靠关联
// JSDoc 类型标注，故整个文件跳过类型检查（不影响 Jest 运行时）。
/**
 * Jest setup：mock react-native-keyboard-controller 的原生 TurboModule。
 *
 * keyboard-controller 在模块加载时即执行 new NativeEventEmitter(TurboModule)，
 * 而 Jest 环境中原生模块（KeyboardController）不存在，会导致加载崩溃。
 * 这里为 TurboModuleRegistry.get("KeyboardController") 提供最小 mock，
 * 保证 App 及页面组件可在测试环境正常 import 该库。
 */
jest.mock('react-native/Libraries/TurboModule/TurboModuleRegistry', () => {
  const actual = jest.requireActual(
    'react-native/Libraries/TurboModule/TurboModuleRegistry',
  );

  const mockEmitter = {
    addListener: jest.fn(() => ({ remove: jest.fn() })),
    removeAllListeners: jest.fn(),
    removeSubscription: jest.fn(),
    emit: jest.fn(),
    on: jest.fn(),
    once: jest.fn(),
    removeListener: jest.fn(),
    listeners: jest.fn(() => []),
    // keyboard-controller 在模块加载期调用 getConstants() 读取
    // keyboardBorderRadius，必须返回有效对象否则访问属性崩溃
    getConstants: jest.fn(() => ({ keyboardBorderRadius: 0 })),
  };

  return {
    ...actual,
    get: /** @param {string} name */ name =>
      name === 'KeyboardController'
        ? mockEmitter
        : actual.get(name),
    getEnforcing: /** @param {string} name */ name =>
      name === 'KeyboardController'
        ? mockEmitter
        : actual.getEnforcing(name),
  };
});
