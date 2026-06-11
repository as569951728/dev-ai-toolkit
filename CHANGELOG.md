# Changelog

All notable changes to this project will be documented in this file.

The format is intentionally lightweight and human-readable.

## [Unreleased]

### Added

- Added single prompt run JSON import from the Run History page, including
  saved note context when present
- Added cURL command previews to API Builder alongside the existing fetch
  snippet output
- Added copy support for generated API Builder cURL commands
- Added an API Builder shortcut for opening generated cURL commands in Code
  Viewer
- Added an API Builder shortcut for opening generated fetch snippets in Code
  Viewer
- Added captured variable previews to Prompt Run History cards
- Added Prompt Run History shortcuts for comparing saved runs with their source
  template revisions
- Updated the homepage API Builder copy to include cURL command output
- Updated the API Builder page summary to reflect both fetch and cURL outputs

### Fixed

- Kept the full local prompt run history instead of trimming saved runs to the
  most recent 20 records
- Ignored malformed prompt template, prompt run, and prompt run note records
  when reading browser storage
- Rejected workspace backups whose notes reference runs missing from the backup
- Fixed API Builder query string generation for relative URLs that already
  include query parameters
- Clarified the Prompt Run History search placeholder now that saved run
  context is searchable
- Announced Workspace Backup import success and failure feedback with
  accessible status roles
- Announced prompt run save and note save feedback with accessible status roles
- Recorded a template as recently used when saving a prompt run from the
  Playground
- Compared saved prompt runs against the matching source template revision when
  opening Prompt Diff from run details
- Included recent playground template shortcuts in workspace backups
- Included matching source template revision context in single prompt run JSON
  exports
- Replaced the default React Router unknown-route error with a project-level
  not found page
- Added `/workspace-backup` as a compatibility route for the Workspace Backup
  page
- Fixed singular/plural copy for saved prompt run variable counts

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
- Prompt Run History search now includes saved prompt text and captured
  variable names and values
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
