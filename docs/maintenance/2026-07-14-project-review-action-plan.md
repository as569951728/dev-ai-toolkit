# Project Review Action Plan

Status: Active  
Last updated: 2026-07-14  
Review baseline: `aab5aee`

This document turns the July 2026 project review into a bounded maintenance
plan. It should be updated when a task changes state or when completion evidence
is available. The [implementation roadmap](../roadmap.md) remains the source for
product direction; this file controls the immediate maintenance sequence.

## Current Baseline

The following facts were verified during the review:

- The local quality suite passes: audit, lint, 388 unit tests, build, and 25
  browser tests.
- CI is failing on the current `main` commit because one clipboard feedback test
  does not reliably wait for an asynchronous status update.
- The public Vercel URL has not been verified against the current `main` commit.
- GitHub has 99 open issues, many of which describe work already present in the
  repository.
- `v0.1.0` is the latest release; the current prompt workflow has changed
  substantially since that tag.
- The application remains a browser-only, local-first prompt workflow manager.

These values are a dated snapshot, not permanent project claims. Recheck them
before using this document for a release decision.

## Status Vocabulary

| Status | Meaning |
| --- | --- |
| `ready` | The scope and acceptance evidence are clear. |
| `blocked` | A named dependency prevents completion. |
| `scheduled` | Valid work, but not before higher-priority items. |
| `done` | Acceptance evidence is linked in the progress log. |

No task should be marked `done` from a commit subject alone.

## Action Register

| ID | Priority | Status | Work item | Acceptance evidence | Suggested commit |
| --- | --- | --- | --- | --- | --- |
| MAINT-001 | P0 | `ready` | Stabilize the Run Detail clipboard feedback test. | The focused test passes repeatedly, the full local suite passes, and CI is green on the same SHA. | `test: stabilize run detail clipboard feedback` |
| MAINT-002 | P0 | `blocked` | Restore and verify the Vercel demo. | The public URL loads in a clean browser, the core template-to-run path works, and the deployed SHA is recorded. Depends on deployment access. | `docs: verify the public demo deployment` |
| MAINT-003 | P0 | `ready` | Triage the existing issue backlog in reviewable batches. | Every issue receives one documented disposition and evidence; no issue is closed only because a similar commit exists. | `docs: record issue triage decisions` |
| MAINT-004 | P1 | `scheduled` | Protect `main` with required CI checks. | Direct pushes cannot bypass the required CI workflow and repository settings are captured in the progress log. Depends on MAINT-001. | No repository commit required unless workflow files change. |
| MAINT-005 | P1 | `ready` | Correct future GitHub commit attribution. | The repository-local Git email is verified by GitHub and a new commit is attributed to the maintainer account. Existing history is not rewritten. | No standalone commit required. |
| DATA-001 | P1 | `ready` | Surface malformed local data instead of silently showing an empty collection. | Corrupted template, run, note, and recent-template payloads produce a recoverable warning; original bytes remain available for backup or reset; repository tests cover each collection. | `fix: surface corrupted local workspace data` |
| DATA-002 | P2 | `scheduled` | Reject oversized JSON imports before calling `file.text()`. | Template, run, and workspace imports share a documented size limit and show a useful error; boundary tests cover accepted and rejected files. | `fix: limit local JSON import size` |
| UX-001 | P2 | `scheduled` | Complete the small accessibility structure pass. | The app has a skip link, one page-level `h1`, `:focus-visible` styles, reduced-motion handling, and passing browser checks. | `fix: improve keyboard navigation structure` |
| DOCS-001 | P2 | `scheduled` | Reduce duplicated and self-referential project documentation. | README leads with setup and the core workflow; Roadmap contains future outcomes; Changelog contains user-facing changes rather than a file log. | `docs: focus project maintenance guidance` |
| REL-001 | P1 | `blocked` | Prepare and publish `v0.2.0`. | Every hard gate in the release checklist is complete and the GitHub release points to the verified tag. Depends on MAINT-001 through DOCS-001 as recorded in the checklist. | `docs: prepare v0.2.0 release` |
| COMM-001 | P3 | `scheduled` | Collect feedback from real users of the prompt workflow. | Feedback is linked to an external issue or an anonymized maintainer note with consent; no synthetic comments, accounts, or metrics are added. | Usually no repository commit. |

## Execution Sequence

### Phase 1: Restore The Maintenance Baseline

Target: 2026-07-15 to 2026-07-16

1. Complete MAINT-001 and confirm remote CI is green.
2. Complete MAINT-005 for all future commits.
3. Start MAINT-003 with the first ten issues in the triage ledger.
4. Do not start new product features during this phase.

Exit condition: `main` is green and new commits are attributed correctly.

### Phase 2: Restore Public Verifiability

Target: 2026-07-17 to 2026-07-20

1. Complete MAINT-002 and record the deployed SHA.
2. Complete MAINT-004 after CI is stable.
3. Continue issue triage in batches of no more than ten issues.

Exit condition: a visitor can open the demo and the protected branch reports a
passing required check.

### Phase 3: Protect Local Data

Target: 2026-07-21 to 2026-07-27

1. Complete DATA-001 as one focused behavior change.
2. Complete DATA-002 in a separate change.
3. Complete UX-001 without redesigning the interface.

Exit condition: malformed or oversized imports cannot silently replace the
workspace with an empty-looking state.

### Phase 4: Prepare The Next Release

Target: 2026-07-28 to 2026-08-12

1. Complete DOCS-001 after the behavior and demo are stable.
2. Reduce the open issue set to a reviewed backlog and assign five to eight
   issues to a `v0.2.0` milestone.
3. Complete the release checklist and publish only from a green commit.
4. Begin COMM-001 after the public demo is usable.

Exit condition: the tag, release notes, demo, documentation, and CI describe the
same behavior.

## Scope Guard

Until `v0.2.0` is published, do not add:

- Backend accounts, cloud sync, or shared workspaces
- LLM execution, tracing, evaluation, or agent runtime features
- New standalone utility pages
- Product claims based on unverified users, performance, or adoption

A proposed change may enter the plan only when it improves prompt creation,
review, reuse, backup, local data safety, or project maintenance.

## Progress Log

Add one row only after evidence exists.

| Date | ID | State change | Evidence | Follow-up |
| --- | --- | --- | --- | --- |
| 2026-07-14 | Review | Created action plan | Local checks, GitHub state, and repository structure reviewed at `aab5aee` | Start MAINT-001 |

