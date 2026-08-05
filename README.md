# Legend List 聊天跳转示例

基于 [`@legendapp/list`](https://www.legendapp.com/open-source/list/v2/getting-started/)（v2）实现的一个
"跳转到指定聊天 / 指定消息"的 React Native 示例，包含双向分页与引用回复跳转。

## 安装依赖

```bash
npm install @legendapp/list
```

## 文件说明

| 文件 | 作用 |
|---|---|
| `types.ts` | 消息 / 用户 / 分页参数的类型定义 |
| `chatService.ts` | 模拟后端，实现 `getMessages`、`paginateMessages`、`getMessageById` |
| `useChatMessages.ts` | 核心 Hook，管理消息状态、双向分页、`scrollToMessage` 跳转逻辑 |
| `MessageBubble.tsx` | 消息气泡，展示引用回复预览、命中高亮动画 |
| `ChatScreen.tsx` | 聊天页面，接入 `LegendList` |
| `ChatListScreen.tsx` | 会话列表页，演示"跳转到指定聊天(及指定消息)" |
| `App.tsx` | 用最简单的 state 做页面切换，接入真实项目时换成 react-navigation 即可 |

## 三个核心函数是怎么对应的

### `getMessages(chatId, { anchorMessageId?, pageSize? })`

会话的"入口"数据获取：

- 不传 `anchorMessageId`：返回该会话**最新**的一页消息（默认打开会话看到的效果）。
- 传 `anchorMessageId`：返回**以这条消息为中心**的一页（前后各取一半），
  用于"跳转到指定聊天的指定消息"——这条消息可能在几百条历史记录中间，并不在最新一页里。

### `paginateMessages(chatId, { direction: 'up' | 'down', cursorMessageId, pageSize? })`

双向分页：

- `direction: 'up'`：加载 `cursorMessageId`（当前最早一条）之前的历史消息，对应
  `LegendList` 的 `onStartReached`。
- `direction: 'down'`：加载 `cursorMessageId`（当前最新一条）之后的消息，对应
  `LegendList` 的 `onEndReached`。

真实项目里把这两个函数换成你后端的分页接口即可，返回结构（`messages` +
`hasMore` / `hasMoreBefore` / `hasMoreAfter`）保持不变，上层逻辑不用改。

### `scrollToMessage(messageId)`（在 `useChatMessages.ts` 里）

跳转到指定消息，分两种情况：

1. **消息已经在当前加载的窗口里**（比如点击一条"引用回复"，原消息就在附近几十条以内）：
   直接调用 `LegendList` ref 的 `scrollIndexIntoView({ index, animated: true })` 滚过去，
   如果目标本来就在可视区域内则不会有多余的跳动。
2. **消息不在当前窗口里**（比如深链直接指定了历史中间的一条消息，或者引用的是很久以前的消息）：
   重新调用 `getMessages(chatId, { anchorMessageId: messageId })` 拉取以它为中心的新窗口，
   替换 `data`，并且**更换 `LegendList` 的 `key`** 强制重新挂载，配合
   `initialScrollIndex` + `maintainVisibleContentPosition` 完成"冷跳转"（一次性精确定位，
   不需要逐条滚动扫过去）。

跳转落地后，`MessageBubble` 会有一个 1.2s 左右的背景色淡出动画，帮助用户一眼找到目标消息。

## `LegendList` 关键 props 说明

```tsx
<LegendList
  data={messages}
  renderItem={renderItem}
  keyExtractor={(item) => item._id}
  estimatedItemSize={72}
  recycleItems
  alignItemsAtEnd          // 消息不足一屏时贴底显示，模拟聊天界面效果
  maintainScrollAtEnd      // data 变化时若原本已在底部，自动保持在底部（新消息到达时）
  maintainScrollAtEndThreshold={0.1}
  maintainVisibleContentPosition   // 顶部插入历史消息 / 冷跳转时不会造成视口跳动
  initialScrollIndex={initialScrollIndex}  // 冷跳转时用来一次性定位到目标消息
  onStartReached={loadOlder}    // 滚到顶部 -> 向上翻页
  onEndReached={loadNewer}      // 滚到底部 -> 向下翻页
/>
```

> 官方文档特别提到：如果不能保证每条消息的高度都准确传给 `getEstimatedItemSize`，
> 一定要开启 `maintainVisibleContentPosition`，否则 `scrollToIndex` /
> `initialScrollIndex` 在动态高度的聊天场景下可能不够精确。本示例的消息高度是动态的
> （文字长度、是否有回复预览都不同），所以全程开启了这个 prop。

## 关于消息格式

按你给的字段扩展了 `createdAt` 用于排序/生成模拟数据，其余保持一致：

```ts
interface Message {
  _id: string;
  text: string;
  user: User;
  createdAt: number;
  replyContext?: { replyId: string };
}
```

`replyContext.replyId` 只存被回复消息的 id，展示原文时需要在当前消息列表里反查
（`ChatScreen.tsx` 里用 `Map` 做了 O(1) 查找）；如果原消息还没加载到内存里，
预览文案会退化成"点击跳转到被回复的消息"，点击后走 `scrollToMessage` 的"冷跳转"分支。
