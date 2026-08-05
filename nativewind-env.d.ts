/// <reference types="nativewind/types" />

// nativewind/preset 的 dist/tailwind/index.d.ts 为空文件（库的类型缺陷），
// 补充声明让 TS / IDE 能解析 tailwind.config.js 中的 require('nativewind/preset')。
declare module 'nativewind/preset' {
  const preset: unknown;
  export = preset;
}
