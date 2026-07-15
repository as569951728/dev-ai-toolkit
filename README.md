**Languages:** English | [简体中文](./README.zh-CN.md)

# dev-ai-toolkit

[![CI](https://github.com/as569951728/dev-ai-toolkit/actions/workflows/ci.yml/badge.svg)](https://github.com/as569951728/dev-ai-toolkit/actions/workflows/ci.yml)

`dev-ai-toolkit` is a local-first browser workspace for reusable prompt work.
It keeps prompt templates, composed prompt snapshots, review notes, and manual
backups together, with a few small developer utilities alongside that workflow.

## What It Does

The main workflow is designed for repeated tasks such as code review, API
design, and incident analysis:

- Maintain versioned prompt templates and fill their variables in a Playground
- Save composed system and user prompts as local snapshots for later review
- Search, compare, annotate, export, reuse, or back up those snapshots

JSON Tools, API Builder, Prompt Diff, and Code Viewer support nearby development
tasks. They are not a model runtime or an agent platform.

The current app has no backend, account system, cloud sync, or built-in model
provider. Workflow data stays in the active browser profile unless it is
exported manually.

## Quick Start

Requirements:

- Node.js 20.19+, or Node.js 22.12+
- npm 10 or later recommended

Clone the repository, install the locked dependencies, and start Vite:

```bash
git clone https://github.com/as569951728/dev-ai-toolkit.git
cd dev-ai-toolkit
npm ci
npm run dev
```

Open the URL printed by Vite, usually
[http://localhost:5173](http://localhost:5173).

Create and preview a production build with:

```bash
npm run build
npm run preview
```

## Live Demo

The public build is available at
[https://dev-ai-toolkit.vercel.app](https://dev-ai-toolkit.vercel.app).

The canonical deployment currently serves
[`8c44091`](https://github.com/as569951728/dev-ai-toolkit/commit/8c44091ccd40f86fc594cea85ef204e51a1d6c19).
On 2026-07-15, its home, Playground, Run History, and Workspace Backup routes
loaded successfully in a clean Chromium session. The complete template-to-run
walkthrough was verified separately against the
[`v0.2.0` release commit](https://github.com/as569951728/dev-ai-toolkit/commit/8ed3825fcf007bfa2965da015ec7066f437797b3).
Demo data remains in that browser profile; it is not synchronized to a server.

See [Deployment](./docs/deployment.md) for deployment and verification details.

## Core Workflow

1. Create or select a prompt in **Prompt Templates**.
2. Open it in **Prompt Playground**, fill its variables, and review the composed
   system and user prompts.
3. Copy the prompt into an external AI tool or save it as a local snapshot.
4. Use **Run History** to search snapshots, add review notes, compare source
   revisions, inspect variables, or reuse a snapshot as a new template draft.
5. Export individual records or use **Workspace Backup** to move the supported
   local collections between browser profiles.

Playground variable names support letters, numbers, underscores, hyphens, and
dots, including `{{repository_name}}` and `{{pull-request.title}}`. Empty values
keep their placeholders in copied and saved prompts; a warning is shown without
blocking either action.

The [prompt workflow walkthrough](./docs/prompt-workflow-walkthrough.md) follows
this path in more detail.

![dev-ai-toolkit overview](./docs/assets/app-overview.png)

## Current Modules

| Group | Module | Current scope |
| --- | --- | --- |
| Prompt workflow | Prompt Templates | Create, edit, duplicate, archive, restore, compare, filter, import, and export versioned templates |
| Prompt workflow | Prompt Playground | Resolve template variables, preview or copy composed prompts, and save local snapshots |
| Prompt workflow | Run History | Search and filter saved snapshots, manage notes, compare revisions, import or export a run, and reopen saved inputs |
| Prompt workflow | Prompt Diff | Compare prompt text and placeholder changes without putting prompt content in the URL |
| Utility | JSON Tools | Format, validate, minify, and copy JSON, including variables opened from a saved run |
| Utility | API Builder | Draft URLs, query parameters, headers, JSON bodies, `fetch` snippets, and cURL commands without sending requests |
| Utility | Code Viewer | Read or compare code and generated text locally |
| Workspace | Workspace Backup | Export and import templates, runs, notes, and recent Playground shortcuts as versioned JSON |

## Local Data And Limitations

- Data is persisted in `localStorage` for the active browser profile.
- Template, run, and workspace JSON imports have a shared 5 MB file limit.
- Workspace imports merge supported records by identifier; the confirmation
  preview shows the affected collections before writing.
- Other tabs in the same browser profile receive storage updates. Unsaved
  template and note drafts are protected, but concurrent edits still use the
  browser's last persisted write rather than field-level merging.
- If a local collection cannot be read, the app blocks writes to that collection
  and offers the original bytes for download before an explicit reset.
- Local storage is not encryption. Do not store production secrets, access
  tokens, or credentials in prompts, notes, or API Builder drafts.
- Prompt content passed between internal review tools uses browser history
  state. List search terms remain in the URL so filters can survive navigation.
- There is no automatic backup, account recovery, multi-device sync, or server
  API in the current release.

For data relationships and module boundaries, see
[Architecture](./docs/architecture.md).

## Development

The project uses React, Vite, TypeScript, React Router, Vitest, Playwright, and
ESLint. Run the local quality checks with:

```bash
npm run audit
npm run lint
npm run test:coverage
npm run build
```

Install Playwright's Chromium runtime once before the browser suite:

```bash
npx playwright install chromium
npm run test:e2e
```

GitHub Actions runs the same quality gate for pull requests and `main`.

## Project Documentation

- [Architecture](./docs/architecture.md)
- [Prompt workflow walkthrough](./docs/prompt-workflow-walkthrough.md)
- [Roadmap](./docs/roadmap.md)
- [Deployment](./docs/deployment.md)
- [Changelog](./CHANGELOG.md)
- [Release notes](./docs/releases/)

## Contributing

Small bug fixes, documentation corrections, and scoped workflow improvements are
welcome. Read [CONTRIBUTING.md](./CONTRIBUTING.md) before opening a pull request.

## Security

Please report vulnerabilities through the process in
[SECURITY.md](./SECURITY.md), not through a public issue.

## License

This project is available under the [MIT License](./LICENSE).
