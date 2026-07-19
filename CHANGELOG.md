# Changelog

Notable changes to this project are documented here. Entries describe
user-visible behavior or contributor-facing release changes rather than every
commit.

## [Unreleased]

### Added

- Added a browser-aware Simplified Chinese interface for the application shell
  and Overview, with an explicit language switcher that remembers the choice.
- Added Simplified Chinese controls and guidance for the prompt template and
  Playground workflow through saving a local prompt snapshot.
- Added Simplified Chinese review, filtering, notes, import, and snapshot
  management across Prompt Run History and run detail pages.
- Added Simplified Chinese editing controls and variable-aware summaries to
  the Prompt Diff workflow.
- Added Simplified Chinese input, status, and generated-output controls to JSON
  Tools and API Builder.
- Added Simplified Chinese review controls to Code Viewer and localized export,
  import preview, and record counts in Workspace Backup.
- Added a privacy-aware workflow feedback link from every application route to
  the dedicated GitHub feedback form.
- Added a direct Overview action into the first available prompt template,
  with template creation as the empty-workspace fallback.
- Continued that empty-workspace creation path into the new template's
  Playground after a successful save.
- Added a repeatable, read-only Playwright smoke command for the public demo.
- Added a direct link from the public application to its source repository.
- Added baseline browser security headers to Vercel responses without enabling
  cross-origin isolation.

### Changed

- Split secondary application pages into route-level chunks so the Overview
  no longer downloads every tool page on its initial load.

### Fixed

- Prevented API Builder request previews from widening phone layouts.
- Kept long Code Viewer lines readable inside their own horizontal scroller
  instead of wrapping code one character at a time.
- Arranged Prompt Diff and Workspace Backup metrics in complete desktop rows.
- Restored keyboard focus to the new page after choosing a destination from
  the responsive navigation menu.
- Returned keyboard focus to the attempted navigation control after keeping an
  unsaved template draft.
- Added a visible initial loading state for direct visits to lazy-loaded routes
  instead of logging a React Router hydration warning.
- Served valid crawler directives from `/robots.txt` instead of returning the
  SPA document through the fallback rewrite.
- Gave each application route a descriptive browser title after client-side
  navigation without exposing local prompt or run content.
- Linked the empty Prompt Playground directly to template creation and returned
  the new template to the Playground after it is saved.
- Excluded archived templates from the Overview's active-template count.
- Kept the Overview's first prompt workflow action within common desktop and
  phone viewports by compacting the navigation and hero layout.
- Prevented unchanged Playground previews, including reopened or previously
  saved previews, from creating duplicate prompt snapshots.
- Preserved in-session variable drafts while switching between Playground
  templates.
- Limited saved-run source context to its matching Playground template.
- Omitted saved JSON bodies from generated GET requests while keeping the draft
  available when switching back to a body-capable method.
- Kept generated query parameters before URL fragments in relative API Builder
  request URLs.
- Kept generated fetch code executable for malformed JSON bodies and warned
  when requests would send the entered text unchanged.
- Escaped generated fetch URLs that contain apostrophes or other
  JavaScript-sensitive characters.
- Made scrollable API Builder and JSON Tools output regions keyboard-focusable.
- Kept JSON import actions visible in keyboard navigation instead of focusing
  hidden native file inputs.
- Improved the Prompt Templates heading hierarchy and Code Viewer line-number
  contrast.
- Cleared stale JSON Tools output after input edits and disabled copying until
  the current input is processed again.
- Counted repeated Prompt Diff lines correctly and reported reordered lines as
  a removal and addition instead of leaving both sides unchanged.
- Preserved repeated query parameters when API Builder generates absolute or
  relative request URLs.
- Preserved repeated API Builder header rows in Fetch and cURL output.
- Displayed added and removed blank lines explicitly in Prompt Diff summaries.
- Replaced Code Viewer's phantom numbered line with an explicit empty state
  when a preview has no content.
- Wrapped long unbroken values in prompt previews without changing
  code-oriented output scrolling.
- Kept long captured values inside Run Detail cards and made scrollable saved
  prompt blocks keyboard-focusable.
- Used the browser's local calendar date in workspace, template, saved-run, and
  local-data recovery filenames while keeping exported timestamps in UTC.
- Rolled back browser-storage values removed before a later recovery reset
  failure, while keeping every recovery entry available for download.

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
