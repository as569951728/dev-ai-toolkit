# Changelog

All notable changes to this project will be documented in this file.

The format is intentionally lightweight and human-readable.

## [v0.1.0] - 2026-05-06

Initial public release of `dev-ai-toolkit`.

### Added

- Prompt template management with create, edit, duplicate, delete, filtering, and JSON import/export
- Prompt Playground with variable detection, preview generation, and recent template usage
- Prompt Diff for comparing prompt revisions
- JSON Tools for formatting, validation, and minification
- API Builder for drafting request configurations and generating `fetch` snippets
- Code Viewer for reading code or text output in single or compare mode
- Prompt template version history with local restore support
- Prompt run snapshots and recent activity tracking
- Local-first repository and service layers for prompt templates and prompt runs
- GitHub Actions CI running `lint`, `test`, and `build`
- Initial automated tests for services, providers, and one workflow-level smoke path

### Notes

- This release is intentionally local-first and browser-based.
- There is no backend or account system yet.
- The current focus is establishing a credible open-source foundation with connected workflows.

For full release notes, see [docs/releases/v0.1.0.md](./docs/releases/v0.1.0.md).
