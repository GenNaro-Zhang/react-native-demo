// @ts-nocheck — nativewind/preset 的 dist/tailwind/index.d.ts 为空文件（库的类型缺陷），
// 跳过本配置文件的 TS 检查；Tailwind CLI 与 Metro 均按 JS 执行，不受影响。
/** @type {import('tailwindcss').Config} */
module.exports = {
  // 需要扫描 class 的文件路径
  content: ['./App.tsx', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {},
  },
  plugins: [],
};
