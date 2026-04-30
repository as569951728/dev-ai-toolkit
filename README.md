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

- Prompt template list page
- Create prompt template
- Edit prompt template
- Local mock data with browser persistence via `localStorage`
- Feature-based code organization with reusable hooks and components

## Tech Stack

- React
- Vite
- TypeScript
- React Router

## Project Structure

```txt
dev-ai-toolkit/
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
│   │   └── prompt-templates/
│   ├── hooks/
│   ├── lib/
│   ├── types/
│   ├── constants/
│   ├── assets/
│   ├── App.tsx
│   └── main.tsx
├── CONTRIBUTING.md
├── LICENSE
├── README.md
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

### Preview The Production Build

```bash
npm run preview
```

## Prompt Template Module

The first module in the project is `Prompt Templates`.

It currently supports:

- Viewing all prompt templates
- Creating a new template
- Editing an existing template

The data source is intentionally local for the first iteration:

- Initial data comes from a mock dataset
- User changes are persisted in `localStorage`
- The hook and page structure are designed so the data layer can later be replaced by a real API

## Development Principles

This project follows a few practical rules:

- Keep the codebase simple, readable, and easy to extend
- Prefer feature-based structure over flat page-level files
- Start from working prototypes, then evolve into production-ready modules
- Avoid fake complexity and keep each feature independently maintainable

## Roadmap

Planned next steps include:

- Prompt detail preview
- Template deletion and duplication
- Search and tag filtering
- More AI developer tools beyond prompt management
- Better open-source documentation and examples

See the longer-term product direction in [docs/roadmap.md](./docs/roadmap.md).

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](./CONTRIBUTING.md) before opening a pull request.

## License

This project is licensed under the [MIT License](./LICENSE).
