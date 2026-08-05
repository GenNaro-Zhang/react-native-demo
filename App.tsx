import React from 'react';
import {
  NavigationContainer,
  useNavigationContainerRef,
} from '@react-navigation/native';
import { useLogger, useReduxDevToolsExtension } from '@react-navigation/devtools';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useMMKVDevTools } from '@rozenite/mmkv-plugin';
import { RootStack } from './src/stacks/RootStack';
import { storage, appSettings } from './src/services/storage';
import type { RootStackParamList } from './src/types/navigation';

/**
 * App 入口：只负责全局容器（SafeArea / NavigationContainer）与开发调试钩子，
 * 页面栈的定义见 src/stacks/RootStack.tsx。
 *
 * 开发调试：
 * - useLogger / useReduxDevToolsExtension：在控制台 / Redux DevTools 中输出导航
 *   state 与 action（仅在开发模式生效，生产构建自动禁用）。
 * - useMMKVDevTools：在 React Native DevTools 中新增 "MMKV Storage" 面板，
 *   实时查看与编辑 MMKV 数据（同样仅在开发模式生效）。
 */
export default function App() {
  const navigationRef = useNavigationContainerRef<RootStackParamList>();

  // 导航调试：控制台输出导航状态变化
  useLogger(navigationRef);
  // 导航调试：接入 Redux DevTools Extension（可选）
  useReduxDevToolsExtension(navigationRef);
  // MMKV 存储调试：仅开发模式生效，生产构建为 noop。
  // 注意：MMKV v4 实例不再暴露 id，必须用 { storageId: instance } 的 Record 形式，
  // 数组形式会在运行时抛错（v4 无法从实例推断 storage ID）。
  useMMKVDevTools({
    storages: {
      default: storage,
      'app-settings': appSettings,
    },
  });

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <NavigationContainer ref={navigationRef}>
          <RootStack />
        </NavigationContainer>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
