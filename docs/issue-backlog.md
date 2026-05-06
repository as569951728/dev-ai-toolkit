# Issue Backlog

This file tracks a proposed set of realistic GitHub issues for the current project stage.

## 1. Bug: Prompt Playground save status is not cleared when switching templates

**Type:** `bug`

### Summary

The success message shown after saving a run snapshot in `Prompt Playground` stays visible even after switching to another template.

### Why it matters

This makes the current page state feel misleading and can make users think the latest template has already been saved.

### Suggested scope

- Review how save status is stored in `PromptPlaygroundPage`
- Reset the message when template context changes
- Add a focused regression check

## 2. Feature: Add a dedicated Prompt Run History page

**Type:** `feature`

### Summary

Prompt runs are now visible from the homepage and template detail, but there is no dedicated place to browse them as a first-class asset.

### Suggested scope

- Add a route for listing saved prompt runs
- Show template name, version, and created time
- Link runs back to the source template

## 3. Refactor: Extract shared local-first persistence patterns into a reusable storage adapter layer

**Type:** `refactor`

### Summary

Template storage, prompt run storage, and recent template usage follow similar local-first persistence patterns, but they are still implemented separately.

### Suggested scope

- Introduce a small shared storage adapter helper
- Keep repository files easy to read
- Avoid large abstraction jumps

## 4. Documentation: Add an architecture overview for data flow and local persistence

**Type:** `documentation`

### Summary

The repository now has meaningful data flow structure, but contributors still need a clearer explanation of providers, repositories, services, and local persistence boundaries.

### Suggested scope

- Add a focused architecture document under `docs/`
- Link it from the README
- Keep the document current-code-focused

## 5. Bug: Imported prompt templates should be normalized more defensively

**Type:** `bug`

### Summary

The import flow now supports versioned templates, but it should be reviewed against partially valid or legacy payloads more carefully.

### Suggested scope

- Re-check import normalization
- Add coverage for malformed or legacy inputs
- Make fallback behavior more explicit

## 6. Feature: Add archive state for prompt templates

**Type:** `feature`

### Summary

The project supports delete and version history, but does not yet support a lightweight archive state for templates that should no longer be active.

### Suggested scope

- Add archive/restore actions
- Hide archived templates from the default active list
- Persist archive state locally

## 7. Refactor: Introduce a schema version strategy for local persisted data

**Type:** `refactor`

### Summary

Persisted browser data is starting to grow in complexity. The project should define a clearer schema version and migration strategy before local models drift further.

### Suggested scope

- Define a simple schema version strategy
- Apply it to persisted template and run data
- Document migration assumptions

## 8. Documentation: Rewrite README feature list as a capability matrix

**Type:** `documentation`

### Summary

The README is readable, but the feature section is becoming long and harder to scan as the toolbox grows.

### Suggested scope

- Convert the feature section into a structured module matrix
- Keep it aligned with the real codebase
- Make it easier to maintain as modules evolve

## 9. Feature: Add quick actions to continue a saved run into review tools

**Type:** `feature`

### Summary

Saved prompt runs now exist, but they still lack direct downstream actions such as reopening the output in `Prompt Diff` or `Code Viewer`.

### Suggested scope

- Add run-level continuation actions
- Preserve context through routing
- Reuse existing query-based handoff patterns

## 10. Bug: Homepage and README can drift from actual product state without a shared source of truth

**Type:** `bug`

### Summary

The homepage, README, and roadmap all describe product state and workflow direction, but they are updated manually and may drift over time.

### Suggested scope

- Review current wording consistency
- Add a lightweight contributor rule or documentation check
- Reduce content drift without over-automating
