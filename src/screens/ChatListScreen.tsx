import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';

const CHATS = [
  { id: 'chat-1', name: 'Alice', preview: '好的，明天见~' },
  { id: 'chat-2', name: '产品讨论组', preview: 'Bob: 这个方案我再看看' },
  { id: 'chat-3', name: 'Bob', preview: '文件已经发你了' },
];

type ChatListNavigation = NativeStackNavigationProp<
  RootStackParamList,
  'ChatList'
>;

export function ChatListScreen() {
  const navigation = useNavigation<ChatListNavigation>();

  /** jumpToMessageId 传了就演示深链跳转到会话中间某条历史消息；不传则默认打开到最新消息 */
  const openChat = (chatId: string, jumpToMessageId?: string) => {
    navigation.navigate('Chat', { chatId, jumpToMessageId });
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>聊天</Text>

      <FlatList
        data={CHATS}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <Pressable style={styles.row} onPress={() => openChat(item.id)}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.name[0]}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.preview} numberOfLines={1}>
                {item.preview}
              </Text>
            </View>
          </Pressable>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      {/* 模拟"从推送通知 / 搜索结果直接跳转到某个聊天的某条历史消息" */}
      <Pressable
        style={styles.deepLinkButton}
        onPress={() => openChat('chat-2', 'chat-2-msg-120')}
      >
        <Text style={styles.deepLinkText}>
          模拟深链：跳转到「产品讨论组」的第 120 条消息
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 12 },
  title: {
    fontSize: 22,
    fontWeight: '700',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#DCF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: { fontSize: 18, fontWeight: '700', color: '#2563EB' },
  name: { fontSize: 16, fontWeight: '600' },
  preview: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E5E7EB',
    marginLeft: 72,
  },
  deepLinkButton: {
    margin: 16,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#111827',
    alignItems: 'center',
  },
  deepLinkText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
