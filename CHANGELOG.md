# Changelog

All notable changes to this project will be documented in this file.

The format is intentionally lightweight and human-readable.

## [Unreleased]

### Fixed

- Kept the full local prompt run history instead of trimming saved runs to the
  most recent 20 records
- Ignored malformed prompt template, prompt run, and prompt run note records
  when reading browser storage
- Rejected workspace backups whose notes reference runs missing from the backup
- Fixed API Builder query string generation for relative URLs that already
  include query parameters
- Clarified the Prompt Run History search placeholder now that note content is
  searchable

### Changed

- Updated GitHub Actions to current action runtimes and added dependency audit
  to CI
- Updated audited dependency resolutions for `react-router`, `react-router-dom`,
  and `brace-expansion`
- Added weekly Dependabot checks for npm and GitHub Actions dependencies
- Clarified that the public demo URL is still unverified and tracked in issue
  #14

### Added

- Added `SECURITY.md` and linked it from both README files
- Added CI status badges to the English and Simplified Chinese README files
- Prompt Run History search now includes captured variable names and values
- Expanded regression coverage for local storage schema helpers, Playground
  downstream links, Prompt Diff, JSON Tools, Code Viewer, API Builder, and
  template import behavior

## [v0.1.0] - 2026-05-06

Initial public release of `dev-ai-toolkit`.

### Added

- Prompt template management with create, edit, duplicate, archive, restore, delete, filtering, and JSON import/export
- Prompt Playground with variable detection, preview generation, and recent template usage
- Prompt Diff for comparing prompt revisions
- JSON Tools for formatting, validation, and minification
- API Builder for drafting request configurations and generating `fetch` snippets
- Code Viewer for reading code or text output in single or compare mode
- Prompt template version history with local restore support
- Prompt run snapshots, dedicated run history, and recent activity tracking
- Local-first repository and service layers for prompt templates and prompt runs
- Versioned persisted payloads for browser-stored template and run data
- GitHub Actions CI running `lint`, `test`, and `build`
- Automated tests for services, repositories, providers, and workflow behavior

### Product direction

- Prompt workflows are now grouped separately from developer utilities
- The toolbox has a clearer `Start here` path for the core template -> playground -> history flow

### Notes

- This release is intentionally local-first and browser-based.
- There is no backend or account system yet.
- Saved data is still scoped to the browser that is using the app.
- The current focus is establishing a credible open-source foundation with connected workflows.

For full release notes, see [docs/releases/v0.1.0.md](./docs/releases/v0.1.0.md).
