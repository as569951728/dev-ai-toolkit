# Product Roadmap

## Vision

`dev-ai-toolkit` is designed to become a practical open-source AI developer toolbox.

Its value is not only in helping users write prompts faster, but in turning repeated AI-assisted development tasks into reusable, structured workflows:

- Prompt templates that can be reused across coding, review, debugging, and API design tasks
- A playground that turns templates plus variables into ready-to-run prompts
- A growing toolchain for payload work, request drafting, and output review
- A foundation that can grow from personal productivity into shared team knowledge

In short:

- Current value: help developers manage prompt workflows and adjacent developer tasks in one local-first toolbox
- Future value: evolve into a real developer-facing AI toolbox that supports repeatable, collaborative, and extensible workflows

## Value Today

At the current stage, the project already provides practical value in a few ways:

- Reduces repeated prompt writing by making templates reusable
- Improves prompt consistency across similar engineering tasks
- Gives developers local-first tools for payload inspection and output review
- Keeps everything local-first, simple, and easy to understand

## Long-Term Value

Over time, the project should create value in three larger dimensions:

### 1. From Prompt Utility to AI Toolbox

The project should evolve beyond template management into a broader AI development toolbox:

- Prompt composition
- Prompt preview and iteration
- Structured developer utilities
- More workflow-oriented AI tools

### 2. From Personal Tool to Team Asset

The project should help teams preserve AI working patterns instead of losing them in chat history:

- Shared reusable templates
- Better workflow consistency
- Repeated task acceleration
- Knowledge capture through structured prompt assets

### 3. From Demo to Sustainable Open-Source Project

The project should become a strong open-source foundation that others can use directly or extend:

- Clear architecture
- Real modules instead of placeholder pages
- Stable engineering quality
- Open contribution workflow

## Delivery Rhythm

The roadmap is split into four stages so the product grows in a focused and believable way.

### Stage 1: Toolbox Framing

Goal:
Turn the project from "runnable" into a clearly framed AI developer toolbox.

Focus:

- Unify the homepage, README, and roadmap around toolbox positioning
- Group modules into prompt workflows and developer utilities
- Improve information architecture and basic navigation
- Keep the current modules believable and easy to understand
- Improve README, screenshots, and project documentation

Expected value:

- New users can understand the product quickly
- The product story matches the actual feature surface
- The open-source project feels intentional rather than experimental

Suggested versions:

- `v0.3.x`

### Stage 2: Workflow Connections

Goal:
Connect existing modules so the toolbox feels like one system instead of isolated pages.

Focus:

- Cross-module paths from prompt workflows into review tools
- Payload and request workflows that can feed each other
- Better workflow-oriented actions and “continue in...” entry points
- More curated prompt presets for common engineering scenarios

Expected value:

- The project identity becomes much clearer
- Developers can solve more related tasks in one place
- Modules feel less like isolated utilities

Suggested versions:

- `v0.4.x` to `v0.5.x`

### Stage 3: Collaboration and Knowledge Capture

Goal:
Move from individual productivity toward reusable team workflows.

Focus:

- Template repository or service abstraction
- Template versioning
- Archiving and organization
- Better usage history and recommendations
- Shared template design direction
- Stronger information architecture by domain or use case

Expected value:

- Teams can start accumulating AI workflow knowledge
- Reuse quality improves over time
- The project becomes more than a personal scratchpad

Suggested versions:

- `v0.6.x` to `v0.8.x`

### Stage 4: Open-Source Maturity

Goal:
Make the project sustainable and compelling as an open-source tool.

Focus:

- More complete testing and CI quality gates
- Stronger documentation and examples
- Better contribution flow
- Optional extensibility or plugin direction
- Prompt evaluation and comparison ideas
- Demo deployment and documentation site

Expected value:

- Easier community contribution
- Stronger credibility as a real open-source tool
- Better long-term adoption potential

Suggested versions:

- `v0.9.x` to `v1.0.0`

## Near-Term Priority

The most important next step is to land a strong toolbox transition phase.

Recommended focus:

1. Unify product framing across home, README, and roadmap
2. Connect existing modules with clearer workflow paths
3. Prepare a cleaner data boundary for the prompt workflow
4. Add automated tests for the most important user behavior

## Decision Filter

Every future feature should be checked against three questions:

1. Can a new user understand the value of the project within a few minutes?
2. Does this make repeat AI-assisted developer work faster or clearer?
3. Does this make the repository stronger as a real open-source project?

If a planned feature does not help at least one of those clearly, it should probably wait.
