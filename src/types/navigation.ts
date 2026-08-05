/**
 * React Navigation 路由参数类型定义。
 * 所有屏幕的 name 与 params 集中在此，保证导航调用全程类型安全。
 */
export type RootStackParamList = {
  /** 聊天列表首页 */
  ChatList: undefined;
  /** 单个会话页 */
  Chat: {
    chatId: string;
    /** 从推送通知 / 搜索结果深链跳转时，定位到某条历史消息 */
    jumpToMessageId?: string;
  };
};
