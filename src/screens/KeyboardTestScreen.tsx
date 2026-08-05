import React, { useState } from 'react';
import {
  Animated,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  KeyboardAvoidingView,
  useKeyboardAnimation,
} from 'react-native-keyboard-controller';
import type { RootStackParamList } from '../types/navigation';

type KeyboardTestNavigation = NativeStackNavigationProp<
  RootStackParamList,
  'KeyboardTest'
>;

/**
 * 键盘测试页：验证 react-native-keyboard-controller 的键盘避让与动画能力。
 *
 * - KeyboardAvoidingView：键盘弹出时自动上移，避免输入框被遮挡。
 * - useKeyboardAnimation：提供键盘高度的动画值，可实时跟随键盘做平移/缩放等效果。
 * - useResizeMode：Android 上统一使用 adjustResize 模式，保证键盘行为一致。
 */
export function KeyboardTestScreen() {
  const navigation = useNavigation<KeyboardTestNavigation>();
  const { height } = useKeyboardAnimation();
  const [text, setText] = useState('');

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior="padding"
      keyboardVerticalOffset={50}
    >
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Text style={styles.headerBack}>{'< 返回'}</Text>
        </Pressable>
        <Text style={styles.headerTitle}>键盘测试</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.body}>
        <Text style={styles.hint}>输入内容，观察键盘如何避让输入框</Text>

        {/* 跟随键盘高度的动画块：键盘弹出时该色块会随键盘一起上移 */}
        <Animated.View
          style={[styles.animatedBox, { transform: [{ translateY: height }] }]}
        >
          <Text style={styles.animatedText}>该色块跟随键盘上下移动</Text>
        </Animated.View>
      </View>

      <View style={styles.inputArea}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="在这里输入文字…"
          placeholderTextColor="#9CA3AF"
        />
        <Pressable
          style={styles.dismissButton}
          onPress={() => Keyboard.dismiss()}
        >
          <Text style={styles.dismissText}>收起键盘</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  headerBack: { fontSize: 15, color: '#2563EB' },
  headerTitle: { fontSize: 16, fontWeight: '600' },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  hint: { fontSize: 14, color: '#6B7280', marginBottom: 16 },
  animatedBox: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#DCF2FF',
  },
  animatedText: { fontSize: 13, color: '#2563EB', fontWeight: '600' },
  inputArea: { padding: 16, gap: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  dismissButton: {
    backgroundColor: '#111827',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  dismissText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
