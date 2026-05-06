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

They are the main bridge between React pages/components and the lower-level service or repository layer.

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
- normalizing stored payload shape at read time when needed

## Local persistence

The current source of truth is browser storage, not a backend API.

That has a few practical consequences:

- the app works without any server setup
- all persisted data is local to the current browser environment
- backward compatibility of stored data matters as models evolve

This is why the project now has open issues around:

- schema versioning
- legacy import handling
- shared local persistence patterns

## Testing approach

The test suite is still intentionally small.

Current coverage focuses on:

- utility functions
- service-layer behavior
- provider behavior
- one workflow-level smoke path for the prompt workflow

The short-term goal is not broad test volume. It is credible coverage around the parts of the app that manage persisted state and workflow handoffs.

## Contribution notes

If you are adding to the project, try to follow these current rules:

- keep feature changes local to the feature module when possible
- prefer small service or repository additions over pushing persistence logic into components
- keep docs aligned with the actual product state
- avoid adding new standalone tools when an existing workflow needs more polish first
