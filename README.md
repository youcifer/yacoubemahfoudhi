# Yacoube Mahfoudhi — Photography Portfolio

A fast, static portfolio built with Vite + vanilla JS (no framework, ~4 KB gzipped JS).

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # outputs ./dist
```

## Deploy to Vercel

**Dashboard:** push this folder to GitHub → *Add New Project* in Vercel → import the repo → Deploy. Vercel detects Vite automatically (`vercel.json` already sets the build command, output dir and caching headers).

**CLI:**

```bash
npm i -g vercel
vercel --prod
```

## Edit content

- `src/data.js` — name, email, about text, series titles/notes and photo dimensions.
- `public/images/` — photos, named `<series-id>-01.jpg`, `-02.jpg`, … To add a photo, drop the file in and add its `[width, height]` to that series in `data.js`.
- `src/style.css` — colours live in the `:root` tokens at the top (light + dark).
- `index.html` — page title, description and social-share tags. After you have your domain, make `og:image` an absolute URL (e.g. `https://your-domain.com/images/wedding-01.jpg`) so link previews work everywhere.

## Features

Animated hero with a looping film strip, series index with cursor-following previews, filterable justified gallery (deep links like `/#street`), accessible keyboard/swipe lightbox, light/dark theme (saved), copy-email button, reduced-motion support.
