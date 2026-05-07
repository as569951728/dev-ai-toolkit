# dev-ai-toolkit

**语言版本：** [English](./README.md) | 简体中文

`dev-ai-toolkit` 是一个本地优先的开发者 AI 工具箱，基于 React、Vite 和 TypeScript 构建。

当前项目主要围绕几类日常开发场景展开：

- 维护和复用 prompt 模板
- 预览带变量的 prompt 输出
- 保存 prompt 运行记录并回看历史
- 处理 JSON、接口草稿和文本输出

## 适合做什么

这个仓库更适合下面这些场景：

- 为代码审查、接口设计、问题排查等重复任务维护 prompt 模板
- 在本地整理 prompt 输入、变量和输出结果
- 用 JSON Tools、API Builder、Code Viewer 处理相邻的开发辅助工作

目前它还是一个纯前端、本地优先的工具，没有后端和账号系统。

## 当前功能

- Overview 首页
- Prompt Templates
  - 列表、详情、新建、编辑、复制、归档、恢复、删除
  - 搜索、标签筛选
  - JSON 导入 / 导出
- Prompt Playground
  - 选择模板
  - 识别 `{{variable}}`
  - 填写变量并实时预览
  - 保存最近使用模板
  - 保存 run snapshot
- Prompt Diff
  - 比较 prompt 文本
  - 检查变量占位符变化
- Prompt Run History
  - 浏览已保存 runs
  - 按模板过滤
  - 按模板名搜索
  - 跳回模板详情或继续在下游工具中查看输出
- JSON Tools
  - 格式化、压缩、校验、复制
- API Builder
  - 组织 URL、Query、Headers、JSON Body
  - 生成 `fetch` 示例代码
- Code Viewer
  - 单栏 / 双栏查看文本和代码输出
  - 复制内容

## 技术栈

- React
- Vite
- TypeScript
- React Router
- Vitest
- ESLint

## 项目结构

```txt
dev-ai-toolkit/
├── docs/
├── public/
├── src/
│   ├── app/
│   ├── components/
│   ├── features/
│   ├── lib/
│   ├── types/
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

### 本地开发

```bash
npm run dev
```

默认会启动在 Vite 输出的本地地址，通常是：

```txt
http://localhost:5173
```

### 构建

```bash
npm run build
```

### 测试

```bash
npm run test
```

### 代码检查

```bash
npm run lint
```

## Live Demo

当前仓库还没有公开的演示地址。

如果后续部署到 Vercel，请把正式地址更新到这里，并同步维护部署说明。

### 部署说明

见 [docs/deployment.md](./docs/deployment.md)。

## 模块概览

| 分组 | 模块 | 当前能力 | 备注 |
| --- | --- | --- | --- |
| Core | Overview | 介绍模块分组、主路径和当前阶段方向 | 首页入口 |
| Prompt Workflows | Prompt Templates | 创建、编辑、复制、归档、恢复、删除、筛选、导入、导出模板 | 可以直接进入 Playground 或过滤后的 Run History |
| Prompt Workflows | Prompt Playground | 选择模板、填变量、预览输出、保存 run、保留最近使用模板 | 当前主工作流入口 |
| Prompt Workflows | Prompt Diff | 比较 prompt 文本、变量变化和行级差异 | 适合做模板改写后的复核 |
| Prompt Workflows | Prompt Run History | 浏览 runs、按模板过滤、按模板名搜索、继续在下游工具查看输出 | 已保存 prompt 输出的历史视图 |
| Developer Utilities | JSON Tools | 格式化、校验、压缩、复制、加载示例 | 适合调试 JSON 载荷 |
| Developer Utilities | API Builder | 组织请求参数并生成 `fetch` 代码 | 本地请求草稿工具 |
| Developer Utilities | Code Viewer | 单栏 / 双栏查看文本和代码输出 | 适合审阅 prompt 或生成结果 |

## 典型使用路径

当前比较完整的一条路径是：

1. 在 `Prompt Templates` 中创建或整理模板
2. 进入 `Prompt Playground` 填变量并预览输出
3. 保存 run snapshot
4. 在 `Prompt Run History` 里回看某个模板的输出历史
5. 在 `Prompt Diff` 或 `Code Viewer` 里继续检查结果

## 当前限制

- 所有数据都存放在浏览器 `localStorage`
- 没有后端、账号系统和跨设备同步
- 运行记录只保存在当前浏览器环境
- 一些开发辅助模块目前还是轻量工具页，和 prompt 主链路相比更独立

## 路线图

后续会继续做这些方向：

- 把现有模块连接得更顺
- 继续补运行历史和模板资产链
- 让本地持久化和测试更稳
- 保持文档和实际功能状态一致

更长期的规划见 [docs/roadmap.md](./docs/roadmap.md)。  
代码结构说明见 [docs/architecture.md](./docs/architecture.md)。

## 发布记录

- [Changelog](./CHANGELOG.md)
- [v0.1.0 release notes](./docs/releases/v0.1.0.md)

## 贡献

欢迎提交 issue 或 pull request。开始之前请先阅读 [CONTRIBUTING.md](./CONTRIBUTING.md)。

## License

本项目使用 [MIT License](./LICENSE)。
