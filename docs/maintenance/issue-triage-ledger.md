# Issue Triage Ledger

**Status:** Active
**Last updated:** 2026-07-15
**Open-issue snapshot:** 73

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

The first set was reviewed against each issue body, targeted tests on current
`main`, and the green main-branch CI run.

| Issue | Implementation | Decision | Verification evidence |
| --- | --- | --- | --- |
| [#37](https://github.com/as569951728/dev-ai-toolkit/issues/37#issuecomment-4971579627) Full prompt clipboard browser coverage | `8730264` | `close-implemented` | Real Chromium clipboard path and 25 browser tests passed. |
| [#38](https://github.com/as569951728/dev-ai-toolkit/issues/38#issuecomment-4971580259) Stale Playground copy feedback | `8483878` | `close-implemented` | Workflow test changes a variable after copying. |
| [#39](https://github.com/as569951728/dev-ai-toolkit/issues/39#issuecomment-4971580820) Template context from empty Run History | `8e9a6df` | `close-implemented` | History tests cover active, archived, unknown, and global empty states. |
| [#40](https://github.com/as569951728/dev-ai-toolkit/issues/40#issuecomment-4971581559) Dotted variable names | `f9c367a`, `8a36b0b` | `close-implemented` | Utility, workflow, and browser coverage passed. |
| [#45](https://github.com/as569951728/dev-ai-toolkit/issues/45#issuecomment-4971582117) Shared variable parsing | `d259ffd` | `close-implemented` | Shared parser, Playground, and Prompt Diff tests passed. |
| [#46](https://github.com/as569951728/dev-ai-toolkit/issues/46#issuecomment-4971582617) Storage read failures during startup | `b7aa21e` | `close-implemented` | Template, run, and note repository failure tests passed. |
| [#74](https://github.com/as569951728/dev-ai-toolkit/issues/74#issuecomment-4971583142) Unsaved template changes | `590e83b` | `close-implemented` | Form navigation, before-unload, and browser paths passed. |
| [#115](https://github.com/as569951728/dev-ai-toolkit/issues/115#issuecomment-4971607921) Template draft from a saved run | `65ad069` | `close-implemented` | Create-page and browser tests preserve the source snapshot. |
| [#117](https://github.com/as569951728/dev-ai-toolkit/issues/117#issuecomment-4971608734) Saved variables in JSON Tools | `8832133` | `close-implemented` | Run Detail, JSON Tools, and browser handoff tests passed. |
| [#119](https://github.com/as569951728/dev-ai-toolkit/issues/119#issuecomment-4971609456) Return from JSON Tools | `e05144f` | `close-implemented` | JSON Tools unit and browser round-trip tests passed. |

## Second Triage Session

The second set covered the first ten remaining issues in Batch A. Each issue
was checked against its original acceptance criteria on current `main` before
the closing comment was posted.

| Issue | Implementation | Decision | Verification evidence |
| --- | --- | --- | --- |
| [#22](https://github.com/as569951728/dev-ai-toolkit/issues/22#issuecomment-4976357529) Duplicate run replacement feedback | `9161f63` | `close-implemented` | New and replacement imports have separate covered feedback paths. |
| [#23](https://github.com/as569951728/dev-ai-toolkit/issues/23#issuecomment-4976360701) Snapshot storage failure | `0149345` | `close-implemented` | Failed saves retain the workflow and render an alert without a saved-run action. |
| [#24](https://github.com/as569951728/dev-ai-toolkit/issues/24#issuecomment-4976360687) Run note storage failure | `c2db16c` | `close-implemented` | Failed note writes preserve the editor draft and render an alert. |
| [#25](https://github.com/as569951728/dev-ai-toolkit/issues/25#issuecomment-4976360714) Template form storage failure | `844731b` | `close-implemented` | Failed create or edit writes keep form values available for retry. |
| [#26](https://github.com/as569951728/dev-ai-toolkit/issues/26#issuecomment-4976360679) Template lifecycle storage failure | `0f37e8a` | `close-implemented` | Failed deletion keeps the detail and confirmation open with an alert. |
| [#27](https://github.com/as569951728/dev-ai-toolkit/issues/27#issuecomment-4976360704) Run note deletion rollback | `71e995b` | `close-implemented` | A failed run deletion restores its note and keeps Run Detail open. |
| [#28](https://github.com/as569951728/dev-ai-toolkit/issues/28#issuecomment-4976360699) Run import rollback | `707cca0` | `close-implemented` | Failed note writes remove new runs or restore the replaced run. |
| [#29](https://github.com/as569951728/dev-ai-toolkit/issues/29#issuecomment-4976360784) Recent-template storage failure | `d2ff32b` | `close-implemented` | Optional recent-template writes cannot interrupt selection or snapshot saving. |
| [#30](https://github.com/as569951728/dev-ai-toolkit/issues/30#issuecomment-4976360727) Run export failure | `f3fa527` | `close-implemented` | Export errors are announced and a later retry can succeed. |
| [#31](https://github.com/as569951728/dev-ai-toolkit/issues/31#issuecomment-4976360772) Workspace export failure | `c42aff0` | `close-implemented` | Workspace export errors are announced and the action remains available. |

## Third Triage Session

The third set completed the remaining Batch A review. Eight issues still met
their acceptance criteria on current `main`; #44 stays open because the current
English and Chinese READMEs no longer document the verified variable behavior.

| Issue | Implementation | Decision | Verification evidence |
| --- | --- | --- | --- |
| [#32](https://github.com/as569951728/dev-ai-toolkit/issues/32#issuecomment-4976752624) Template export failure | `ed10714` | `close-implemented` | Export errors are announced and the download action remains available. |
| [#33](https://github.com/as569951728/dev-ai-toolkit/issues/33#issuecomment-4976752596) Workspace import rollback | `97c1440` | `close-implemented` | Failed multi-repository imports restore the previous workspace state. |
| [#34](https://github.com/as569951728/dev-ai-toolkit/issues/34#issuecomment-4976752589) Workspace browser round trip | `5c0fadf` | `close-implemented` | A real Chromium export and import round trip passed. |
| [#35](https://github.com/as569951728/dev-ai-toolkit/issues/35#issuecomment-4976752597) Copy composed prompt | `200a323` | `close-implemented` | The Playground copies the fully composed prompt in covered workflow tests. |
| [#36](https://github.com/as569951728/dev-ai-toolkit/issues/36#issuecomment-4976752643) Copy saved prompt | `5b39c34` | `close-implemented` | Run Detail copies the saved composed prompt snapshot. |
| [#41](https://github.com/as569951728/dev-ai-toolkit/issues/41#issuecomment-4976752617) Unresolved variable warning | `4a527ee` | `close-implemented` | Unresolved placeholders are reported without blocking copy or save actions. |
| [#42](https://github.com/as569951728/dev-ai-toolkit/issues/42#issuecomment-4976752655) Failed download cleanup | `a8c9d2c` | `close-implemented` | Failed exports revoke the temporary object URL in focused tests. |
| [#43](https://github.com/as569951728/dev-ai-toolkit/issues/43#issuecomment-4976752619) Unknown template filter | `2e9dbb4` | `close-implemented` | Unknown template filters fall back without hiding all templates. |
| [#44](https://github.com/as569951728/dev-ai-toolkit/issues/44#issuecomment-4976756169) Variable behavior documentation | `42cc7eb` | `keep` | Walkthrough and tests still pass, but both current READMEs omit the required examples and empty-value behavior. |

## Remaining Review Batches

Process no more than ten issues in one maintenance session. The ranges are
organizational only; they do not imply a shared disposition.

| Batch | Scope | Required output |
| --- | --- | --- |
| A | #44 remains open for a separate README correction | Close only after both language versions match current behavior |
| B | Remaining open issues in #46-#69: storage availability, rollback, and same-event writes | Reproduction or current-main verification per issue |
| C | Remaining open issues in #70-#95: editor safety, imports, confirmations, and browser coverage | Separate behavior bugs from documentation or test follow-up |
| D | Remaining open issues in #96-#119: navigation, identifiers, reuse, and tool handoffs | Check recent commits and close only after end-to-end verification |
| E | #14 and uncategorized maintenance items | Keep deployment and release blockers visible |

## New Work From The Review

Before creating new GitHub issues, search the existing backlog again. These
items need an issue only if no existing issue has equivalent acceptance criteria.

| Action ID | Proposed issue title | Label | Create when |
| --- | --- | --- | --- |
| MAINT-001 | No issue created; completed in [PR #120](https://github.com/as569951728/dev-ai-toolkit/pull/120) | `ci` | The blocker was resolved before a separate issue was needed. |
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
| 2026-07-15 | #37, #38, #39, #40, #45, #46, #74, #115, #117, #119 | 10 `close-implemented` | 11 targeted files with 105 passing tests and [green main CI](https://github.com/as569951728/dev-ai-toolkit/actions/runs/29349675016) | Batch A, remaining open issues only |
| 2026-07-15 | #22 through #31 | 10 `close-implemented` | 8 targeted files with 125 passing tests on `4808d6a` and [green main CI](https://github.com/as569951728/dev-ai-toolkit/actions/runs/29384607278) | Continue Batch A with no more than 10 open issues |
| 2026-07-15 | #32 through #36, #41 through #44 | 8 `close-implemented`, 1 `keep` | 8 focused files with 131 passing tests, 1 Chromium round trip on `6dc243b`, and [green main CI](https://github.com/as569951728/dev-ai-toolkit/actions/runs/29387858229) | Batch B; #44 remains open for a separate README correction |
