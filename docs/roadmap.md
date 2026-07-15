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

## v0.2.0

The [`v0.2.0` milestone](https://github.com/as569951728/dev-ai-toolkit/milestone/1)
is due on 2026-08-12. It is a maintenance release, not a platform expansion.

### Release Confidence

- Finish evidence-based triage of the pre-release issue backlog.
- Verify setup instructions from a clean checkout on a supported Node.js version.
- Select one protected `main` commit and run the complete audit, lint, coverage,
  build, and browser suite against that exact SHA.
- Match the release tag, GitHub Release, CI run, and public Vercel deployment to
  the same commit.

### Local Data Safety

- Recheck compatibility with the data format used by `v0.1.0`.
- Verify template, run, note, and workspace import validation on the candidate.
- Confirm workspace export can restore the candidate's supported collections.
- Keep recovery and rollback boundaries documented where automatic restoration
  cannot be guaranteed.

### Documentation And Access

- Keep English and Simplified Chinese README files aligned with the current UI.
- Keep README focused on setup and the core workflow, Changelog focused on
  user-visible changes, and this roadmap focused on future outcomes.
- Re-run keyboard skip navigation, visible focus, heading structure, and reduced
  motion checks on the release candidate.
- Publish release notes with current features, known limitations, and next steps
  without adoption or performance claims.

### Exit Criteria

`v0.2.0` is ready only when every hard gate in the
[release readiness checklist](./maintenance/v0.2.0-release-readiness.md) has
evidence from one candidate SHA. A failed gate keeps the release blocked.

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
