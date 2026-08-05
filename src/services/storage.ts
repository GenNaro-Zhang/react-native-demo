import { createMMKV } from 'react-native-mmkv';

/**
 * 全局默认 MMKV 存储实例。
 * MMKV 是高性能键值存储（底层基于 mmap），适合存放用户偏好、token 等轻量数据。
 * 如需多个隔离的存储空间，可在此文件追加新的实例（id 需唯一），
 * 并同步加入 App.tsx 中 useMMKVDevTools 的 storages Record 以便在 DevTools 中调试。
 *
 * 注意：react-native-mmkv v4 基于 Nitro 重写，使用 createMMKV 工厂函数创建实例
 * （MMKV 在 v4 中仅作为类型存在）。
 */
export const storage = createMMKV({ id: 'default' });

/** 各业务存储实例统一在此导出，避免散落在各处 */
export const appSettings = createMMKV({ id: 'app-settings' });
