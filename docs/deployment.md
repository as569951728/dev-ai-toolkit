# Deployment

This project can be deployed to Vercel as a static Vite application.

## Deployment configuration

- The app builds with `npm run build`
- The production output directory is `dist`
- Client-side routing is handled by `react-router-dom`
- `vercel.json` is included so route refreshes fall back to `index.html`
- `npm run test:demo` runs the read-only production smoke check without starting
  the local Vite server
- Vercel did not add a record to the repository's GitHub Deployments API, so
  immutable verification records include the Vercel deployment ID

## Verification records

These records describe the revision that was tested at that time. Use Vercel
deployment metadata to identify the revision currently behind the canonical
alias.

### Post-release feedback smoke check

- Date: 2026-07-15
- Deployment: `dpl_85w2c998ShA4Wy6gxBifw4gSSQro`
- Revision: [`ec58ced`](https://github.com/as569951728/dev-ai-toolkit/commit/ec58ced4347bfa3b54fefb0991b0b5a164e8ad68)
- Scope: home, Playground, Run History, and Workspace Backup returned 200 at
  desktop and 375px mobile sizes; the workflow feedback link was visible with
  the expected destination and safe external-link attributes

### v0.2.0 release walkthrough

- Date: 2026-07-15
- Deployment: `dpl_5urjtm6eaMvLptwTh4tETaTj8gXc`
- Revision: [`8ed3825`](https://github.com/as569951728/dev-ai-toolkit/commit/8ed3825fcf007bfa2965da015ec7066f437797b3)
- Scope: template creation, Playground composition, saved-run review,
  nested-route refresh, and workspace export
- Release: [`v0.2.0`](https://github.com/as569951728/dev-ai-toolkit/releases/tag/v0.2.0)

## Deploy to Vercel

1. Import this repository into Vercel.
2. Keep the detected framework as `Vite`.
3. Use the default build command:

```bash
npm run build
```

4. Use the default output directory:

```bash
dist
```

5. Use Node.js `20.19+` or `22.12+`.
6. Deploy.

## Before publishing

Run the local checks first:

```bash
npm install
npm run test
npm run build
```

## Verify the public demo

For each production update, verify the served app and record the deployment ID
and commit SHA before treating the demo as current:

```bash
gh run list --limit 5
vercel inspect https://dev-ai-toolkit.vercel.app
```

Then use a clean browser to create a template, compose and save a prompt run,
open it from Run History, export the workspace, and refresh a nested route. The
demo should be considered current only when the deployed application revision
has passed CI and the walkthrough succeeds.

Run the repeatable, read-only part of that check with:

```bash
npm run test:demo
```

This checks the main public routes, the Overview-to-Playground entry, and a
direct Playground refresh. It does not replace the release walkthrough above.
If Chromium needs an HTTP proxy on the current network, set
`PLAYWRIGHT_PROXY_SERVER` before running the command. Keep machine-specific
proxy values out of repository files.

## Notes

- This project is local-first, so deployed data still lives in the browser that is using the app.
- There is no backend or shared persistence yet.
- If the Vercel Git integration is changed, update the `Live Demo` sections in
  `README.md` and `README.zh-CN.md`.
