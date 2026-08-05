import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Message } from '../types/chat';

const CURRENT_USER_ID = 'me';
const HIGHLIGHT_COLOR = '#FFF3B0';

interface Props {
  message: Message;
  isHighlighted: boolean;
  /** 被回复的原消息，如果当前已经加载在内存里就传进来用于展示预览文案 */
  replySourceMessage?: Message;
  onPressReply: (replyId: string) => void;
}

export const MessageBubble = React.memo(
  ({ message, isHighlighted, replySourceMessage, onPressReply }: Props) => {
    const isMine = message.user.id === CURRENT_USER_ID;
    const highlightAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      if (isHighlighted) {
        highlightAnim.setValue(1);
        Animated.timing(highlightAnim, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: false, // 背景色动画不支持 native driver
        }).start();
      }
    }, [isHighlighted, highlightAnim]);

    const backgroundColor = highlightAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['rgba(255,243,176,0)', HIGHLIGHT_COLOR],
    });

    return (
      <View style={[styles.row, isMine ? styles.rowMine : styles.rowTheirs]}>
        <Animated.View
          style={[
            styles.bubble,
            isMine ? styles.bubbleMine : styles.bubbleTheirs,
            { backgroundColor },
          ]}
        >
          {!isMine && <Text style={styles.userName}>{message.user.name}</Text>}

          {message.replyContext && (
            <Pressable
              onPress={() => onPressReply(message.replyContext!.replyId)}
              style={styles.replyPreview}
              hitSlop={6}
            >
              <View style={styles.replyBar} />
              <Text numberOfLines={1} style={styles.replyText}>
                {replySourceMessage
                  ? `${replySourceMessage.user.name}: ${replySourceMessage.text}`
                  : '点击跳转到被回复的消息'}
              </Text>
            </Pressable>
          )}

          <Text style={styles.text}>{message.text}</Text>
        </Animated.View>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    marginVertical: 4,
  },
  rowMine: { justifyContent: 'flex-end' },
  rowTheirs: { justifyContent: 'flex-start' },
  bubble: {
    maxWidth: '78%',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  bubbleMine: { backgroundColor: '#DCF2FF' },
  bubbleTheirs: { backgroundColor: '#F1F1F3' },
  userName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 2,
  },
  text: { fontSize: 15, color: '#111827' },
  replyPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.04)',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 6,
    marginBottom: 6,
  },
  replyBar: {
    width: 3,
    alignSelf: 'stretch',
    backgroundColor: '#9CA3AF',
    borderRadius: 2,
    marginRight: 6,
  },
  replyText: { flex: 1, fontSize: 12, color: '#6B7280' },
});
