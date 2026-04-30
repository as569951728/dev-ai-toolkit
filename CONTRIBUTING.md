# Contributing to dev-ai-toolkit

Thanks for your interest in contributing.

This project is still in an early stage, so the most helpful contributions are focused, practical, and easy to review.

## Before You Start

Please make sure your contribution is aligned with the project goals:

- Keep the project realistic and maintainable
- Prefer small, clear improvements over large speculative changes
- Preserve the existing feature-based structure
- Avoid introducing unnecessary dependencies

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Verify the production build:

```bash
npm run build
```

## Contribution Scope

Good first contributions include:

- Fixing bugs
- Improving UI clarity
- Refining TypeScript types
- Improving accessibility
- Adding tests and developer docs
- Extending existing modules in a clean way

Please avoid:

- Large refactors without prior discussion
- Replacing core stack decisions
- Adding backend services unless the change is clearly justified

## Workflow

1. Fork the repository
2. Create a focused branch
3. Make your changes
4. Verify the app still builds
5. Open a pull request with a clear description

## Pull Request Guidelines

Please keep pull requests:

- Small enough to review comfortably
- Clear about the problem being solved
- Consistent with the current code style
- Limited to one main change when possible

A good pull request description should include:

- What changed
- Why it changed
- How it was verified

## Code Style

This project prefers:

- TypeScript-first implementation
- Small, focused components
- Reusable hooks for stateful logic
- Readable naming over clever abstractions
- Minimal but meaningful comments

## Reporting Issues

When opening an issue, please include:

- Current behavior
- Expected behavior
- Reproduction steps
- Screenshots if the issue is UI-related

## Questions and Proposals

If you want to propose a larger feature or structural change, please open an issue first so we can align on scope before implementation.
