import { useCallback, useEffect, useRef, useState } from 'react';
import type { LegendListRef } from '@legendapp/list/react-native';
import { Message } from '../types/chat';
import { getMessages, paginateMessages } from '../services/chatService';

const PAGE_SIZE = 30;

interface UseChatMessagesReturn {
  /** 当前已加载在内存里的消息（旧 -> 新排列，直接喂给 LegendList 的 data） */
  messages: Message[];
  /** 变化时会强制 LegendList 重新挂载，配合 initialScrollIndex 完成"冷跳转" */
  listKey: string;
  /** 仅在需要"冷跳转"时有值，一次性生效 */
  initialScrollIndex: number | undefined;
  loadingInitial: boolean;
  loadingOlder: boolean;
  loadingNewer: boolean;
  hasMoreOlder: boolean;
  hasMoreNewer: boolean;
  /** 当前需要高亮闪烁的消息 id（跳转落地后短暂高亮，方便用户找到目标消息） */
  highlightedId: string | null;
  // useRef<LegendListRef>(null) 在 React 19 下返回 RefObject<LegendListRef | null>，
  // 因此这里类型必须包含 null，与返回值保持一致，否则无法通过编译
  listRef: React.RefObject<LegendListRef | null> | null;
  loadOlder: () => Promise<void>;
  loadNewer: () => Promise<void>;
  scrollToEnd: () => void;
  /** 跳转到指定消息：消息在已加载窗口内就直接滚动；不在窗口内则重新拉取以它为中心的一页再跳转 */
  scrollToMessage: (messageId: string) => Promise<void>;
}

export function useChatMessages(
  chatId: string,
  initialAnchorMessageId?: string,
): UseChatMessagesReturn {
  const listRef = useRef<LegendListRef>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [hasMoreOlder, setHasMoreOlder] = useState(true);
  const [hasMoreNewer, setHasMoreNewer] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [loadingNewer, setLoadingNewer] = useState(false);
  const [listKey, setListKey] = useState(`chat-${chatId}-initial`);
  const [initialScrollIndex, setInitialScrollIndex] = useState<
    number | undefined
  >(undefined);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  const highlightTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flashHighlight = useCallback((id: string) => {
    setHighlightedId(id);
    if (highlightTimer.current) clearTimeout(highlightTimer.current);
    highlightTimer.current = setTimeout(() => {
      setHighlightedId(current => (current === id ? null : current));
    }, 1500);
  }, []);

  // 进入会话时的初始加载：getMessages —— 如果带了 initialAnchorMessageId，
  // 说明是"跳转到指定聊天的指定消息"这种深链场景，否则默认加载最新消息
  useEffect(() => {
    let cancelled = false;
    setLoadingInitial(true);
    getMessages(chatId, {
      anchorMessageId: initialAnchorMessageId,
      pageSize: PAGE_SIZE,
    }).then(result => {
      if (cancelled) return;
      setMessages(result.messages);
      setHasMoreOlder(result.hasMoreBefore);
      setHasMoreNewer(result.hasMoreAfter);
      if (initialAnchorMessageId) {
        const idx = result.messages.findIndex(
          m => m._id === initialAnchorMessageId,
        );
        setInitialScrollIndex(idx >= 0 ? idx : undefined);
        if (idx >= 0) flashHighlight(initialAnchorMessageId);
      } else {
        setInitialScrollIndex(undefined);
      }
      setLoadingInitial(false);
    });
    return () => {
      cancelled = true;
    };
    // 只在切换会话时重新拉取初始数据，anchor 只在首次挂载生效
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId]);

  const loadOlder = useCallback(async () => {
    if (loadingOlder || !hasMoreOlder || messages.length === 0) return;
    setLoadingOlder(true);
    try {
      const oldest = messages[0];
      const page = await paginateMessages(chatId, {
        direction: 'up',
        cursorMessageId: oldest._id,
        pageSize: PAGE_SIZE,
      });
      setMessages(prev => [...page.messages, ...prev]);
      setHasMoreOlder(page.hasMore);
    } finally {
      setLoadingOlder(false);
    }
  }, [chatId, hasMoreOlder, loadingOlder, messages]);

  const loadNewer = useCallback(async () => {
    if (loadingNewer || !hasMoreNewer || messages.length === 0) return;
    setLoadingNewer(true);
    try {
      const newest = messages[messages.length - 1];
      const page = await paginateMessages(chatId, {
        direction: 'down',
        cursorMessageId: newest._id,
        pageSize: PAGE_SIZE,
      });
      setMessages(prev => [...prev, ...page.messages]);
      setHasMoreNewer(page.hasMore);
    } finally {
      setLoadingNewer(false);
    }
  }, [chatId, hasMoreNewer, loadingNewer, messages]);

  const scrollToEnd = useCallback(() => {
    listRef.current?.scrollToEnd({ animated: true });
  }, []);

  const scrollToMessage = useCallback(
    async (messageId: string) => {
      const idxInMemory = messages.findIndex(m => m._id === messageId);

      if (idxInMemory >= 0) {
        // 命中场景：消息已经在当前加载的窗口里，直接用 LegendList 的
        // scrollIndexIntoView 滚过去（只有目标不在可视区域时才会真正滚动）
        listRef.current?.scrollIndexIntoView({
          index: idxInMemory,
          animated: true,
        });
        flashHighlight(messageId);
        return;
      }

      // 未命中场景：目标消息不在当前窗口里（比如从很久以前的一条回复跳转，
      // 或者外部深链直接指定了一条历史消息）。重新以它为中心拉一页数据，
      // 然后通过更换 listKey 强制 LegendList 重新挂载，
      // 配合 initialScrollIndex + maintainVisibleContentPosition 做"冷跳转"。
      const result = await getMessages(chatId, {
        anchorMessageId: messageId,
        pageSize: PAGE_SIZE,
      });
      const idx = result.messages.findIndex(m => m._id === messageId);
      setMessages(result.messages);
      setHasMoreOlder(result.hasMoreBefore);
      setHasMoreNewer(result.hasMoreAfter);
      setInitialScrollIndex(idx >= 0 ? idx : undefined);
      setListKey(`chat-${chatId}-${messageId}-${Date.now()}`);
      if (idx >= 0) flashHighlight(messageId);
    },
    [chatId, flashHighlight, messages],
  );

  return {
    messages,
    listKey,
    initialScrollIndex,
    loadingInitial,
    loadingOlder,
    loadingNewer,
    hasMoreOlder,
    hasMoreNewer,
    highlightedId,
    listRef,
    loadOlder,
    loadNewer,
    scrollToEnd,
    scrollToMessage,
  };
}
