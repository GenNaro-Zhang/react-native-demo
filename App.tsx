import React from 'react';
import "./global.css"
import {
  NavigationContainer,
  useNavigationContainerRef,
} from '@react-navigation/native';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useMMKVDevTools } from '@rozenite/mmkv-plugin';
import { useReactNavigationDevTools } from '@rozenite/react-navigation-plugin';
import { RootStack } from './src/stacks/RootStack';
import { storage, appSettings } from './src/services/storage';
import type { RootStackParamList } from './src/types/navigation';

/**
 * App 入口：只负责全局容器（SafeArea / NavigationContainer）与开发调试钩子，
 * 页面栈的定义见 src/stacks/RootStack.tsx。
 *
 * 开发调试（通过 Rozenite 统一接入 React Native DevTools）：
 * - useReactNavigationDevTools：实时查看导航 state / action 时间线、
 *   支持 time travel 与 deep link 测试（来自 @rozenite/react-navigation-plugin）。
 * - useMMKVDevTools：实时查看与编辑 MMKV 数据（来自 @rozenite/mmkv-plugin）。
 * 两者均仅在开发模式生效，生产构建自动禁用。
 */
export default function App() {
  const navigationRef = useNavigationContainerRef<RootStackParamList>();

  // React Navigation 调试：需传入 NavigationContainer 的 ref
  useReactNavigationDevTools({ ref: navigationRef });
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
        {/* KeyboardProvider 是 react-native-keyboard-controller 的必需根组件，
            负责键盘状态管理；preload 默认预加载键盘避免首次弹出延迟 */}
        <KeyboardProvider>
          <NavigationContainer ref={navigationRef}>
            <RootStack />
          </NavigationContainer>
        </KeyboardProvider>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
