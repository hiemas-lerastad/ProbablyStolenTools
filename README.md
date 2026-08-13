# Rat Colony Manager

A minimal React + Vite "Hello, World!" app, set up to deploy to GitHub Pages.

## Development

```bash
npm install
npm run dev
```

## Deploying to GitHub Pages

This repo includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that builds
the app and publishes it to GitHub Pages automatically on every push to `main`.

One-time setup after pushing this repo to GitHub:

1. Go to the repo's **Settings → Pages**.
2. Under **Build and deployment → Source**, select **GitHub Actions**.
3. Push to `main` (or run the workflow manually from the **Actions** tab).

The site will be published at `https://<your-github-username>.github.io/RatColonyManager/`.

> **Note:** `vite.config.js` sets `base: '/RatColonyManager/'` to match this repo name.
> If you rename the GitHub repo, update that value to match.
