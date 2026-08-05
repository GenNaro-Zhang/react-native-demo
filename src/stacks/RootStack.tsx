import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ChatListScreen } from '../screens/ChatListScreen';
import { ChatScreen } from '../screens/ChatScreen';
import type { RootStackParamList } from '../types/navigation';

/**
 * 根导航栈：管理「聊天列表 -> 会话详情」两级页面。
 * 从 App.tsx 抽离至此，App 只负责容器（NavigationContainer / SafeArea）与调试钩子。
 * 新增页面时只需在此注册 Stack.Screen。
 */
const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootStack() {
  return (
    <Stack.Navigator
      initialRouteName="ChatList"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="ChatList" component={ChatListScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
    </Stack.Navigator>
  );
}
