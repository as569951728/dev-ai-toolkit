# Deployment

This project can be deployed to Vercel as a static Vite application.

## Current status

- The app builds with `npm run build`
- The production output directory is `dist`
- Client-side routing is handled by `react-router-dom`
- `vercel.json` is included so route refreshes fall back to `index.html`
- `https://dev-ai-toolkit.vercel.app` was verified in a clean browser on
  2026-07-15
- Production deployment `dpl_5urjtm6eaMvLptwTh4tETaTj8gXc` serves application
  revision [`8ed3825`](https://github.com/as569951728/dev-ai-toolkit/commit/8ed3825fcf007bfa2965da015ec7066f437797b3)
- The verification covered template creation, Playground composition, saving
  and opening a run, refreshing its nested route, and workspace export
- Vercel did not add a record to the repository's GitHub Deployments API, so
  deployment identity is recorded here and in
  [GitHub issue #14](https://github.com/as569951728/dev-ai-toolkit/issues/14)

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

## Notes

- This project is local-first, so deployed data still lives in the browser that is using the app.
- There is no backend or shared persistence yet.
- If the Vercel Git integration is changed, update the `Live Demo` sections in
  `README.md` and `README.zh-CN.md`.
