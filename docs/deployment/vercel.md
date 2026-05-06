# Deploying to Vercel

This project can be deployed to Vercel as a static front-end app.

## What works today

- `npm run build` produces a static production build through Vite
- The app does not require a backend service or server-side rendering
- Local persistence is browser-based, so no deployment-time database setup is required

## Before you deploy

Make sure your local checks are green:

```bash
npm install
npm run lint
npm run test
npm run build
```

The current app uses client-side routing through `react-router-dom`. That means direct access to nested routes such as `/prompts`, `/playground`, or `/json-tools` should be handled as SPA routes in Vercel.

At the moment, this repository does not yet ship with a committed Vercel routing config. If you deploy it as-is, the root entry should work, but deep links may require a rewrite rule to `index.html`.

## Basic deployment steps

1. Import the repository into Vercel.
2. Keep the framework preset as `Vite`.
3. Use the default build command:

```bash
npm run build
```

4. Use the default output directory:

```bash
dist
```

5. Set the Node.js version to `20` or later.
6. Run the first deployment.

## Recommended follow-up

If Vercel deployment becomes part of the regular maintenance flow, the next small infrastructure improvement should be adding a committed routing config for SPA deep links and documenting it here.
