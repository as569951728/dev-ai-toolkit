# Architecture Review

## Decision

`dev-ai-toolkit` should now be treated as an **AI developer toolbox**, not only a prompt workflow project.

That means future work should optimize for:

- Clear module groupings across developer tasks
- Reusable local-first workflows that can later become backend-backed assets
- Consistent product language across the homepage, navigation, and README
- A code structure that can grow from single-user tooling into shared team workflows

## Current Strengths

- The project is already runnable, structured, and believable as a real open-source React application.
- Feature folders are clear and independently maintainable.
- The prompt workflow is already useful enough to demonstrate real user value.
- Tooling modules such as `JSON Tools`, `API Builder`, `Code Viewer`, and `Prompt Diff` give the project a wider developer-tool identity.

## Current Gaps

### 1. Product Positioning Drift

The project story still leans too heavily on the prompt workflow, while the actual product surface has already expanded into a broader toolbox.

This creates friction between:

- the home page narrative
- the README description
- the route and navigation structure

### 2. Modules Are Parallel, Not Yet Connected

The modules are individually useful, but most of them still behave like isolated pages:

- `Prompt Templates` and `Prompt Playground` form a real loop
- the other tools are mostly local page utilities
- there is little shared task context between modules

### 3. Data Access Is Still Prototype-Oriented

The prompt data flow is currently effective for a local-first prototype, but it is not yet separated into a reusable data access boundary.

Right now:

- business rules live close to UI providers and hooks
- `localStorage` is effectively the source of truth
- future API replacement would require structural refactoring

### 4. Quality Gates Are Too Thin

`lint` and `build` are useful, but the project still lacks behavioral proof through automated tests.

The highest-risk area is the prompt template data flow:

- local persistence
- import/export
- duplication
- state restoration

## Product Direction

The project should now organize itself around two top-level capability groups.

### Prompt Workflows

These modules help developers create, revise, preview, and compare AI instructions:

- `Prompt Templates`
- `Prompt Playground`
- `Prompt Diff`

### Developer Utilities

These modules help developers work with adjacent outputs and payloads:

- `JSON Tools`
- `API Builder`
- `Code Viewer`

This split should shape:

- homepage content
- README framing
- navigation order
- future roadmap decisions

## Architectural Direction

The next structural step should be to introduce a clearer separation between:

- UI state
- domain logic
- data access

The first place to do that is the prompt template flow.

Recommended direction:

1. Add a repository or service layer for templates
2. Treat `localStorage` as an adapter, not the business source of truth
3. Prepare richer domain types for:
   - template revisions
   - run history
   - workspace ownership
   - sharing metadata

## Quality Direction

The project needs a minimal but credible testing baseline before continuing to expand the toolbox too aggressively.

Recommended first layer:

- Unit tests for pure utilities
- Integration tests for prompt template state management
- One end-to-end smoke flow for the core prompt workflow

## Practical Conclusion

The current codebase is a strong open-source prototype.

It is already good enough to justify continued investment, but the next phase should focus less on adding more isolated pages and more on:

- product consistency
- data boundaries
- workflow connections
- testing confidence
