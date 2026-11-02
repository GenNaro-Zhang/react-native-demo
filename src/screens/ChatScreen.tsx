import React, { useCallback, useMemo } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { LegendList } from '@legendapp/list/react-native';
import { Message } from '../types/chat';
import { useChatMessages } from '../hooks/useChatMessages';
import { MessageBubble } from '../components/MessageBubble';
import type { RootStackParamList } from '../types/navigation';

type ChatRoute = RouteProp<RootStackParamList, 'Chat'>;
type ChatNavigation = NativeStackNavigationProp<RootStackParamList, 'Chat'>;

export function ChatScreen() {
  const navigation = useNavigation<ChatNavigation>();
  const route = useRoute<ChatRoute>();
  /** 进入页面时就要跳转到的消息 id，用来模拟"从推送/搜索跳转到指定聊天的指定消息" */
  const { chatId, jumpToMessageId } = route.params;

  const {
    messages,
    listKey,
    initialScrollIndex,
    loadingInitial,
    loadingOlder,
    loadingNewer,
    highlightedId,
    listRef,
    loadOlder,
    loadNewer,
    scrollToEnd,
    scrollToMessage,
  } = useChatMessages(chatId, jumpToMessageId);

  // 建一份 id -> message 的索引，给"回复预览"用来展示原消息文案（如果它恰好已加载）
  const messageById = useMemo(() => {
    const map = new Map<string, Message>();
    for (const m of messages) map.set(m._id, m);
    return map;
  }, [messages]);

  const renderItem = useCallback(
    ({ item }: { item: Message }) => (
      <MessageBubble
        message={item}
        isHighlighted={item._id === highlightedId}
        replySourceMessage={
          item.replyContext
            ? messageById.get(item.replyContext.replyId)
            : undefined
        }
        onPressReply={replyId => {
          scrollToMessage(replyId);
        }}
      />
    ),
    [highlightedId, messageById, scrollToMessage],
  );

  if (loadingInitial) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Text style={styles.headerBack}>{'< 返回'}</Text>
        </Pressable>
        <Text style={styles.headerTitle}>{chatId}</Text>
        <View style={{ width: 40 }} />
      </View>

      {loadingOlder && (
        <View style={styles.loadingBar}>
          <ActivityIndicator size="small" />
        </View>
      )}

      <LegendList
        key={listKey}
        ref={listRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item: Message) => item._id}
        estimatedItemSize={72}
        recycleItems
        alignItemsAtEnd
        maintainScrollAtEnd
        maintainScrollAtEndThreshold={0.1}
        maintainVisibleContentPosition
        initialScrollIndex={initialScrollIndex}
        onStartReached={loadOlder}
        onStartReachedThreshold={0.5}
        onEndReached={loadNewer}
        onEndReachedThreshold={0.5}
        contentContainerStyle={styles.listContent}
      />

      {loadingNewer && (
        <View style={styles.loadingBar}>
          <ActivityIndicator size="small" />
        </View>
      )}

      <Pressable style={styles.fab} onPress={scrollToEnd}>
        <Text style={styles.fabText}>{'↓'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
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
  listContent: { paddingVertical: 8 },
  loadingBar: { paddingVertical: 6, alignItems: 'center' },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  fabText: { color: '#fff', fontSize: 18, fontWeight: '700' },
});
