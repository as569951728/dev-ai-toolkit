# Issue Backlog

This file tracks a focused set of realistic GitHub issues for the current project stage.

## 1. Bug: Clear Prompt Playground save status when template context changes

**Type:** `bug`

### Summary

After saving a run snapshot in `Prompt Playground`, the success banner can outlive the current template context and feel misleading.

### Why it matters

Users may think the current template has already been saved even after switching to a different prompt.

### Suggested scope

- Reset the save status when the active template changes
- Reset the status when the preview context changes meaningfully
- Add a focused regression check

## 2. Feature: Add a dedicated Prompt Run History page

**Type:** `feature`

### Summary

Prompt runs are now visible from the homepage and template detail, but they do not yet have a dedicated browsing experience.

### Why it matters

Saved runs are now part of the product’s asset chain, but users still cannot inspect them as a first-class history view.

### Suggested scope

- Add a route for prompt run history
- Show template name, template version, and created time
- Link each run back to its source template

## 3. Refactor: Consolidate shared local persistence patterns behind a reusable adapter

**Type:** `refactor`

### Summary

Template storage, prompt run storage, and recent template usage all follow similar local-first persistence patterns, but they still use separate implementations.

### Why it matters

As local models evolve, persistence code can drift in behavior, validation, and fallback handling.

### Suggested scope

- Introduce a small shared storage helper or adapter pattern
- Keep repository files straightforward and readable
- Avoid broad abstractions that do not yet fit the project size

## 4. Documentation: Add a contributor-facing architecture overview

**Type:** `documentation`

### Summary

The project now has enough internal structure that contributors need a better explanation of providers, repositories, services, and local persistence boundaries.

### Why it matters

The current docs are strong on product direction, but still light on codebase maintenance context.

### Suggested scope

- Add a focused architecture overview under `docs/`
- Link it from the README
- Keep it grounded in the current codebase rather than future plans

## 5. Bug: Harden prompt template import for legacy and malformed payloads

**Type:** `bug`

### Summary

Prompt template import now supports versioned templates, but older or malformed JSON payloads should be handled more defensively.

### Why it matters

Import is one of the easiest places for local persisted data to become inconsistent.

### Suggested scope

- Re-check normalization behavior for imported templates
- Cover malformed or partial payloads with tests
- Make fallback behavior clearer and more predictable

## 6. Feature: Add archive state for prompt templates

**Type:** `feature`

### Summary

The project supports delete and version history, but it still lacks a lightweight archive state for templates that should no longer stay active.

### Why it matters

Deleting is sometimes too destructive, while leaving every template active makes the inventory harder to manage over time.

### Suggested scope

- Add archive and restore actions
- Hide archived templates from the default active list
- Persist archive state locally

## 7. Refactor: Introduce a schema version strategy for persisted local data

**Type:** `refactor`

### Summary

Persisted browser data is becoming richer, especially for versioned templates and prompt runs. The project should define a clearer schema version and migration strategy.

### Why it matters

Without a migration story, future changes to local data structures may create hard-to-debug state drift for existing users.

### Suggested scope

- Define a lightweight schema version strategy
- Apply it to persisted template and run data
- Document migration assumptions for maintainers

## 8. Documentation: Restructure the README feature section into a capability matrix

**Type:** `documentation`

### Summary

The README is readable, but the feature section is getting longer and harder to scan as the toolbox grows.

### Why it matters

A clearer module matrix will make the project easier to understand and easier to maintain.

### Suggested scope

- Convert the feature section into a structured module table or matrix
- Keep the matrix aligned with the actual codebase
- Avoid marketing-heavy language and keep it contributor-friendly
