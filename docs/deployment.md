# Deployment

This project can be deployed to Vercel as a static Vite application.

## Current status

- The app builds with `npm run build`
- The production output directory is `dist`
- Client-side routing is handled by `react-router-dom`
- `vercel.json` is included so route refreshes fall back to `index.html`
- `https://dev-ai-toolkit.vercel.app` responds publicly as of 2026-06-12
- The public URL is not yet verified as tracking the latest `main` branch
- GitHub deployment records currently do not show a Vercel deployment for this
  repository
- Demo verification is tracked in
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

5. Use Node.js `20` or later.
6. Deploy.

## Before publishing

Run the local checks first:

```bash
npm install
npm run test
npm run build
```

## Verify the public demo

When a production deployment is connected, verify both the GitHub side and the
served app before treating the demo as current:

```bash
gh run list --limit 5
gh api repos/as569951728/dev-ai-toolkit/deployments
curl -I -L https://dev-ai-toolkit.vercel.app
```

The demo should be considered current only when the latest `main` commit has
passed CI and the deployed bundle can be tied back to that commit. Until then,
the public URL should be treated as a reachable but possibly stale preview.

## Notes

- This project is local-first, so deployed data still lives in the browser that is using the app.
- There is no backend or shared persistence yet.
- If the Vercel Git integration is changed, update the `Live Demo` sections in
  `README.md` and `README.zh-CN.md`.
