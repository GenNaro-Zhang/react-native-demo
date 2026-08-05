// @ts-nocheck — Jest 测试辅助 mock 文件，无需严格类型检查。
// 说明：需要向 globalThis 动态注入 Rozenite dispatcher，而 globalThis 无索引签名，
// 且 jest.mock 工厂内箭头函数参数的类型标注 tsserver 无法可靠关联，故跳过全文件检查。
/**
 * Jest setup：mock Rozenite DevTools 的全局 dispatcher。
 *
 * @rozenite/plugin-bridge 的 useRozeniteDevToolsClient 在组件挂载时读取
 * global.__FUSEBOX_REACT_DEVTOOLS_DISPATCHER__（由 Rozenite 原生/DevTools 注入），
 * Jest 环境中不存在，直接访问 .BINDING_NAME 会崩溃。
 * 这里提供最小 mock：让 v() 返回可用的 domain 对象，客户端静默工作。
 */
const mockDomain = {
  sendMessage: jest.fn(),
  onMessage: {
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  },
};

const mockDispatcher = {
  BINDING_NAME: '__ROZENITE_TEST_BINDING__',
  initializeDomain: jest.fn(() => mockDomain),
  onDomainInitialization: {
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  },
};

// v() 中会检查 global[BINDING_NAME] != null，这里满足该条件
global.__ROZENITE_TEST_BINDING__ = {};
global.__FUSEBOX_REACT_DEVTOOLS_DISPATCHER__ = mockDispatcher;
