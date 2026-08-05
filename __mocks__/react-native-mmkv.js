/**
 * react-native-mmkv 的 Jest mock。
 *
 * mmkv v4 依赖原生 TurboModule（react-native-nitro-modules），在 Jest 环境中
 * 不存在原生二进制，故用内存 Map 模拟其读写 API，保证单测可在 JS 环境运行。
 */

class MMKVStorageMock {
  constructor() {
    this._store = new Map();
  }

  set(key, value) {
    this._store.set(key, value);
  }

  getString(key) {
    const v = this._store.get(key);
    return typeof v === 'string' ? v : undefined;
  }

  getNumber(key) {
    const v = this._store.get(key);
    return typeof v === 'number' ? v : undefined;
  }

  getBoolean(key) {
    const v = this._store.get(key);
    return typeof v === 'boolean' ? v : undefined;
  }

  getBuffer(key) {
    const v = this._store.get(key);
    return v instanceof ArrayBuffer ? v : undefined;
  }

  contains(key) {
    return this._store.has(key);
  }

  delete(key) {
    this._store.delete(key);
  }

  remove(key) {
    this._store.delete(key);
  }

  clearAll() {
    this._store.clear();
  }

  getAllKeys() {
    return Array.from(this._store.keys());
  }
}

const createMMKV = () => new MMKVStorageMock();
const existsMMKV = () => true;
const deleteMMKV = () => true;

// hooks 在测试中不做真实订阅，返回 undefined 即可
const noop = () => undefined;

module.exports = {
  createMMKV,
  existsMMKV,
  deleteMMKV,
  useMMKV: noop,
  useMMKVBoolean: noop,
  useMMKVBuffer: noop,
  useMMKVNumber: noop,
  useMMKVObject: noop,
  useMMKVString: noop,
  useMMKVListener: noop,
  useMMKVKeys: noop,
};
