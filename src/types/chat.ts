export interface User {
  id: string;
  name: string;
  avatar?: string;
}

/** 引用回复的上下文，只存被回复消息的 id，展示时需要反查原消息 */
export interface ReplyContext {
  replyId: string;
}

export interface Message {
  _id: string;
  text: string;
  user: User;
  createdAt: number;
  replyContext?: ReplyContext;
}

/** 分页方向：up = 向上翻页(加载更早的历史消息)，down = 向下翻页(加载更新的消息) */
export type PaginateDirection = "up" | "down";

export interface GetMessagesOptions {
  /** 如果传入，则返回以这条消息为中心的一个窗口，用于"跳转到指定消息"场景 */
  anchorMessageId?: string;
  pageSize?: number;
}

export interface GetMessagesResult {
  messages: Message[];
  hasMoreBefore: boolean;
  hasMoreAfter: boolean;
}

export interface PaginateMessagesOptions {
  direction: PaginateDirection;
  /** 翻页的游标：向上翻页传当前最早消息的 _id，向下翻页传当前最新消息的 _id */
  cursorMessageId: string;
  pageSize?: number;
}

export interface PaginateMessagesResult {
  messages: Message[];
  hasMore: boolean;
}
