<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/bd46bacb-92a9-423e-8cce-44ddd67a4873

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deployment (GitHub Pages)

This project has been configured with a GitHub Action to automatically deploy to GitHub Pages.
1. Go to repository **Settings** -> **Pages**.
2. Change the **Source** under Build and deployment to **GitHub Actions**.
3. Push to the `main` or `master` branch to trigger a deployment.

_Note: If your repo is not a user site (e.g., `username.github.io`), you might need to update the `base` property in `vite.config.ts` to `/<repo-name>/` for static assets to load correctly._
