# Architecture Overview

This document is a contributor-facing overview of how `dev-ai-toolkit` is currently organized.

It focuses on the code structure that exists today rather than long-term architecture ideas.

## Current shape

The project is a local-first React application built around a few connected prompt workflows and a small set of supporting developer utilities.

At a high level, the codebase is split into:

- `src/app`: app-level routing, providers, and shared styles
- `src/components`: reusable UI and layout building blocks
- `src/features`: feature modules grouped by user-facing workflows
- `src/types`: shared domain types

## Feature modules

Most product code lives in `src/features`.

Each feature module owns its own page components and feature-specific helpers. Current examples include:

- `prompt-templates`
- `prompt-playground`
- `prompt-diff`
- `json-tools`
- `api-builder`
- `code-viewer`

The goal is to keep feature logic close to the UI it supports, while still leaving room for shared domain logic and persistence boundaries when that becomes useful.

## State and data flow

The current app is intentionally local-first.

For the prompt workflow, the codebase already separates a few concerns:

- `providers`: connect feature state to React components
- `services`: hold higher-level domain operations
- `repositories`: read and write persisted data

This is most visible in the prompt template and prompt run flows.

### Providers

Providers manage feature-facing state and expose actions to the UI.

Examples:

- `PromptTemplatesProvider`
- `PromptRunsProvider`
- `PromptRunNotesProvider`

They are the main bridge between React pages/components and the lower-level service or repository layer.

#### Collection mutation semantics

Template, run, and run-note providers expose two different collection
operations:

- Import actions merge incoming records by their domain key. They are used for
  normal template, run, note, and workspace imports.
- Replace actions persist an exact collection. They are reserved for restoring
  a previously captured local snapshot after a multi-collection write fails.

These operations are not interchangeable. A merge cannot restore an earlier
collection when a failed import created new records, because those records have
no matching item in the earlier snapshot to overwrite. Workspace backup
rollback therefore uses exact replacement.

Workspace backup imports add a read-only step before those provider mutations.
The selected file is parsed, relationship-checked, and merged in memory to
produce a change summary. No repository is written until the user confirms the
preview. Imported backups must contain unique template IDs, unique run IDs, and
at most one note for each run ID; duplicate recent-template shortcuts are
normalized instead because that collection is only an ordered convenience
list.

Provider mutations write to the repository before updating the provider's
latest-value ref and React state. If a repository write throws, the in-memory
collection remains unchanged. Multi-collection workflows still use explicit
compensating writes because browser storage does not provide transactions.

### Services

Services are used when the project needs a small domain layer rather than pushing all behavior into components or providers.

Examples include:

- prompt template versioning and normalization
- import/export shaping
- prompt run creation rules

The service layer is still lightweight, but it helps keep business rules out of presentational components.

### Repositories

Repositories isolate data access.

Today that mostly means browser persistence through `localStorage`, but the repository boundary exists so the project can evolve later without rewriting the UI structure first.

Current repository responsibilities include:

- loading persisted template data
- saving updated template collections
- loading and saving prompt runs
- loading and saving prompt run notes
- normalizing stored payload shape at read time when needed

## Local persistence

The current source of truth is browser storage, not a backend API.

That has a few practical consequences:

- the app works without any server setup
- all persisted data is local to the current browser environment
- backward compatibility of stored data matters as models evolve

This is why the project now pays extra attention to:

- schema versioning
- legacy import handling
- shared local persistence patterns

### Workflow handoffs

Prompt content and generated request snippets sometimes move between feature
routes. Current in-app handoffs to Prompt Diff and Code Viewer use React Router
history state rather than content-bearing query parameters. Saved-run handoffs
use a URL-safe run ID and resolve the prompt content from the local run
repository.

List filtering uses a different boundary. Prompt Template and Run History
search values are stored in the `q` query parameter so the list state can be
restored after a detail-page round trip. These values are navigation metadata,
not a private transport, and may remain in browser history or copied URLs.

Prompt Diff and Code Viewer still accept older `left` and `right` query
parameters. After reading them, the page replaces the current history entry
with a clean URL while retaining the content in history state. This is a
compatibility measure, not a secure transport: the original legacy request may
already have exposed its query string to browser history, server logs, or an
upstream service before the client removes it.

History state survives a normal reload in the supported browser flow, but it is
not a portable share format. Content that must remain available across browser
profiles should be saved as a run or included in an explicit workspace backup.

### Persisted data shape

The current browser-stored collections use a lightweight versioned payload shape:

- legacy format: a raw array
- current format: `{ version: 1, data: [...] }`

Collection encoding is handled in `src/lib/local-storage-schema.ts`. Access to
the browser storage object is resolved separately through
`src/lib/browser-storage.ts` so restricted browser contexts do not crash while
the repositories are being created.

Repositories for prompt templates, prompt runs, prompt run notes, and recent prompt usage follow the same basic rules:

- read legacy raw arrays when they already exist
- read versioned payloads when the schema matches the current version
- write back using the current versioned payload shape

Default providers also listen for the matching browser `storage` event. A write
or clear from another tab reloads that collection through its repository, so
open tabs in the same browser profile do not keep stale templates, runs, notes,
or recent-template shortcuts. Injected repositories do not subscribe because
their lifecycle may not be connected to browser storage.

Clean template and note editors adopt the reloaded value. If an editor has an
unsaved draft, it keeps that draft and reports that the saved value changed.
A template draft also remains recoverable as a new template if another tab
deletes its source record. If another tab deletes a run while its note editor is
dirty, the detail page can create a replacement run and attach the draft to the
new ID. That write is compensating: a failed note save removes the replacement
run when possible rather than leaving an orphaned note.

This is still refresh-on-change behavior, not collaborative editing. The
storage API does not provide collection transactions or field-level conflict
resolution, so concurrent writes use the last value persisted by the browser.
The UI warnings protect a visible draft; they do not merge competing changes.

### Migration assumptions

The current migration strategy is intentionally simple:

- compatibility is handled at the repository boundary
- providers and UI components should not know about storage schema versions
- invalid or unreadable payloads fall back to a safe local default
- blocked browser storage reads use the same safe defaults
- blocked writes remain errors so the UI does not report data as persisted
- new schema versions should be introduced only when the stored shape actually changes

In practice that means:

- prompt templates fall back to the seeded starter templates
- prompt runs fall back to an empty collection
- prompt run notes fall back to an empty collection
- future schema changes should first extend the shared storage helper and repository tests before changing feature code

## Testing approach

The test suite is intentionally focused on product and persistence boundaries.

Current coverage focuses on:

- utility functions
- service-layer behavior
- provider behavior
- repository compatibility for persisted local data
- workflow-level smoke paths for the prompt workflow

The short-term goal is not broad test volume. It is credible coverage around the parts of the app that manage persisted state and workflow handoffs.

## Contribution notes

If you are adding to the project, try to follow these current rules:

- keep feature changes local to the feature module when possible
- prefer small service or repository additions over pushing persistence logic into components
- keep docs aligned with the actual product state
- avoid adding new standalone tools when an existing workflow needs more polish first
- use merge actions for normal imports and exact replacement only when restoring
  a complete collection snapshot
