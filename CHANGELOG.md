# Changelog

All notable changes to this project will be documented in this file.

The format is intentionally lightweight and human-readable.

## [Unreleased]

### Added

- Documented local collection merge and rollback boundaries for contributors
- Explained saved-run retention before prompt template deletion
- Documented workspace backup relationship rules for standalone saved runs
- Named unresolved Playground variables in the preview warning
- Formatted camel-case Playground variable names as readable input labels
- Disclosed invalid records skipped from mixed prompt template imports
- Added an application-level warning when browser storage cannot be read
- Added a non-blocking unresolved-variable count before Playground prompts are
  copied or saved
- Preserved an active template selection when Run History offers a first-run
  Playground action
- Added a Run Detail action for copying a full labeled saved prompt in one step
- Added a Prompt Playground action for copying the full labeled system and user
  prompt in one step
- Added a Chromium smoke test for saving a prompt snapshot and opening its Run
  Detail page
- Added Run Detail actions for copying saved system and user prompts
- Added a Run Detail shortcut for reopening captured variables in Prompt
  Playground
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
- Added a Playground shortcut for opening a saved run immediately after saving
  a prompt snapshot
- Added a Run History shortcut for opening an imported run from the import
  success message
- Added a Prompt Template detail shortcut for opening recent saved runs
- Added Prompt Run Detail export feedback after downloading run JSON
- Added Workspace Backup export feedback after downloading backup JSON
- Updated the homepage API Builder copy to include cURL command output
- Updated the API Builder page summary to reflect both fetch and cURL outputs
- Linked homepage recent activity cards to saved run details
- Added `SECURITY.md` and linked it from both README files
- Added CI status badges to the English and Simplified Chinese README files
- Prompt Run History search now includes saved prompt text and captured
  variable names and values
- Expanded regression coverage for local storage schema helpers, Playground
  downstream links, Prompt Diff, JSON Tools, Code Viewer, API Builder, and
  template import behavior

### Fixed

- Skipped unnecessary note writes when deleting runs without saved notes
- Restored exact local collections when workspace backup imports roll back
- Reported partial prompt run imports when compensating run writes fail
- Reported when a failed prompt run deletion could not restore its note
- Preserved prompt run notes saved before the provider renders again
- Preserved prompt templates created before the provider renders again
- Preserved prompt runs created before the provider renders again
- Preserved meaningful whitespace in composed Playground variable values
- Excluded notes without a saved run from downloadable workspace backups
- Detected read-only browser storage before users attempt to persist local data
- Prevented restricted browser storage access from crashing local repository
  initialization
- Kept the app usable when browser storage rejects template, run, or note reads
  during startup
- Ignored unknown Run History template query filters without hiding existing
  saved runs
- Removed temporary download links and revoked Blob URLs when prompt run or
  workspace backup exports fail
- Supported dotted variable names consistently when Prompt Playground detects,
  labels, and composes template placeholders
- Cleared stale Prompt Playground copy feedback when template variables or
  preview text change
- Rolled back completed workspace backup writes when a later collection import
  fails
- Reported prompt template JSON export failures and kept the export action
  available for retry
- Reported workspace backup export failures and kept the download action
  available for retry
- Reported prompt run JSON export failures on Run Detail and kept the action
  available for retry
- Kept Prompt Playground template selection and snapshot saving usable when the
  optional recent-template shortcut cannot be written to browser storage
- Rolled back a single prompt run JSON import when its related note cannot be
  written to browser storage
- Restored a saved run note when deleting its prompt snapshot fails after note
  cleanup
- Kept Prompt Template Detail open and reported browser storage failures for
  duplicate, archive, restore, revision restore, and delete actions
- Kept prompt template form values available for retry when browser storage
  rejects a create or edit operation
- Preserved prompt run note drafts and reported browser storage failures when
  saving from Run Detail
- Reported browser storage failures when saving prompt snapshots instead of
  leaving the Playground without feedback
- Reported when a single run JSON import replaces an existing saved run with
  the same ID
- Preserved spaces while entering multi-word searches in Prompt Templates and
  Prompt Run History
- Rejected array-shaped prompt run variables in browser storage, single-run
  imports, and workspace backups
- Omitted orphaned run notes from workspace exports so generated backups remain
  importable
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
- Reported imported and skipped recent playground shortcuts in Workspace Backup
  import feedback
- Dropped duplicate prompt templates, saved runs, and run notes when reading
  persisted local storage records
- Normalized API Builder HTTP methods before generating fetch snippets and cURL
  commands
- Rejected prompt run JSON imports with invalid run or source revision versions
- Rejected workspace backups with invalid template, revision, or run versions
- Reported malformed prompt template import JSON with a stable project-level
  error message
- Rejected prompt template exports with unsupported payload versions
- Announced JSON Tools success and error messages with status and alert roles
- Announced Prompt Templates import and export feedback with a status role
- Announced Prompt Templates import failures with an alert role
- Announced Code Viewer copy success and failure feedback with status and
  alert roles
- Announced Prompt Diff copy success and failure feedback with status and
  alert roles
- Announced Prompt Playground prompt copy success and failure feedback with
  status and alert roles
- Announced API Builder copy success and failure feedback with status and
  alert roles
- Added accessible labels for API Builder query/header row controls
- Added accessible labels for Code Viewer and Prompt Diff textareas
- Normalized unsupported Code Viewer language query values before rendering
- Centralized prompt run Code Viewer URL construction through a shared helper
- Refreshed prompt template `updatedAt` values when archiving or restoring
  templates
- Reused the shared Code Viewer URL helper from API Builder and Prompt
  Playground links
- Added an accessible label for the Prompt Templates JSON import input
- Allowed Prompt Templates JSON imports to be selected by `.json` extension
- Exposed the active Code Viewer display mode to assistive technologies
- Hid Prompt Diff source comparison links when the matching source revision is
  unavailable
- Rejected prompt run imports when the embedded source revision version does
  not match the run
- Rejected workspace backups whose templates do not include the current
  revision
- Rejected workspace backups with duplicate template revision versions
- Deduplicated prompt template revisions by version while normalizing imports
  and stored templates
- Kept the current prompt template revision aligned with the template's current
  fields during normalization
- Replaced the default React Router unknown-route error with a project-level
  not found page
- Added `/workspace-backup` as a compatibility route for the Workspace Backup
  page
- Fixed singular/plural copy for saved prompt run variable counts

### Changed

- Reorganized Run Detail around prompt review actions, saved prompts, review
  context, and snapshot management
- Clarified the homepage, navigation, and README around the local-first prompt
  workflow instead of a broad AI platform
- Centralized Prompt Template, Prompt Run, and Run Note validation across their
  storage and JSON import boundaries while keeping tolerant template migration
  separate
- Updated GitHub Actions to current action runtimes and added dependency audit
  to CI
- Updated audited dependency resolutions for `react-router`, `react-router-dom`,
  and `brace-expansion`
- Added weekly Dependabot checks for npm and GitHub Actions dependencies
- Clarified that the public demo URL is still unverified and tracked in issue
  #14
- Centralized clipboard writes in a shared helper used by copy-enabled modules
- Clarified that the Vercel demo URL is reachable but not yet verified against
  the latest `main` commit

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
