**Languages:** English | [简体中文](./README.zh-CN.md)

# dev-ai-toolkit

A practical open-source AI toolkit for developers, built with React, Vite, and TypeScript.

This project is being developed as a real, structured, and extensible front-end application rather than a one-off demo. The goal is to provide a clean **AI developer toolbox** for common AI-assisted workflows such as prompt authoring, payload inspection, request scaffolding, and output review.

## Why This Project

Developers often use AI across repeated workflows:

- Reusing prompt templates for debugging, code review, and API design
- Organizing AI inputs, request data, and output review in a clearer way
- Building lightweight internal tooling without a heavy backend at the start

`dev-ai-toolkit` aims to turn those workflows into a focused, open-source product with a clear architecture, a practical user experience, and a path toward stronger team workflows later.

## Current Features

The current version includes:

- Overview landing page
- Prompt template list, create, edit, detail, duplicate, and delete flows
- Prompt template search and tag filtering
- Prompt template import and export via JSON
- Prompt Playground with variable detection and live prompt preview
- Prompt Diff for comparing prompt revisions and variable drift
- JSON Tools for formatting, validating, and minifying payloads
- API Builder for drafting request configurations and fetch snippets
- Code Viewer for reading code or generated output in single or compare mode
- Recent template history in the playground
- Local mock data with browser persistence via `localStorage`
- Feature-based code organization with reusable hooks and components
- ESLint and GitHub Actions CI

## Tech Stack

- React
- Vite
- TypeScript
- React Router

## Project Structure

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

## Getting Started

### Requirements

- Node.js 20 or later
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

### Lint The Codebase

```bash
npm run lint
```

### Preview The Production Build

```bash
npm run preview
```

## Current Modules

The toolbox is currently organized around two capability groups.

### Overview

The home page explains the product value, module groups, workflow direction, and roadmap rhythm so first-time users can understand the project quickly.

### Prompt Workflows

#### Prompt Templates

It currently supports:

- Viewing all prompt templates
- Creating a new template
- Editing an existing template
- Searching by keywords
- Filtering by tags
- Previewing template details
- Duplicating and deleting templates
- Importing and exporting templates as JSON

The data source is intentionally local for the first iteration:

- Initial data comes from a mock dataset
- User changes are persisted in `localStorage`
- The hook and page structure are designed so the data layer can later be replaced by a real API

#### Prompt Playground

The playground turns stored templates into ready-to-use prompt output.

It currently supports:

- Selecting a stored prompt template
- Detecting template variables like `{{repository_name}}`
- Filling variable inputs
- Previewing the final `system prompt` and `user prompt`
- Copying generated prompt output
- Saving recent template usage locally

#### Prompt Diff

The prompt diff workspace helps compare prompt revisions before they become shared team habits.

It currently supports:

- Comparing two prompt versions side by side
- Detecting added and removed variables
- Highlighting added and removed lines
- Copying either side for reuse

### Developer Utilities

#### JSON Tools

This module supports:

- Formatting JSON
- Minifying JSON
- Validating JSON
- Copying processed output
- Loading sample payloads quickly

#### API Builder

This module supports:

- Drafting request URLs with query params
- Managing headers and JSON body input
- Generating a ready-to-use `fetch` snippet
- Copying request output for reuse

#### Code Viewer

This module supports:

- Reading code or text output in a clearer layout
- Single-pane and compare modes
- Line-aware inspection
- Copy actions for each input side

## How It Works

The current toolbox offers a few simple starting paths:

1. Start in `Prompt Templates` and move into `Prompt Playground`
2. Review prompt revisions in `Prompt Diff`
3. Use `JSON Tools` or `API Builder` when working with payloads and request scaffolds
4. Use `Code Viewer` to inspect generated output or rewritten content

## Development Principles

This project follows a few practical rules:

- Keep the codebase simple, readable, and easy to extend
- Prefer feature-based structure over flat page-level files
- Start from working prototypes, then evolve into production-ready modules
- Avoid fake complexity and keep each feature independently maintainable

## Roadmap

Planned next steps include:

- Better connections across existing modules
- Stronger data boundaries for future API-backed growth
- A minimal automated testing baseline
- Better open-source documentation and examples

See the longer-term product direction in [docs/roadmap.md](./docs/roadmap.md).

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](./CONTRIBUTING.md) before opening a pull request.

## License

This project is licensed under the [MIT License](./LICENSE).
