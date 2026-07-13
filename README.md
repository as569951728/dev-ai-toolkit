**Languages:** English | [简体中文](./README.zh-CN.md)

# dev-ai-toolkit

[![CI](https://github.com/as569951728/dev-ai-toolkit/actions/workflows/ci.yml/badge.svg)](https://github.com/as569951728/dev-ai-toolkit/actions/workflows/ci.yml)

Local-first prompt workflows with a small set of supporting developer utilities.

The main workflow covers reusable prompt templates, variable composition, saved
prompt snapshots, review notes, and manual workspace backup. JSON Tools, API
Builder, and Code Viewer are included as adjacent utilities rather than a broader
AI platform.

## Why This Project

Prompt work often becomes difficult to reuse once it is spread across chat
history, scratch files, and one-off scripts. This project keeps a small part of
that work in a browser-based local workspace:

- Maintain templates for repeated tasks such as code review and API design
- Fill template variables and save the composed prompts as snapshots
- Reopen, compare, annotate, export, or back up those snapshots later

There is no backend, account system, model runtime, or cloud sync in the current
version. Data stays in the active browser profile unless it is exported manually.

## Current Features

The current version includes:

- Overview landing page
- Prompt template list, create, edit, detail, duplicate, archive, restore, and delete flows
- Prompt template search and tag filtering
- Prompt template import and export via JSON
- Prompt Playground with dotted, underscored, and hyphenated variable names,
  unresolved-placeholder guidance, and live prompt preview
- Prompt Diff for comparing prompt revisions and variable drift
- Prompt Run History for browsing, filtering, previewing variables, searching prompt text and notes, comparing with source templates, importing/exporting run JSON, deleting local runs, and reusing saved prompt runs as Playground inputs or new template drafts
- JSON Tools for formatting, validating, and minifying payloads, including
  captured variables opened from a saved run
- API Builder for drafting request configurations, fetch snippets, and cURL commands
- Code Viewer for reading code or generated output in single or compare mode
- Workspace Backup for exporting and importing local templates, saved runs, notes, and recent playground shortcuts as JSON
- Recent template history in the playground
- Local browser persistence via `localStorage`
- Feature-based code organization
- ESLint, tests, and GitHub Actions CI

## Tech Stack

- React
- Vite
- TypeScript
- React Router

## Project Structure

```txt
dev-ai-toolkit/
├── .github/
├── docs/
├── public/
├── src/
│   ├── app/
│   │   ├── router/
│   │   └── styles/
│   ├── components/
│   │   └── layout/
│   ├── features/
│   │   ├── api-builder/
│   │   ├── code-viewer/
│   │   ├── home/
│   │   ├── json-tools/
│   │   ├── prompt-diff/
│   │   ├── prompt-playground/
│   │   ├── prompt-run-notes/
│   │   ├── prompt-runs/
│   │   ├── prompt-templates/
│   │   ├── prompt-workflows/
│   │   └── workspace-backup/
│   ├── lib/
│   ├── test/
│   ├── types/
│   ├── App.tsx
│   └── main.tsx
├── CONTRIBUTING.md
├── LICENSE
├── README.md
├── README.zh-CN.md
└── package.json
```

## Getting Started

### Requirements

- Node.js 20.19+, or Node.js 22.12+
- npm 10 or later recommended

### Installation

```bash
npm install
```

### Run In Development

```bash
npm run dev
```

Then open the local URL shown by Vite in your terminal, usually:

```txt
http://localhost:5173
```

### Build For Production

```bash
npm run build
```

### Run Tests

```bash
npm run test
```

The browser smoke tests cover the main prompt workflow and a workspace backup
round trip. Install their Chromium runtime once, then run them with:

```bash
npx playwright install chromium
npm run test:e2e
```

### Lint The Codebase

```bash
npm run lint
```

### Check Dependencies

```bash
npm run audit
```

### Preview The Production Build

```bash
npm run preview
```

## Live Demo

A public Vercel URL is available, but it is not yet verified as tracking the
latest `main` branch. If you need to test the exact current repository state,
run the app locally for now.

- Candidate URL: [https://dev-ai-toolkit.vercel.app](https://dev-ai-toolkit.vercel.app)
- Verification status: reachable on 2026-06-12, but the deployment has not
  been tied back to the latest `main` commit yet
- Tracking issue: [#14](https://github.com/as569951728/dev-ai-toolkit/issues/14)

See [docs/deployment.md](./docs/deployment.md) for the current deployment notes.

## Visual Walkthrough

The current UI is still small and local-first. These screenshots are captured
from the running app and are meant to show the real workflow rather than a
polished marketing mockup.

![dev-ai-toolkit overview](./docs/assets/app-overview.png)

For the main prompt workflow path, see
[docs/prompt-workflow-walkthrough.md](./docs/prompt-workflow-walkthrough.md).

### Deploy To Vercel

This app can be deployed as a static Vite site. See
[docs/deployment.md](./docs/deployment.md) for the setup and verification
steps.

## Current Modules

The app is currently organized around the main prompt workflow and a secondary
set of developer utilities.

| Group | Module | Current capabilities | Notes |
| --- | --- | --- | --- |
| Core | Overview | Introduces the module groups, main workflow, and near-term direction | Landing page for first-time users |
| Prompt Workflows | Prompt Templates | Create, edit, duplicate, archive, restore, delete, filter, import, and export templates | Active templates can open in the playground; all templates can open filtered run history |
| Prompt Workflows | Prompt Playground | Select templates, fill variables, preview or copy labeled composed prompts, save run snapshots, and keep recent template usage | Main path for composing reusable prompts |
| Prompt Workflows | Prompt Diff | Compare prompt revisions, detect variable drift, and inspect line-level wording changes | Best used after editing or templating changes |
| Prompt Workflows | Prompt Run History | Browse saved runs, filter by template, preview captured variables, search saved prompt text and notes, open run details, copy full saved prompts, add notes, import or export a single run, compare with source templates, delete stale runs, and reuse saved prompts in the Playground or a new template draft | Dedicated history view for saved prompt snapshots |
| Developer Utilities | JSON Tools | Format, validate, minify, copy, and sample JSON payloads, or load the captured variable object from Run Detail | Useful for debugging saved inputs and other payloads |
| Developer Utilities | API Builder | Draft request URLs, headers, query params, JSON bodies, `fetch` snippets, and cURL commands | Local request scaffolding only |
| Developer Utilities | Code Viewer | Inspect generated text or code in single or compare mode | Supports prompt and output review workflows |
| Workspace | Workspace Backup | Export and import local templates, saved runs, notes, and recent playground shortcuts as versioned JSON | Manual backup for the current browser profile |

The current storage model is intentionally local-first:

- A few starter templates are seeded on first load
- User changes and saved runs are persisted in `localStorage`
- Tabs do not synchronize live; editing the same workspace in multiple tabs can
  overwrite earlier local changes
- Workspace backups can export and restore local templates, saved runs, notes, and recent playground shortcuts
- Repository boundaries are in place so future API-backed work does not require rewriting page structure first

## How It Works

The most complete workflow in the current version looks like this:

1. Start in `Prompt Templates` and move into `Prompt Playground`
2. Copy the composed prompt into an external AI tool, or save it as a local run
   snapshot for later review
3. Open filtered `Prompt Run History` for the active template
4. Search saved runs by template name, saved prompt text, captured variable, or note content when reviewing older snapshots
5. Review captured variables from the list or open them in `JSON Tools`, compare a run with its source template, add a short note, import or export a run as JSON, or start a new editable template draft from the saved prompts
6. Continue into `Prompt Diff` or `Code Viewer`

Other modules such as `API Builder` remain available as supporting utilities.

## Development Notes

Current maintenance priorities:

- Keep the codebase small and easy to review
- Prefer incremental improvements over large rewrites
- Improve connected workflows before adding many new standalone pages
- Keep persistence and testing credible as the local data model grows

## Roadmap

Current next steps include:

- Verify the public demo after the current `main` changes are pushed
- Keep regression coverage around local import, export, and recovery behavior
- Decide whether another small supporting utility action belongs in the prompt workflow
- Prepare `v0.2.0` after CI, demo, documentation, and release notes agree

See the implementation roadmap in [docs/roadmap.md](./docs/roadmap.md).
For contributor-facing code structure notes, see [docs/architecture.md](./docs/architecture.md).

## Releases

- [Changelog](./CHANGELOG.md)
- [v0.1.0 release notes](./docs/releases/v0.1.0.md)

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](./CONTRIBUTING.md) before opening a pull request.

## Security

For security reporting guidance, see [SECURITY.md](./SECURITY.md).

## License

This project is licensed under the [MIT License](./LICENSE).
