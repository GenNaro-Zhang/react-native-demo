import {
  Message,
  User,
  GetMessagesOptions,
  GetMessagesResult,
  PaginateMessagesOptions,
  PaginateMessagesResult,
} from '../types/chat';

/**
 * 这是一个内存中的"假后端"，用来演示接口形状。
 * 接入真实项目时，把下面三个函数的实现换成真实的网络请求即可，
 * 函数签名 (参数 / 返回值) 保持不变，上层的 useChatMessages / ChatScreen 不需要改动。
 */

const PAGE_SIZE_DEFAULT = 30;
const NETWORK_DELAY_MS = 300;

const USERS: Record<string, User> = {
  me: { id: 'me', name: '我' },
  alice: { id: 'alice', name: 'Alice' },
  bob: { id: 'bob', name: 'Bob' },
};

// chatId -> 按时间正序(旧 -> 新)排列的全量消息
const chatStore = new Map<string, Message[]>();

function delay(ms: number) {
  return new Promise<void>(resolve => setTimeout(resolve, ms));
}

/** 首次访问某个会话时，懒生成一批模拟消息，之后复用，保证多次调用数据一致 */
function ensureChatGenerated(chatId: string, total = 500): Message[] {
  const existing = chatStore.get(chatId);
  if (existing) return existing;

  const senders = [USERS.me, USERS.alice, USERS.bob];
  const list: Message[] = [];
  for (let i = 0; i < total; i++) {
    const user = senders[i % senders.length];
    // 随机让大约 15% 的消息带上"引用回复"，回复目标是前面 1~5 条中的某一条
    const canReply = i > 5 && Math.random() < 0.15;
    const replyOffset = 30 + Math.floor(Math.random() * 20);
    list.push({
      _id: `${chatId}-msg-${i}`,
      text: `这是第 ${i} 条消息，来自 ${user.name}`,
      user,
      createdAt: Date.now() - (total - i) * 60_000,
      replyContext: canReply
        ? { replyId: `${chatId}-msg-${i - replyOffset}` }
        : undefined,
    });
  }
  chatStore.set(chatId, list);
  return list;
}

/**
 * getMessages —— 获取消息的入口方法。
 *
 * - 不传 anchorMessageId：返回该会话"最新"的一页消息（打开会话时的默认场景，
 *   对应 LegendList 的 alignItemsAtEnd + maintainScrollAtEnd 展示效果）。
 * - 传入 anchorMessageId：返回以该消息为中心的一个窗口（用于从推送通知 /
 *   搜索结果 / 分享链接等场景直接"跳转到指定聊天的指定消息"，这条消息可能
 *   在几百条历史记录的中间，不在最新一页里）。
 */
export async function getMessages(
  chatId: string,
  options: GetMessagesOptions = {},
): Promise<GetMessagesResult> {
  await delay(NETWORK_DELAY_MS);
  const all = ensureChatGenerated(chatId);
  const pageSize = options.pageSize ?? PAGE_SIZE_DEFAULT;

  if (options.anchorMessageId) {
    const anchorIndex = all.findIndex(m => m._id === options.anchorMessageId);
    if (anchorIndex === -1) {
      // 找不到目标消息（可能已被删除），退化为返回最新一页
      const start = Math.max(0, all.length - pageSize);
      return {
        messages: all.slice(start),
        hasMoreBefore: start > 0,
        hasMoreAfter: false,
      };
    }
    const half = Math.floor(pageSize / 2);
    const start = Math.max(0, anchorIndex - half);
    const end = Math.min(all.length, anchorIndex + half);
    return {
      messages: all.slice(start, end),
      hasMoreBefore: start > 0,
      hasMoreAfter: end < all.length,
    };
  }

  const start = Math.max(0, all.length - pageSize);
  return {
    messages: all.slice(start),
    hasMoreBefore: start > 0,
    hasMoreAfter: false,
  };
}

/**
 * paginateMessages —— 双向分页加载。
 *
 * direction: "up"   向上翻页，加载 cursorMessageId 之前(更早)的一批消息，
 *                    对应 LegendList 的 onStartReached。
 * direction: "down" 向下翻页，加载 cursorMessageId 之后(更新)的一批消息，
 *                    对应 LegendList 的 onEndReached。
 */
export async function paginateMessages(
  chatId: string,
  options: PaginateMessagesOptions,
): Promise<PaginateMessagesResult> {
  await delay(NETWORK_DELAY_MS);
  const all = ensureChatGenerated(chatId);
  const pageSize = options.pageSize ?? PAGE_SIZE_DEFAULT;
  const cursorIndex = all.findIndex(m => m._id === options.cursorMessageId);
  if (cursorIndex === -1) {
    return { messages: [], hasMore: false };
  }

  if (options.direction === 'up') {
    const start = Math.max(0, cursorIndex - pageSize);
    return {
      messages: all.slice(start, cursorIndex),
      hasMore: start > 0,
    };
  }

  const end = Math.min(all.length, cursorIndex + 1 + pageSize);
  return {
    messages: all.slice(cursorIndex + 1, end),
    hasMore: end < all.length,
  };
}

/** 辅助方法：按 id 查询单条消息，主要给"回复预览"在消息未加载时兜底展示用 */
export async function getMessageById(
  chatId: string,
  messageId: string,
): Promise<Message | undefined> {
  const all = ensureChatGenerated(chatId);
  return all.find(m => m._id === messageId);
}
