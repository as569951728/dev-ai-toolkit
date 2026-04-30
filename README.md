**Languages:** English | [简体中文](./README.zh-CN.md)

# dev-ai-toolkit

A practical open-source AI toolkit for developers, built with React, Vite, and TypeScript.

This project is being developed as a real, structured, and extensible front-end application rather than a one-off demo. The goal is to provide a clean workspace for common AI-assisted development workflows such as prompt management, developer utilities, and future tooling modules.

## Why This Project

Developers often use AI across repeated workflows:

- Reusing prompt templates for debugging, code review, and API design
- Organizing AI inputs in a clearer and more maintainable way
- Building lightweight internal tooling without a heavy backend at the start

`dev-ai-toolkit` aims to turn those workflows into a focused, open-source product with a clear architecture and a practical user experience.

## Current Features

The current version includes:

- Overview landing page
- Prompt template list, create, edit, detail, duplicate, and delete flows
- Prompt template search and tag filtering
- Prompt template import and export via JSON
- Prompt Playground with variable detection and live prompt preview
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

### Overview

The home page explains the product value, current workflow, module entry points, and roadmap rhythm so first-time users can understand the project quickly.

### Prompt Templates

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

### Prompt Playground

The playground turns stored templates into ready-to-use prompt output.

It currently supports:

- Selecting a stored prompt template
- Detecting template variables like `{{repository_name}}`
- Filling variable inputs
- Previewing the final `system prompt` and `user prompt`
- Copying generated prompt output
- Saving recent template usage locally

## How It Works

The core workflow is intentionally simple:

1. Create or import a reusable prompt template
2. Open the template in the playground
3. Fill task-specific variables
4. Preview and copy the final prompt output into your AI workflow

## Development Principles

This project follows a few practical rules:

- Keep the codebase simple, readable, and easy to extend
- Prefer feature-based structure over flat page-level files
- Start from working prototypes, then evolve into production-ready modules
- Avoid fake complexity and keep each feature independently maintainable

## Roadmap

Planned next steps include:

- Landing page polish and project screenshots
- More prompt workflow refinements
- More AI developer tools beyond prompt management
- Better open-source documentation and examples

See the longer-term product direction in [docs/roadmap.md](./docs/roadmap.md).

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](./CONTRIBUTING.md) before opening a pull request.

## License

This project is licensed under the [MIT License](./LICENSE).
