# Roadmap

**Last reviewed:** 2026-07-15

`dev-ai-toolkit` is being maintained as a local-first prompt workspace. The
roadmap prioritizes the template-to-review workflow, local data safety, and
release quality over adding more standalone utilities.

GitHub Issues and milestones are the source of truth for scoped work. This file
describes the intended outcomes and product boundaries rather than duplicating
the issue backlog.

## Product Direction

The primary workflow is:

1. Maintain a reusable prompt template.
2. Compose it with variables in the Playground.
3. Save a local prompt snapshot.
4. Review, compare, annotate, export, or reuse that snapshot.
5. Back up the supported local workspace collections.

JSON Tools, API Builder, Prompt Diff, and Code Viewer remain supporting
utilities. New work should connect to the prompt workflow or solve a demonstrated
local development need.

## Released Baseline: v0.2.0

[`v0.2.0`](https://github.com/as569951728/dev-ai-toolkit/releases/tag/v0.2.0)
was published on 2026-07-15. It established the local template-to-review
workflow, workspace backup and recovery boundaries, and the protected release
checks that future changes build on.

The [release notes](./releases/v0.2.0.md) describe the shipped behavior and
known limitations. The closed
[`v0.2.0` milestone](https://github.com/as569951728/dev-ai-toolkit/milestone/1)
and [release readiness record](./maintenance/v0.2.0-release-readiness.md) retain
the detailed issue and verification evidence.

## After v0.2.0

### Validate The Prompt Workflow

- Collect feedback from people using templates, saved prompt snapshots, and
  manual workspace backup for real work.
- Use that feedback to identify the most confusing or repetitive step before
  adding new modules.
- Prefer small improvements that shorten the path from a template to a reviewed
  and reusable prompt.

### Evolve Local Data Carefully

- Add schema migrations only when a real data-model change requires them.
- Keep imports, exports, recovery downloads, and rollback tests aligned with
  each schema change.
- Evaluate an optional storage adapter only after local persistence boundaries
  are stable and there is a clear multi-device use case.

### Add Integrations From Evidence

- Keep handoffs between Run History, Prompt Diff, JSON Tools, and Code Viewer
  stable.
- Consider a model-provider or external-tool integration only when it can remain
  optional and does not expose local prompt data by default.
- Avoid adding another utility page without a concrete user problem and an
  issue-sized acceptance path.

## Not Planned Yet

- User accounts, teams, roles, or cloud synchronization
- A hosted prompt execution backend
- Agent orchestration or autonomous coding workflows
- Shared template marketplaces or community ratings
- Provider-specific billing, token analytics, or benchmark claims
- Additional developer utilities that do not support the core prompt workflow

These may be reconsidered if user feedback establishes a need and the local data
model is ready for the added responsibility.

## Decision Filter

Before accepting a feature, ask:

1. Does it make prompts easier to create, review, reuse, or back up?
2. Does it reduce a problem observed in real use?
3. Does it preserve the local-first privacy boundary?
4. Can it be implemented and reviewed as a small, testable change?

Work that does not clearly satisfy the first three questions should remain out
of the current milestone.

## Maintenance Loop

1. Start from a scoped issue with acceptance criteria.
2. Make one reviewable behavior or documentation change.
3. Run the checks appropriate to that change.
4. Merge through the protected branch and required `quality` check.
5. Verify public behavior when runtime code changes.
6. Record user-visible changes in the next release notes.
