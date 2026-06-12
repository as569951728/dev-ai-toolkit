# Implementation Roadmap

This roadmap captures the current implementation direction after the June 2026
project review. It is intentionally practical: it should help decide what to
build next, what to postpone, and how to keep the project maintainable.

## Current Direction

`dev-ai-toolkit` should be treated as a local-first prompt workflow manager for
developers, not as a broad AI platform.

The strongest product path is:

1. Create or choose a prompt template.
2. Fill template variables in the playground.
3. Save a composed prompt snapshot.
4. Review saved snapshots in run history.
5. Add notes, compare with source templates, or inspect output in Code Viewer.
6. Back up the local workspace as versioned JSON.

Supporting utilities such as JSON Tools and API Builder are useful, but they
should remain secondary unless they connect back into the prompt workflow.

## Review Findings

The project review produced four shared conclusions:

- The project has a real core workflow, but the positioning is still too broad
  if described only as an "AI developer toolbox".
- The prompt workflow is the main product value; standalone utility pages
  should not become the center of the roadmap.
- The local data model has grown enough that validators, import/export parsing,
  and storage normalization need a more consistent domain layer.
- Open-source maintenance needs a cleaner release and demo story before the
  project is presented as mature.

## Product Boundary

### Build Next

- Clearer prompt workflow language across the homepage, README, and docs
- Better guidance after saving a prompt snapshot
- More useful run detail and review states
- Stronger local data validation and import/export consistency
- Demo verification and release hygiene

### Do Not Build Yet

- Backend accounts or cloud sync
- Team permissions or shared workspaces
- Plugin marketplace features
- LLM runtime, tracing, evaluation, or observability features
- More standalone utility pages unless they support the prompt workflow

These items may become useful later, but adding them now would make the project
harder to understand and maintain.

## Near-Term Implementation Plan

### Week 1: Positioning And Open-Source Hygiene

Goal:
Make the repository describe the current product accurately and keep release
history easy to audit.

Tasks:

- Update homepage and README wording around local-first prompt workflows.
- Keep JSON Tools and API Builder positioned as supporting utilities.
- Verify whether the Vercel demo tracks the latest `main` branch.
- Prepare an honest `v0.2.0` release summary for work completed after `v0.1.0`.
- Align GitHub labels with issue templates and release categories.
- Review roadmap and release docs for vague self-justifying language.

Expected outcome:
New visitors should understand what the project does without expecting a model
runtime, agent framework, or LLMOps platform.

### Week 2: Main Workflow Clarity

Goal:
Make the core path from template to saved prompt review easier to follow.

Tasks:

- Standardize terms such as "run", "snapshot", "output", and "saved prompt".
- Improve the post-save state in Prompt Playground with clearer next actions.
- Make Run Detail feel like the review page for a saved prompt snapshot.
- Add or refresh screenshots for the main path:
  - Prompt Templates
  - Prompt Playground
  - Run History
  - Run Detail or Prompt Diff
- Keep the walkthrough aligned with the real UI.

Expected outcome:
A user should be able to follow the prompt workflow without reading the source
code or guessing what a saved run represents.

### Week 3: Data Boundary And Test Quality

Goal:
Reduce duplicated validation logic and protect local data as the schema grows.

Tasks:

- Introduce shared domain codecs or validators for:
  - `PromptTemplate`
  - `PromptRunRecord`
  - `PromptRunNote`
- Reuse those codecs from local storage repositories, imports, exports, and
  workspace backup parsing.
- Check whether runs should validate their source template relationship during
  workspace import.
- Split large orchestration-heavy pages, starting with `PromptRunHistoryPage`.
- Add one or two browser-level smoke checks for the core prompt workflow.

Expected outcome:
Import/export behavior should be easier to reason about, and future storage
changes should not require editing several separate validators by hand.

### Week 4: Workflow Integration And Release

Goal:
Make supporting tools feel connected without expanding the scope too broadly.

Tasks:

- Decide which JSON Tools and API Builder actions should connect into the
  prompt workflow.
- Keep unsupported utility ideas in a backlog instead of adding more pages.
- Close or update stale issues that no longer match the roadmap.
- Publish `v0.2.0` once the demo, docs, and core workflow improvements are in a
  consistent state.
- Start the next milestone from issues, not from a large untracked feature
  batch.

Expected outcome:
The project should have a clearer story, a release that matches current
functionality, and a more realistic issue-to-release maintenance loop.

## Engineering Priorities

The next engineering work should favor maintainability over new feature count.

Priority order:

1. Shared domain validators and normalization helpers
2. Prompt workflow page decomposition
3. Browser smoke coverage for the core path
4. Import/export and backup consistency
5. Utility integrations that support saved prompt review

Avoid building a backend until the local domain model is more stable.

## Open-Source Maintenance Priorities

The project should keep a simple but visible maintenance loop:

1. Create or update a scoped issue.
2. Make a small implementation change.
3. Run local checks.
4. Commit with a clear message.
5. Let CI pass on `main`.
6. Include meaningful changes in the next release notes.

Near-term repository maintenance:

- Verify the public demo or remove demo claims until it is current.
- Keep `v0.1.0` as a historical release and use `v0.2.0` for current work.
- Align GitHub labels, issue templates, and release categories.
- Prefer factual documentation over marketing language.
- Track Dependabot failures as normal maintenance work.

## Decision Filter

Before adding a feature, answer these questions:

1. Does it make the prompt workflow easier to create, review, reuse, or back up?
2. Does it reduce confusion for a new user?
3. Does it strengthen local data reliability or open-source maintainability?
4. Can it be delivered as a small, reviewable change?

If the answer is not clearly yes to at least one of the first three questions,
the work should wait.
