**语言版本：** [English](./README.md) | 简体中文

# dev-ai-toolkit

一个面向开发者的实用型开源 AI 工具箱，基于 React、Vite 和 TypeScript 构建。

这个项目不是一次性的 demo，而是按照真实、清晰、可扩展的前端产品方式持续开发。它的目标是为开发者提供一个结构化的 AI 工作台，用来承载常见的 AI 辅助开发流程，例如 prompt 管理、prompt 调试、以及后续更多开发工具模块。

## 为什么做这个项目

开发者在使用 AI 时，经常会重复遇到这些问题：

- 相似场景下反复重写 prompt
- prompt 经验散落在聊天记录里，难以沉淀
- 缺少一个清晰的工具入口来组织 AI 工作流

`dev-ai-toolkit` 希望把这些重复场景沉淀成一个聚焦、清晰、可扩展的开源产品。

## 当前功能

当前版本已经包含：

- 首页 Overview 展示页
- Prompt 模板列表页
- 新建 Prompt 模板
- 编辑 Prompt 模板
- Prompt 模板搜索与标签筛选
- Prompt 模板详情预览
- Prompt 模板复制与删除
- Prompt 模板导入 / 导出 JSON
- Prompt Playground
- 变量填充与实时预览
- 最近使用模板记录
- 使用 `localStorage` 的本地 mock 数据持久化
- 基于 feature 的模块化代码组织
- ESLint 与 GitHub Actions CI

## 技术栈

- React
- Vite
- TypeScript
- React Router
- ESLint
- GitHub Actions

## 项目结构

```txt
dev-ai-toolkit/
├── docs/
├── public/
├── src/
│   ├── app/
│   │   ├── router/
│   │   ├── providers/
│   │   └── styles/
│   ├── components/
│   │   ├── common/
│   │   ├── layout/
│   │   └── ui/
│   ├── features/
│   │   ├── home/
│   │   ├── prompt-playground/
│   │   └── prompt-templates/
│   ├── hooks/
│   ├── lib/
│   ├── types/
│   ├── constants/
│   ├── assets/
│   ├── App.tsx
│   └── main.tsx
├── .github/
├── CONTRIBUTING.md
├── LICENSE
├── README.md
├── README.zh-CN.md
└── package.json
```

## 快速开始

### 环境要求

- Node.js 20 或更高版本
- 推荐使用 npm 10 或更高版本

### 安装依赖

```bash
npm install
```

### 启动开发环境

```bash
npm run dev
```

然后打开 Vite 在终端输出的本地地址，通常是：

```txt
http://localhost:5173
```

### 构建生产版本

```bash
npm run build
```

### 代码检查

```bash
npm run lint
```

### 预览生产构建

```bash
npm run preview
```

## 主要模块

### Overview

首页会先解释项目价值、当前核心工作流、主要模块以及路线节奏，让第一次进入项目的人能快速理解这个工具的定位。

### Prompt Templates

当前支持：

- 浏览所有模板
- 创建模板
- 编辑模板
- 搜索与标签筛选
- 查看模板详情
- 复制模板
- 删除模板

### Prompt Playground

当前支持：

- 从已有模板中选择 prompt
- 自动识别 `{{variable}}` 变量占位符
- 填写变量值
- 实时预览最终 `system prompt` 和 `user prompt`
- 复制生成后的 prompt
- 保存最近使用模板

## 如何使用

当前推荐的使用路径非常直接：

1. 创建或导入一个可复用的 Prompt 模板
2. 在 Playground 中选择模板
3. 填写任务相关变量
4. 预览并复制最终 prompt，带入你的 AI 工作流

## 开发原则

这个项目遵循几个核心原则：

- 保持代码简单、可读、易扩展
- 优先采用按功能拆分的结构，而不是把所有页面堆平
- 先做能用的原型，再逐步演化成完整产品
- 避免“假复杂度”，保证每个模块都能独立维护

## 路线图

后续方向包括：

- Prompt 模板导入 / 导出
- 更完整的 Playground 能力
- 更多 AI 开发者工具模块
- 更完善的开源文档与展示素材
- 向真正的 AI 开发工作台演进

更长期的产品规划见：[docs/roadmap.md](./docs/roadmap.md)

## 贡献

欢迎贡献。提交 PR 前请先阅读 [CONTRIBUTING.md](./CONTRIBUTING.md)。

## License

本项目采用 [MIT License](./LICENSE)。
