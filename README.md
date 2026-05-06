**Languages:** English | [简体中文](./README.zh-CN.md)

# dev-ai-toolkit

A practical open-source AI toolkit for developers, built with React, Vite, and TypeScript.

This project is a local-first **AI developer toolbox** for a small set of practical workflows such as prompt authoring, payload inspection, request scaffolding, and output review.

## Why This Project

Developers often use AI across repeated workflows:

- Reusing prompt templates for debugging, code review, and API design
- Organizing AI inputs, request data, and output review in a clearer way
- Building lightweight internal tooling without a heavy backend at the start

`dev-ai-toolkit` is an attempt to keep those workflows in one place without introducing a backend too early.

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

### Deploy To Vercel

See [docs/deployment/vercel.md](./docs/deployment/vercel.md) for the current Vercel deployment notes and limitations.

## Current Modules

The toolbox is currently organized around two capability groups.

### Overview

The home page introduces the current modules, the main workflow, and the short-term direction of the project.

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

The current storage model is intentionally local-first:

- Initial data comes from a mock dataset
- User changes are persisted in `localStorage`
- The current repository and provider structure is meant to keep a future API option open

#### Prompt Playground

The playground turns stored templates into runnable prompt output.

It currently supports:

- Selecting a stored prompt template
- Detecting template variables like `{{repository_name}}`
- Filling variable inputs
- Previewing the final `system prompt` and `user prompt`
- Copying generated prompt output
- Saving recent template usage locally

#### Prompt Diff

The prompt diff workspace compares prompt revisions side by side.

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

The most complete workflow in the current version looks like this:

1. Start in `Prompt Templates` and move into `Prompt Playground`
2. Save a prompt run from the playground
3. Review revisions in `Prompt Diff`
4. Inspect related output in `Code Viewer`

Other modules such as `JSON Tools` and `API Builder` are available as supporting utilities.

## Development Notes

Current maintenance priorities:

- Keep the codebase small and easy to review
- Prefer incremental improvements over large rewrites
- Improve connected workflows before adding many new standalone pages
- Keep persistence and testing credible as the local data model grows

## Roadmap

Current next steps include:

- Better connections across existing modules
- Stronger data boundaries for future API-backed growth
- More workflow-level test coverage
- Better open-source documentation and examples

See the longer-term product direction in [docs/roadmap.md](./docs/roadmap.md).

## Releases

- [Changelog](./CHANGELOG.md)
- [v0.1.0 release notes](./docs/releases/v0.1.0.md)

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](./CONTRIBUTING.md) before opening a pull request.

## License

This project is licensed under the [MIT License](./LICENSE).
