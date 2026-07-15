# Issue Triage Ledger

**Status:** Complete
**Last updated:** 2026-07-15
**Open-issue snapshot after #131 closes:** 2 release tasks

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
their acceptance criteria on current `main`; #44 was kept open because the
English and Chinese READMEs no longer documented the verified variable behavior.
That documentation gap was then corrected and closed separately in PR #140.

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
| [#44](https://github.com/as569951728/dev-ai-toolkit/issues/44#issuecomment-4976818819) Variable behavior documentation | `42cc7eb`, [#140](https://github.com/as569951728/dev-ai-toolkit/pull/140) | `close-implemented` | Both READMEs and the walkthrough now match the parser and unresolved-value behavior on `45ba22c`. |

## Fourth Triage Session

The fourth set covered the first ten open issues in Batch B. Each implementation
was checked against the original issue body with focused tests on current
`main`, including real Chromium coverage for the two browser-level behaviors.

| Issue | Implementation | Decision | Verification evidence |
| --- | --- | --- | --- |
| [#47](https://github.com/as569951728/dev-ai-toolkit/issues/47#issuecomment-4976860489) Run Detail copy feedback test | `4cd55c6` | `close-implemented` | The asynchronous full-copy assertion passed in the focused Run Detail tests. |
| [#48](https://github.com/as569951728/dev-ai-toolkit/issues/48#issuecomment-4976860475) Dotted variable browser coverage | `8a36b0b` | `close-implemented` | The create-template-to-preview Chromium scenario passed. |
| [#49](https://github.com/as569951728/dev-ai-toolkit/issues/49#issuecomment-4976860493) Guarded storage initialization | `abd9da2` | `close-implemented` | Guarded resolution, repository fallbacks, write failures, and blocked-storage startup passed. |
| [#50](https://github.com/as569951728/dev-ai-toolkit/issues/50#issuecomment-4976860524) Guarded storage architecture guide | `5479e55` | `close-implemented` | The guide identifies both helpers and distinguishes read fallbacks from write failures. |
| [#51](https://github.com/as569951728/dev-ai-toolkit/issues/51#issuecomment-4976860490) Unavailable storage notice | `3f06cf5` | `close-implemented` | Notice unit tests and the blocked-storage Chromium path passed. |
| [#52](https://github.com/as569951728/dev-ai-toolkit/issues/52#issuecomment-4976860532) Write-blocked storage detection | `be6df56` | `close-implemented` | Read/write probe success, failure, and temporary-key cleanup passed. |
| [#53](https://github.com/as569951728/dev-ai-toolkit/issues/53#issuecomment-4976860505) Orphaned backup notes | `a7d52a2` | `close-implemented` | Hook, transfer, and page exports retain valid notes and exclude orphaned notes. |
| [#54](https://github.com/as569951728/dev-ai-toolkit/issues/54#issuecomment-4976860496) Skipped template imports | `6dc74a7` | `close-implemented` | Parser and list feedback disclose invalid records without changing valid-only feedback. |
| [#55](https://github.com/as569951728/dev-ai-toolkit/issues/55#issuecomment-4976860492) Playground variable whitespace | `ce423ba` | `close-implemented` | Non-empty whitespace is preserved while whitespace-only values remain unresolved. |
| [#56](https://github.com/as569951728/dev-ai-toolkit/issues/56#issuecomment-4976860539) Camel-case variable labels | `ccd3500` | `close-implemented` | Camel-case, dotted, and separator-based labels keep their original lookup keys. |

## Fifth Triage Session

The fifth set covered the next ten open issues in Batch B. Dependency claims
were rechecked against the npm registry, and the full local quality sequence was
run on current `main` instead of relying only on the historical implementation.

| Issue | Implementation | Decision | Verification evidence |
| --- | --- | --- | --- |
| [#57](https://github.com/as569951728/dev-ai-toolkit/issues/57#issuecomment-4976903390) Reliability progress docs | `d469051` | `close-implemented` | Roadmap status and variable guidance remain factual while release gates stay open. |
| [#58](https://github.com/as569951728/dev-ai-toolkit/issues/58#issuecomment-4976903404) Runtime dependency patches | `db91c6a` | `close-implemented` | The three runtime packages have no current compatible updates; the full quality sequence passed. |
| [#59](https://github.com/as569951728/dev-ai-toolkit/issues/59#issuecomment-4976903386) Vitest patch alignment | `383f0e7` | `close-implemented` | Vitest and its coverage provider remain aligned at 4.1.10 with no current compatible update. |
| [#60](https://github.com/as569951728/dev-ai-toolkit/issues/60#issuecomment-4976903392) Coverage baseline | `496aee1` | `close-implemented` | Explicit conservative thresholds passed, and CI runs coverage once before separate browser tests. |
| [#61](https://github.com/as569951728/dev-ai-toolkit/issues/61#issuecomment-4976903414) Unresolved variable names | `01b5885` | `close-implemented` | The notice updates readable missing labels in form order without blocking partial actions. |
| [#62](https://github.com/as569951728/dev-ai-toolkit/issues/62#issuecomment-4976903393) Rapid run writes | `7399dab` | `close-implemented` | Two synchronous run creates remain in provider state and the injected repository. |
| [#63](https://github.com/as569951728/dev-ai-toolkit/issues/63#issuecomment-4976903432) Rapid template writes | `628da71` | `close-implemented` | Two synchronous template creates remain in provider state and the injected repository. |
| [#64](https://github.com/as569951728/dev-ai-toolkit/issues/64#issuecomment-4976903449) Rapid note writes | `004fc49` | `close-implemented` | Notes saved synchronously for different runs remain in state and the injected repository. |
| [#65](https://github.com/as569951728/dev-ai-toolkit/issues/65#issuecomment-4976903405) Backup relationship rules | `154148d` | `close-implemented` | Docs and parser tests distinguish standalone saved runs from required note-to-run references. |
| [#66](https://github.com/as569951728/dev-ai-toolkit/issues/66#issuecomment-4976903424) Template deletion retention | `f36a54f` | `close-implemented` | Confirmation guidance, cancellation, deletion, and storage failures remain covered. |

## Sixth Triage Session

The sixth set completed Batch B with three rollback and data-integrity issues.
Each failure path was verified in focused workflow or provider tests before the
current main-branch CI result was used as regression evidence.

| Issue | Implementation | Decision | Verification evidence |
| --- | --- | --- | --- |
| [#67](https://github.com/as569951728/dev-ai-toolkit/issues/67#issuecomment-4976936871) Failed note rollback | `aa8f4d9` | `close-implemented` | Run Detail distinguishes failed note restoration from an ordinary deletion error. |
| [#68](https://github.com/as569951728/dev-ai-toolkit/issues/68#issuecomment-4976936836) Failed run import rollback | `f905e54` | `close-implemented` | New and replaced run rollback failures produce specific partial-import warnings. |
| [#69](https://github.com/as569951728/dev-ai-toolkit/issues/69#issuecomment-4976936847) Exact workspace rollback | `43d26b6`, `3a6da41` | `close-implemented` | Exact collection restoration removes new records while retaining rollback failure warnings. |

## Seventh Triage Session

The seventh set started Batch C with ten issues covering no-op writes,
documentation boundaries, test isolation, runtime support, imports, and
Playground fallback feedback. All were rechecked on current `main`.

| Issue | Implementation | Decision | Verification evidence |
| --- | --- | --- | --- |
| [#70](https://github.com/as569951728/dev-ai-toolkit/issues/70#issuecomment-4976972809) No-note run deletion | `79eed12` | `close-implemented` | Run deletion skips note storage only when no related note exists; rollback paths remain covered. |
| [#71](https://github.com/as569951728/dev-ai-toolkit/issues/71#issuecomment-4976972745) Collection rollback boundaries | `49e19b2` | `close-implemented` | Architecture docs distinguish merge imports, exact replacement, and persistence-before-state. |
| [#72](https://github.com/as569951728/dev-ai-toolkit/issues/72#issuecomment-4976972743) Global component cleanup | `85c1dda` | `close-implemented` | Shared cleanup runs after each Vitest case, and the complete coverage suite passes. |
| [#73](https://github.com/as569951728/dev-ai-toolkit/issues/73#issuecomment-4976972741) Node runtime boundary | `686a590` | `close-implemented` | Manifest, CI, both READMEs, and deployment docs use the same supported Node range. |
| [#75](https://github.com/as569951728/dev-ai-toolkit/issues/75#issuecomment-4976972774) Imported active templates | `00ff358` | `close-implemented` | Explicit null archive metadata restores active state while legacy fallbacks remain unchanged. |
| [#76](https://github.com/as569951728/dev-ai-toolkit/issues/76#issuecomment-4976972770) Unavailable Playground template | `296dede` | `close-implemented` | Missing and archived template links select and name the active fallback. |
| [#77](https://github.com/as569951728/dev-ai-toolkit/issues/77#issuecomment-4976972766) Unavailable Playground run | `edd2fdf` | `close-implemented` | Missing run, missing source, and archived source states show distinct fallback feedback. |
| [#78](https://github.com/as569951728/dev-ai-toolkit/issues/78#issuecomment-4976972762) Unchanged template revisions | `9377d76` | `close-implemented` | No-op edits preserve history and avoid writes; real changes still create a revision. |
| [#79](https://github.com/as569951728/dev-ai-toolkit/issues/79#issuecomment-4976972763) Unchanged note writes | `a684a2c` | `close-implemented` | Unchanged and blank no-op saves preserve timestamps and avoid repository writes. |
| [#80](https://github.com/as569951728/dev-ai-toolkit/issues/80#issuecomment-4976972807) Template import semantics | `e3c7b10` | `close-implemented` | Matching-ID replacement behavior is visible before the file picker opens. |

## Eighth Triage Session

The eighth set covered the next ten Batch C issues. One historical documentation
issue described a single-tab model; its evidence records both the original fix
and the later cross-tab refresh behavior so the current limitation is not
misrepresented.

| Issue | Implementation | Decision | Verification evidence |
| --- | --- | --- | --- |
| [#81](https://github.com/as569951728/dev-ai-toolkit/issues/81#issuecomment-4977011798) Browser-tab storage model | `27f9817`, `6779841` | `close-implemented` | Current docs describe cross-tab refresh and the remaining last-write-wins limitation instead of restoring obsolete single-tab wording. |
| [#82](https://github.com/as569951728/dev-ai-toolkit/issues/82#issuecomment-4977011827) Missing template details | `44e52be` | `close-implemented` | Missing detail links show the local-data explanation and a return action without redirecting silently. |
| [#83](https://github.com/as569951728/dev-ai-toolkit/issues/83#issuecomment-4977011796) Unsaved changes focus | `8a78879` | `close-implemented` | The named dialog focuses Continue editing while preserving stay, discard, save, and unload behavior. |
| [#84](https://github.com/as569951728/dev-ai-toolkit/issues/84#issuecomment-4977011793) Run import confirmation | `b5ba362` | `close-implemented` | Conflicting runs and notes remain unchanged until the user confirms replacement. |
| [#85](https://github.com/as569951728/dev-ai-toolkit/issues/85#issuecomment-4977011771) Run note draft protection | `6ca2c2e` | `close-implemented` | Internal navigation, unload, continue, discard, and confirmed deletion paths are covered. |
| [#86](https://github.com/as569951728/dev-ai-toolkit/issues/86#issuecomment-4977011843) Workspace import preview | `303e4c5` | `close-implemented` | Valid backups show collection effects before writes; cancel, confirm, and invalid input remain distinct. |
| [#87](https://github.com/as569951728/dev-ai-toolkit/issues/87#issuecomment-4977011790) Duplicate template IDs | `55d0306` | `close-implemented` | Duplicate and invalid counts are separate while the last valid template remains authoritative. |
| [#88](https://github.com/as569951728/dev-ai-toolkit/issues/88#issuecomment-4977011854) Imported template ID normalization | `6bb765d` | `close-implemented` | Trimmed IDs match existing records and retain version and archive fallbacks. |
| [#89](https://github.com/as569951728/dev-ai-toolkit/issues/89#issuecomment-4977011834) Duplicate workspace records | `516b1a7` | `close-implemented` | Duplicate primary records and note run IDs are rejected before preview. |
| [#90](https://github.com/as569951728/dev-ai-toolkit/issues/90#issuecomment-4977011788) Workspace preview docs | `18db17f` | `close-implemented` | Docs match validation, confirmation, unique-key, and recent-shortcut behavior. |

## Ninth Triage Session

The ninth set completed Batch C with five issues covering missing edit routes,
confirmation focus, and template revision restore behavior. Focus and browser
workflow evidence was checked on current `main` before closure.

| Issue | Implementation | Decision | Verification evidence |
| --- | --- | --- | --- |
| [#91](https://github.com/as569951728/dev-ai-toolkit/issues/91#issuecomment-4977051621) Missing template edit routes | `03bc57d` | `close-implemented` | Missing IDs keep the requested URL and show a return action; existing IDs still render the form. |
| [#92](https://github.com/as569951728/dev-ai-toolkit/issues/92#issuecomment-4977051615) Template delete focus | `3d0395d` | `close-implemented` | The non-destructive Cancel action receives focus and restores the regular Delete action. |
| [#93](https://github.com/as569951728/dev-ai-toolkit/issues/93#issuecomment-4977051641) Run delete focus | `8e333f0` | `close-implemented` | The existing run confirmation now moves focus to Cancel without changing deletion behavior. |
| [#94](https://github.com/as569951728/dev-ai-toolkit/issues/94#issuecomment-4977051616) Revision restore confirmation | `9a1f72d` | `close-implemented` | One historical revision can be pending; cancel and confirm preserve the versioning contract. |
| [#95](https://github.com/as569951728/dev-ai-toolkit/issues/95#issuecomment-4977051585) Revision restore browser flow | `6014b20` | `close-implemented` | Chromium verifies edit to version 2, focused cancel, no early restore, and confirmed version 3. |

## Tenth Triage Session

The tenth set started Batch D with snapshot reuse and identifier normalization.
The review covered user-visible handoffs, import boundaries, workspace validation,
and legacy local-storage records on current `main`.

| Issue | Implementation | Decision | Verification evidence |
| --- | --- | --- | --- |
| [#96](https://github.com/as569951728/dev-ai-toolkit/issues/96#issuecomment-4977103825) Single-run import boundary | `6c3eda2` | `close-implemented` | Docs distinguish prompt snapshot and note import from template-library restoration. |
| [#97](https://github.com/as569951728/dev-ai-toolkit/issues/97#issuecomment-4977103806) Prompt snapshot labels | `00170cf` | `close-implemented` | Playground labels match the locally saved artifact without changing persistence. |
| [#98](https://github.com/as569951728/dev-ai-toolkit/issues/98#issuecomment-4977103744) Direct snapshot reopen | `51016cc` | `close-implemented` | Active source templates expose Run History reuse; missing and archived sources do not. |
| [#99](https://github.com/as569951728/dev-ai-toolkit/issues/99#issuecomment-4977103808) Snapshot reuse docs | `bde8e5c` | `close-implemented` | The workflow guide records direct reuse and the source-template boundary. |
| [#100](https://github.com/as569951728/dev-ai-toolkit/issues/100#issuecomment-4977103760) Reopen fallback context | `5eef396` | `close-implemented` | Run Detail and Run History carry equivalent run and template context. |
| [#101](https://github.com/as569951728/dev-ai-toolkit/issues/101#issuecomment-4977103746) Imported run identifiers | `b9e562f` | `close-implemented` | Normalized conflicts require confirmation while prompt, variable, and note content stays intact. |
| [#102](https://github.com/as569951728/dev-ai-toolkit/issues/102#issuecomment-4977103836) Workspace identifiers | `5cbbf8a` | `close-implemented` | Normalized duplicates and relationships are validated before workspace preview. |
| [#103](https://github.com/as569951728/dev-ai-toolkit/issues/103#issuecomment-4977103881) Stored run identifiers | `2816155` | `close-implemented` | Whitespace-equivalent stored runs collapse to the latest record without changing prompt content. |
| [#104](https://github.com/as569951728/dev-ai-toolkit/issues/104#issuecomment-4977103815) Stored note identifiers | `f57b154` | `close-implemented` | Normalized run IDs retain the latest valid note without trimming note bodies. |
| [#105](https://github.com/as569951728/dev-ai-toolkit/issues/105#issuecomment-4977104094) Stored template identifiers | `bc8cffa` | `close-implemented` | Normalized IDs retain the latest valid template and current prompt content. |

## Eleventh Triage Session

The eleventh set covered the next ten Batch D issues. The review checked source
comparison states, URL-safe route construction, the `new` route collision,
shared Playground links, and snapshot-to-template documentation.

| Issue | Implementation | Decision | Verification evidence |
| --- | --- | --- | --- |
| [#106](https://github.com/as569951728/dev-ai-toolkit/issues/106#issuecomment-4977147646) Unavailable source revisions | `9f3dbd8` | `close-implemented` | Run Detail distinguishes missing revision history from a missing source template. |
| [#107](https://github.com/as569951728/dev-ai-toolkit/issues/107#issuecomment-4977147703) Unavailable history comparisons | `9656017` | `close-implemented` | Run History cards retain separate matching, missing-revision, and missing-template states. |
| [#108](https://github.com/as569951728/dev-ai-toolkit/issues/108#issuecomment-4977147647) Imported run detail links | `b2f3d7d` | `close-implemented` | URL-sensitive run IDs stay within one encoded route segment. |
| [#109](https://github.com/as569951728/dev-ai-toolkit/issues/109#issuecomment-4977147619) Shared run detail paths | `23e92e2` | `close-implemented` | Remaining workflow components use the same path helper without changing ordinary URLs. |
| [#110](https://github.com/as569951728/dev-ai-toolkit/issues/110#issuecomment-4977147634) Source template paths | `e782047` | `close-implemented` | URL-sensitive source IDs resolve to the matching local template. |
| [#111](https://github.com/as569951728/dev-ai-toolkit/issues/111#issuecomment-4977147631) Template detail and edit paths | `6a9e1b0` | `close-implemented` | Imported templates remain viewable and editable through shared encoded helpers. |
| [#112](https://github.com/as569951728/dev-ai-toolkit/issues/112#issuecomment-4977147651) Template query navigation | `661a88c` | `close-implemented` | Playground and Run History receive the full decoded template ID. |
| [#113](https://github.com/as569951728/dev-ai-toolkit/issues/113#issuecomment-4977147626) Imported `new` template ID | `e87184e` | `close-implemented` | The create route is separate, so the accepted ID remains viewable and editable. |
| [#114](https://github.com/as569951728/dev-ai-toolkit/issues/114#issuecomment-4977147687) Shared Playground links | `a3f8591` | `close-implemented` | Saved-run and template-only links use shared helpers with compatible output. |
| [#116](https://github.com/as569951728/dev-ai-toolkit/issues/116#issuecomment-4977147648) Snapshot-to-template docs | `20ff9e5`, `c16166e` | `close-implemented` | Current user docs explain explicit reuse and resolved-value limits; completed history lives in Changelog and release notes rather than the future-only Roadmap. |

## Twelfth Triage Session

The twelfth set completed Batch D with the remaining saved-run handoff issue.
The implementation, both README languages, the workflow guide, and the browser
round trip were checked on current `main` before closure.

| Issue | Implementation | Decision | Verification evidence |
| --- | --- | --- | --- |
| [#118](https://github.com/as569951728/dev-ai-toolkit/issues/118#issuecomment-4977196785) Saved variables in JSON Tools | `8832133`, `52672d0`, `c16166e` | `close-implemented` | Run Detail opens the saved variable object in JSON Tools; current user docs describe the local-only handoff, while completed history remains outside the future-only Roadmap. |

## Final Disposition

Every issue that was open when the `v0.2.0` backlog pass began now has a linked
decision and current-main evidence. The only issues left open after the triage
tracker closes are [#127](https://github.com/as569951728/dev-ai-toolkit/issues/127)
and [#129](https://github.com/as569951728/dev-ai-toolkit/issues/129), which are
the explicit release publication and candidate-verification gates.

## Remaining Review Batches

Process no more than ten issues in one maintenance session. The ranges are
organizational only; they do not imply a shared disposition.

| Batch | Scope | Required output |
| --- | --- | --- |
| A | Complete | Reopen only if current behavior no longer matches the recorded evidence |
| B | Complete | Reopen only if current behavior no longer matches the recorded evidence |
| C | Complete | Reopen only if current behavior no longer matches the recorded evidence |
| D | Complete | Reopen only if current behavior no longer matches the recorded evidence |
| E | Complete | Release tasks remain visible in the release readiness checklist |

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
| 2026-07-15 | #44 follow-up | 1 `close-implemented` | README parity, 2 focused files with 9 passing tests, and [green PR CI](https://github.com/as569951728/dev-ai-toolkit/actions/runs/29388553835) on `45ba22c` | Batch B |
| 2026-07-15 | #47 through #56 | 10 `close-implemented` | 13 focused files with 117 passing tests, 3 Chromium scenarios, and [green main CI](https://github.com/as569951728/dev-ai-toolkit/actions/runs/29388840912) on `12accff` | Continue Batch B with no more than 10 open issues |
| 2026-07-15 | #57 through #66 | 10 `close-implemented` | npm registry check, 0 audit findings, 62 files with 401 coverage tests, production build, 28 Chromium tests, and [green main CI](https://github.com/as569951728/dev-ai-toolkit/actions/runs/29389260195) on `b913164` | Finish Batch B with #67 through #69 |
| 2026-07-15 | #67 through #69 | 3 `close-implemented` | 8 focused files with 95 passing tests and [green main CI](https://github.com/as569951728/dev-ai-toolkit/actions/runs/29389547947) with 401 coverage tests, build, and 28 Chromium tests on `0532c0e` | Batch C |
| 2026-07-15 | #70, #71, #72, #73, #75 through #80 | 10 `close-implemented` | 6 focused files with 68 passing tests, 2 focused Chromium scenarios, and [green main CI](https://github.com/as569951728/dev-ai-toolkit/actions/runs/29389836302) with 401 coverage tests and 28 browser tests on `cd996bf` | Continue Batch C with no more than 10 open issues |
| 2026-07-15 | #81 through #90 | 10 `close-implemented` | 8 focused files with 125 passing tests, 4 focused Chromium scenarios, and [green main CI](https://github.com/as569951728/dev-ai-toolkit/actions/runs/29390151825) with 401 coverage tests and 28 browser tests on `35acea9` | Finish Batch C with #91 through #95 |
| 2026-07-15 | #91 through #95 | 5 `close-implemented` | 3 focused files with 38 passing tests, 2 focused Chromium scenarios, and [green main CI](https://github.com/as569951728/dev-ai-toolkit/actions/runs/29390490383) with 401 coverage tests and 28 browser tests on `4286772` | Batch D |
| 2026-07-15 | #96 through #105 | 10 `close-implemented` | 8 focused files with 123 passing tests, 1 focused Chromium scenario, and [green main CI](https://github.com/as569951728/dev-ai-toolkit/actions/runs/29390816057) with 401 coverage tests and 28 browser tests on `fc7f491` | Continue Batch D with no more than 10 open issues |
| 2026-07-15 | #106 through #114, #116 | 10 `close-implemented` | 9 focused files with 127 passing tests, 2 focused Chromium scenarios, and [green main CI](https://github.com/as569951728/dev-ai-toolkit/actions/runs/29391219589) with 401 coverage tests and 28 browser tests on `48989c7` | Finish Batch D with #118 |
| 2026-07-15 | #118 | 1 `close-implemented` | 3 focused files with 35 passing tests, 1 focused Chromium scenario, and [green main CI](https://github.com/as569951728/dev-ai-toolkit/actions/runs/29391633430) with 401 coverage tests and 28 browser tests on `8533d9d` | Backlog triage complete; proceed to release PR decisions |
