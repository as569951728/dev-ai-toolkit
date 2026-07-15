# dev-ai-toolkit

[![CI](https://github.com/as569951728/dev-ai-toolkit/actions/workflows/ci.yml/badge.svg)](https://github.com/as569951728/dev-ai-toolkit/actions/workflows/ci.yml)

**语言版本：** [English](./README.md) | 简体中文

`dev-ai-toolkit` 是一个本地优先的浏览器 Prompt 工作区，用来集中维护 Prompt
模板、组合后的 Prompt 快照、复核备注和手动备份，并提供几项与这条工作流相邻的
开发辅助工具。

## 用途

主工作流面向代码审查、接口设计、故障分析等重复任务：

- 维护带版本记录的 Prompt 模板，并在 Playground 中填写变量
- 把组合后的 system prompt 和 user prompt 保存为本地快照
- 搜索、比较、备注、导出、复用或备份这些快照

JSON Tools、API Builder、Prompt Diff 和 Code Viewer 用来处理相邻的开发工作。
它们不是模型运行时，也不是 Agent 平台。

当前应用没有后端、账号系统、云同步或内置模型供应商。除非手动导出，工作区数据
只保存在当前浏览器配置中。

## 快速开始

环境要求：

- Node.js 20.19+，或 Node.js 22.12+
- 推荐 npm 10 或更高版本

克隆仓库、安装锁定版本的依赖并启动 Vite：

```bash
git clone https://github.com/as569951728/dev-ai-toolkit.git
cd dev-ai-toolkit
npm ci
npm run dev
```

打开 Vite 输出的地址，通常是
[http://localhost:5173](http://localhost:5173)。

构建并预览生产版本：

```bash
npm run build
npm run preview
```

## Live Demo

公开部署地址：
[https://dev-ai-toolkit.vercel.app](https://dev-ai-toolkit.vercel.app)。

2026-07-15 已使用干净浏览器验证应用版本
[`4808d6a`](https://github.com/as569951728/dev-ai-toolkit/commit/4808d6a6901a4e91f8424c7ed7a0a59829cfb7cf)。
新建模板、Playground 变量组合、保存和复核运行记录、导出工作区、刷新嵌套路由和
键盘跳过导航均通过。Demo 数据只保存在当前浏览器，不会同步到服务端。

部署和验证细节见 [部署说明](./docs/deployment.md)。

## 核心工作流

1. 在 **Prompt Templates** 中新建或选择模板。
2. 进入 **Prompt Playground**，填写变量并检查组合后的 system prompt 和 user
   prompt。
3. 把 Prompt 复制到外部 AI 工具，或保存为本地快照。
4. 在 **Run History** 中搜索快照、添加复核备注、比较源版本、检查变量，或把快照
   复用为新的模板草稿。
5. 导出单条记录，或通过 **Workspace Backup** 在浏览器配置之间迁移受支持的本地
   数据集合。

Playground 变量名支持字母、数字、下划线、连字符和点号，例如
`{{repository_name}}` 和 `{{pull-request.title}}`。空值会在复制和保存的 Prompt 中
保留原占位符；页面会显示提醒，但不会阻止这两个操作。

[Prompt 工作流说明](./docs/prompt-workflow-walkthrough.md)提供了更完整的操作路径。

![dev-ai-toolkit overview](./docs/assets/app-overview.png)

## 当前模块

| 分组 | 模块 | 当前范围 |
| --- | --- | --- |
| Prompt 工作流 | Prompt Templates | 新建、编辑、复制、归档、恢复、比较、筛选、导入和导出带版本记录的模板 |
| Prompt 工作流 | Prompt Playground | 解析模板变量、预览或复制组合后的 Prompt，并保存本地快照 |
| Prompt 工作流 | Run History | 搜索和筛选快照、维护备注、比较版本、导入或导出单条记录，并重新打开已保存输入 |
| Prompt 工作流 | Prompt Diff | 比较 Prompt 文本和占位符变化，不把 Prompt 内容写入 URL |
| 辅助工具 | JSON Tools | 格式化、校验、压缩和复制 JSON，也可以读取已保存运行记录中的变量 |
| 辅助工具 | API Builder | 整理 URL、Query、Headers、JSON Body、`fetch` 示例和 cURL 命令，但不发送请求 |
| 辅助工具 | Code Viewer | 在本地阅读或比较代码和生成文本 |
| 工作区 | Workspace Backup | 以带版本的 JSON 导入或导出模板、运行记录、备注和最近使用的 Playground 入口 |

## 本地数据和当前限制

- 数据保存在当前浏览器配置的 `localStorage` 中。
- 模板、运行记录和工作区 JSON 导入共用 5 MB 文件大小限制。
- 工作区导入按标识符合并受支持的记录，写入前会在确认界面中预览受影响的数据集合。
- 同一浏览器配置中的其他标签页可以收到存储更新。未保存的模板和备注草稿会受到
  保护，但并发编辑仍以浏览器最后一次持久化写入为准，不会逐字段合并。
- 如果本地数据集合无法读取，应用会阻止继续写入，并允许在明确重置前下载原始数据。
- 本地存储不是加密存储。不要在 Prompt、备注或 API Builder 草稿中保存生产密钥、
  Access Token 或账号凭据。
- 内部复核工具通过浏览器 history state 传递 Prompt 内容。列表搜索词会保留在 URL
  中，以便筛选条件可以在页面跳转后继续使用。
- 当前版本没有自动备份、账号恢复、多设备同步或服务端 API。

数据关系和模块边界见 [架构说明](./docs/architecture.md)。

## 开发

项目使用 React、Vite、TypeScript、React Router、Vitest、Playwright 和 ESLint。
本地质量检查命令：

```bash
npm run audit
npm run lint
npm run test:coverage
npm run build
```

首次运行浏览器测试前安装 Playwright Chromium：

```bash
npx playwright install chromium
npm run test:e2e
```

GitHub Actions 会在 Pull Request 和 `main` 上执行相同的质量门。

## 项目文档

- [架构说明](./docs/architecture.md)
- [Prompt 工作流说明](./docs/prompt-workflow-walkthrough.md)
- [路线图](./docs/roadmap.md)
- [部署说明](./docs/deployment.md)
- [变更记录](./CHANGELOG.md)
- [发布说明](./docs/releases/)

## 贡献

欢迎提交小范围 Bug 修复、文档更正和工作流改进。发起 Pull Request 前请先阅读
[CONTRIBUTING.md](./CONTRIBUTING.md)。

## 安全

请通过 [SECURITY.md](./SECURITY.md) 中的方式报告安全问题，不要创建公开 Issue。

## License

本项目使用 [MIT License](./LICENSE)。
