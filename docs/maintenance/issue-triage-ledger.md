# Issue Triage Ledger

Status: Active  
Last updated: 2026-07-14  
Open-issue snapshot: 99

GitHub Issues remains the source of truth. This ledger defines how the current
backlog is reviewed without bulk-closing work or treating commit messages as
proof of completion.

## Allowed Decisions

| Decision | Use when |
| --- | --- |
| `keep` | The behavior is still missing or can be reproduced. |
| `close-implemented` | The acceptance criteria pass on current `main`. |
| `close-duplicate` | Another open issue covers the same outcome and is linked. |
| `rewrite` | The problem is valid but the current issue describes the wrong scope. |
| `defer` | The issue is valid but outside the current release boundary. |

Use GitHub's normal open or closed state for the final result. The decisions
above explain why that state changed.

## Evidence Required Before Closing

Every `close-implemented` decision needs:

1. A commit or pull request that implements the behavior
2. The exact test, command, or manual path used to verify it
3. Confirmation that the result applies to current `main`
4. A short closing comment containing those references

Do not close an issue because its title resembles a commit subject. Do not post
comments from invented users or reviewers.

## Closing Comment Template

```markdown
Implemented in `<commit-or-pr>`.

Verified on `<main-sha>` with:

- `<test-or-command>`
- `<manual-path-if-needed>`

Closing because the issue's acceptance criteria now pass. Remaining work, if
any, is tracked in #<issue>.
```

## First Triage Session

Review this set first because repository history already contains likely
implementation evidence. Each row remains `unreviewed` until its original issue
body and current behavior have both been checked.

| Issue | Candidate evidence | Initial decision | Verification still required |
| --- | --- | --- | --- |
| [#37](https://github.com/as569951728/dev-ai-toolkit/issues/37) Full prompt clipboard browser coverage | `8730264` | `unreviewed` | Run the named E2E path on current `main`; do not use the currently flaky unit assertion as closure evidence. |
| [#38](https://github.com/as569951728/dev-ai-toolkit/issues/38) Stale Playground copy feedback | `8483878` | `unreviewed` | Change the prompt after copying and verify the feedback clears. |
| [#39](https://github.com/as569951728/dev-ai-toolkit/issues/39) Template context from empty Run History | `8e9a6df` | `unreviewed` | Open empty filtered history from a template and verify the return context. |
| [#40](https://github.com/as569951728/dev-ai-toolkit/issues/40) Dotted variable names | `f9c367a`, `8a36b0b` | `unreviewed` | Run unit and browser coverage for a dotted key. |
| [#45](https://github.com/as569951728/dev-ai-toolkit/issues/45) Shared variable parsing | `d259ffd` | `unreviewed` | Compare all parsing call sites with the issue scope and run the related tests. |
| [#46](https://github.com/as569951728/dev-ai-toolkit/issues/46) Storage read failures during startup | `b7aa21e` | `unreviewed` | Verify the original availability requirement. Track malformed-data recovery separately if the issue did not require a warning. |
| [#74](https://github.com/as569951728/dev-ai-toolkit/issues/74) Unsaved template changes | `590e83b` | `unreviewed` | Exercise navigation, refresh, and external-storage changes with a dirty form. |
| [#115](https://github.com/as569951728/dev-ai-toolkit/issues/115) Template draft from a saved run | `65ad069` | `unreviewed` | Verify the new draft does not mutate the source run or template. |
| [#117](https://github.com/as569951728/dev-ai-toolkit/issues/117) Saved variables in JSON Tools | `8832133` | `unreviewed` | Verify variables are passed without prompt content in the URL. |
| [#119](https://github.com/as569951728/dev-ai-toolkit/issues/119) Return from JSON Tools | `e05144f` | `unreviewed` | Verify the round trip returns to the originating saved run. |

## Remaining Review Batches

Process no more than ten issues in one maintenance session. The ranges are
organizational only; they do not imply a shared disposition.

| Batch | Scope | Required output |
| --- | --- | --- |
| A | #22-#45: storage errors and early prompt workflow changes | One decision and evidence comment per issue |
| B | #46-#69: storage availability, rollback, and same-event writes | Reproduction or current-main verification per issue |
| C | #70-#95: editor safety, imports, confirmations, and browser coverage | Separate behavior bugs from documentation or test follow-up |
| D | #96-#119: navigation, identifiers, reuse, and tool handoffs | Check recent commits and close only after end-to-end verification |
| E | #14 and uncategorized maintenance items | Keep deployment and release blockers visible |

## New Work From The Review

Before creating new GitHub issues, search the existing backlog again. These
items need an issue only if no existing issue has equivalent acceptance criteria.

| Action ID | Proposed issue title | Label | Create when |
| --- | --- | --- | --- |
| MAINT-001 | Test: stabilize Run Detail clipboard feedback assertion | `ci` | No existing issue covers the failing CI assertion. |
| MAINT-003 | Maintenance: reconcile open issues with current main | `chore` | Use one tracking issue, not one issue per triage batch. |
| MAINT-004 | CI: require the main workflow before merge | `ci` | Repository rules cannot be recorded directly in an existing maintenance issue. |
| DATA-001 | Bug: provide recovery when local collections are malformed | `bug` | #46 does not already require visible corruption recovery. |
| DATA-002 | Bug: reject oversized local JSON imports | `bug` | A repository search confirms no equivalent import-limit issue exists. |
| UX-001 | Accessibility: improve heading and keyboard focus structure | `bug` | Existing confirmation-focus issues do not cover the app shell. |
| DOCS-001 | Docs: reduce duplicated current-state and roadmap content | `documentation` | The edit is large enough to benefit from review before implementation. |

## Session Record

Add one row per triage session. Link the GitHub comments or issue queries used as
evidence.

| Date | Issues reviewed | Decisions | Evidence | Next batch |
| --- | --- | --- | --- | --- |
| Pending | Pending | Pending | Pending | First triage session |

