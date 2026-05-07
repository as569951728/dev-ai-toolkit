# Deployment

This project can be deployed to Vercel as a static Vite application.

## Current status

- The app builds with `npm run build`
- The production output directory is `dist`
- Client-side routing is handled by `react-router-dom`
- `vercel.json` is included so route refreshes fall back to `index.html`

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

## Notes

- This project is local-first, so deployed data still lives in the browser that is using the app.
- There is no backend or shared persistence yet.
- If a public demo is added later, update the `Live Demo` section in `README.md`.
