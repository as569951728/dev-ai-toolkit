**语言版本：** [English](./README.md) | 简体中文

# dev-ai-toolkit

一个面向开发者的实用型开源 AI 工具箱，基于 React、Vite 和 TypeScript 构建。

这个项目不是一次性的 demo，而是按照真实、清晰、可扩展的前端产品方式持续开发。它的目标是为开发者提供一个结构化的 **AI developer toolbox**，用来承载常见的 AI 辅助开发流程，例如 prompt 编排、数据载荷检查、请求草拟和输出审阅。

## 为什么做这个项目

开发者在使用 AI 时，经常会重复遇到这些问题：

- 相似场景下反复重写 prompt
- prompt、请求数据和输出结果分散在不同工具里
- 缺少一个清晰的工具入口来组织 AI 开发工作流

`dev-ai-toolkit` 希望把这些重复场景沉淀成一个聚焦、清晰、可扩展的开源产品，并为后续团队协作能力预留空间。

## 当前功能

当前版本已经包含：

- 首页 Overview 展示页
- Prompt 模板列表页
- Prompt 模板的新建、编辑、详情、复制、删除
- Prompt 模板搜索、标签筛选、导入 / 导出 JSON
- Prompt Playground
- Prompt Diff
- JSON Tools
- API Builder
- Code Viewer
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
│   │   ├── api-builder/
│   │   ├── code-viewer/
│   │   ├── json-tools/
│   │   ├── prompt-playground/
│   │   ├── prompt-diff/
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

当前工具箱按两类能力组织。

### Overview

首页会先解释项目价值、模块分组、工作流方向和路线节奏，让第一次进入项目的人能快速理解这个工具箱的定位。

### Prompt Workflows

#### Prompt Templates

当前支持：

- 浏览所有模板
- 创建模板
- 编辑模板
- 搜索与标签筛选
- 查看模板详情
- 复制模板
- 删除模板
- 导入 / 导出 JSON

#### Prompt Playground

当前支持：

- 从已有模板中选择 prompt
- 自动识别 `{{variable}}` 变量占位符
- 填写变量值
- 实时预览最终 `system prompt` 和 `user prompt`
- 复制生成后的 prompt
- 保存最近使用模板

#### Prompt Diff

当前支持：

- 左右两侧比较不同 prompt 版本
- 检查新增 / 删除的变量占位符
- 检查新增 / 删除的文本行
- 分别复制左右两边内容

### Developer Utilities

#### JSON Tools

当前支持：

- JSON 格式化
- JSON 压缩
- JSON 校验
- 复制处理结果

#### API Builder

当前支持：

- 组织 URL、Query、Headers、JSON Body
- 生成可复用的 `fetch` 示例代码
- 快速加载示例请求

#### Code Viewer

当前支持：

- 单栏 / 双栏查看代码与文本输出
- 行级阅读
- 比较不同输出版本
- 快速复制内容

## 如何使用

当前推荐有几条典型使用路径：

1. 在 `Prompt Templates` 中创建或导入模板，再进入 `Prompt Playground`
2. 在 `Prompt Diff` 中比较 prompt 的改写前后差异
3. 在 `JSON Tools` 和 `API Builder` 中处理请求载荷与接口草稿
4. 在 `Code Viewer` 中审阅 AI 生成的输出结果

## 开发原则

这个项目遵循几个核心原则：

- 保持代码简单、可读、易扩展
- 优先采用按功能拆分的结构，而不是把所有页面堆平
- 先做能用的原型，再逐步演化成完整产品
- 避免“假复杂度”，保证每个模块都能独立维护

## 路线图

后续方向包括：

- 模块之间更清晰的工作流连接
- 更稳的 prompt 数据层边界
- 最小可行的自动化测试体系
- 更完善的开源文档与展示素材

更长期的产品规划见：[docs/roadmap.md](./docs/roadmap.md)

## 贡献

欢迎贡献。提交 PR 前请先阅读 [CONTRIBUTING.md](./CONTRIBUTING.md)。

## License

本项目采用 [MIT License](./LICENSE)。
