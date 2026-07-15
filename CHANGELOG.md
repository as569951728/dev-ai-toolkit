# Changelog

Notable changes to this project are documented here. Entries describe
user-visible behavior or contributor-facing release changes rather than every
commit.

## [Unreleased]

No changes yet.

## [v0.2.0] - 2026-07-15

### Added

- Added a dedicated Run History for saved prompt snapshots, including search,
  template filters, age sorting, captured variables, review notes, copy actions,
  source comparisons, single-run JSON import and export, deletion, and reuse in
  the Playground or a new template draft.
- Added Workspace Backup for previewing, exporting, and restoring templates,
  saved runs, notes, and recent Playground shortcuts as versioned JSON.
- Added direct comparison between historical template revisions and the current
  template, plus saved-run comparisons against their matching source revision.
- Added cross-tab refresh for templates, saved runs, notes, and recent template
  shortcuts while preserving visible unsaved drafts.
- Added recovery actions when another tab deletes a template or run that still
  has an unsaved local draft.
- Added browser-storage recovery controls that can download unreadable local
  collection bytes before an explicit reset.
- Added complete labeled prompt copy actions in the Playground, Run History, and
  Run Detail.
- Added workflow handoffs for reopening saved variables in JSON Tools and saved
  prompts in Prompt Diff or Code Viewer without putting prompt content in URLs.
- Added cURL output and copy actions to API Builder alongside generated `fetch`
  snippets.

### Fixed

- Added accessible failure and retry feedback for the main local-storage writes,
  clipboard actions, and JSON exports.
- Protected unsaved template and note drafts during navigation and external
  storage updates.
- Added compensating rollback for related run data and multi-collection
  workspace imports, including removal of records created by a failed import.
- Prevented malformed or unreadable local collections from silently appearing
  as an empty workspace, and blocked writes until recovery or reset.
- Centralized validation for templates, runs, notes, revisions, and workspace
  relationships across storage and JSON transfer boundaries.
- Rejected duplicate or incompatible imported records and reported skipped
  template records instead of silently accepting them.
- Added a shared 5 MB limit for template, run, and workspace JSON imports before
  their full contents are read.
- Preserved active Prompt Template and Run History filters across detail, edit,
  comparison, JSON Tools, and Code Viewer round trips.
- Kept prompt or generated request content out of shareable URLs and cleared
  compatible legacy content parameters after loading.
- Improved variable handling for dotted, underscored, hyphenated, camel-case,
  unresolved, and whitespace-sensitive values.
- Kept the Playground usable when optional recent-template storage is
  unavailable and preserved same-event writes to local collections.
- Improved keyboard navigation with a skip link, visible focus treatment,
  reduced-motion handling, and one page-level heading per route.
- Cleaned up temporary download links and object URLs after successful or failed
  local exports.

### Changed

- Reorganized navigation and documentation around the local-first prompt
  workflow, with JSON, API request, diff, and code tools positioned as supporting
  utilities.
- Reorganized Run Detail around saved prompts, review context, notes, reuse, and
  snapshot management.
- Added dependency auditing, coverage thresholds, current action runtimes, and
  browser smoke tests to the required GitHub Actions `quality` check.
- Added weekly Dependabot checks for npm and GitHub Actions dependencies.

## [v0.1.0] - 2026-05-06

Initial public release of `dev-ai-toolkit`.

### Added

- Prompt template management with create, edit, duplicate, delete, filtering,
  and JSON import/export
- Prompt Playground with variable detection, preview generation, saved prompt
  snapshots, and recent template usage
- Prompt Diff for comparing prompt revisions
- JSON Tools for formatting, validation, and minification
- API Builder for drafting request configurations and generating `fetch`
  snippets
- Code Viewer for reading code or text output in single or compare mode
- Prompt template version history with local restore support
- Local-first repository and service layers for prompt templates and prompt runs
- GitHub Actions CI running `lint`, `test`, and `build`
- Unit tests for core services and one prompt workflow smoke test

### Product direction

- Prompt workflows are now grouped separately from developer utilities
- The toolbox has a `Start here` path for the template-to-Playground flow

### Notes

- This release is intentionally local-first and browser-based.
- There is no backend or account system yet.
- Saved data is scoped to the active browser profile.
- Saved prompt runs do not yet have a dedicated history page.
- Workspace backup and run notes are not included.

For full release notes, see [docs/releases/v0.1.0.md](./docs/releases/v0.1.0.md).
