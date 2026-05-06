# Next Phase Plan

## Goal

Turn `dev-ai-toolkit` from a prompt-centered prototype into a clearer **AI developer toolbox** with stronger workflow connections and stronger engineering foundations.

## Phase Focus

The next phase should prioritize **coherence before expansion**.

That means:

- unify the product story
- connect existing modules
- strengthen the data layer
- add real testing confidence

## Workstreams

### 1. Product Framing

Objective:
Make the project clearly read as an AI developer toolbox across every public surface.

Tasks:

- Update homepage narrative and section structure
- Update `README.md` and `README.zh-CN.md`
- Reframe roadmap language around toolbox capability groups
- Keep prompt workflows as a major pillar, not the only story

### 2. Information Architecture

Objective:
Make modules feel like a product system instead of independent utility pages.

Tasks:

- Group modules into:
  - Prompt Workflows
  - Developer Utilities
- Improve navigation ordering and labels
- Add clearer cross-module entry points
- Add more “continue this task in...” links between modules

### 3. Workflow Connections

Objective:
Create real paths across the toolbox.

Recommended first connections:

1. `Prompt Templates` -> `Prompt Playground`
2. `Prompt Playground` -> `Prompt Diff`
3. `Prompt Playground` -> `Code Viewer`
4. `API Builder` -> `JSON Tools`

Expected value:

- more believable product flow
- less “isolated page” feeling
- stronger onboarding for new users

### 4. Data Layer Preparation

Objective:
Prepare the prompt workflow for future backend integration.

Tasks:

- Introduce a template repository or service abstraction
- Keep the current local-first behavior behind adapters
- Separate domain logic from UI state where practical
- Extend template-related types for future revision and ownership metadata

### 5. Quality Baseline

Objective:
Raise the project from “buildable” to “trustworthy”.

Tasks:

- Add `Vitest`
- Add utility-level unit tests
- Add prompt-template integration tests
- Add one smoke end-to-end flow later in the phase
- Update CI to run tests

## Recommended Delivery Order

### Iteration 1

- Update product framing
- Update homepage
- Update README
- Update roadmap

### Iteration 2

- Add cross-module navigation paths
- Add workflow-oriented action links
- Reduce isolated-page feeling

### Iteration 3

- Introduce template repository abstraction
- Refactor prompt template provider
- Prepare richer domain types

### Iteration 4

- Add tests and CI test execution
- Stabilize core behavior

## What Not To Do Yet

To keep the product focused, avoid these for now:

- adding many more standalone utility pages
- introducing authentication too early
- building a backend before the frontend domain boundaries are cleaner
- over-designing plugin systems before the core workflow is stable

## Success Criteria

The next phase is successful if:

1. A new user can understand the toolbox structure within a few minutes
2. Existing modules feel more connected than isolated
3. The prompt workflow is still strong, but no longer the only visible product identity
4. The codebase is easier to evolve toward API-backed collaboration later
5. Automated tests start covering real user behavior
