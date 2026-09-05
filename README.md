# R6 Outfit Previewer

A personal-use, static GitHub Pages website for previewing Roblox classic R6 clothing.

## Features

- Blocky R6-style 3D rig
- Toggle head, torso, left/right arms and left/right legs independently
- Upload classic shirt and pants template images
- Orbit/zoom/pan camera
- Add Roblox catalog asset IDs or Roblox URLs
- Loads public Roblox asset thumbnails
- Export/import a small project JSON
- No Roblox login, cookies, passwords, or account credentials

## Important limitation

A normal GitHub Pages site is client-side only. Roblox's asset-delivery and avatar APIs are not all available for direct browser requests because of CORS/security restrictions. Therefore the ID/link feature intentionally loads the public thumbnail for an item instead of claiming to apply the item's actual 3D/accessory geometry.

The clothing template preview is a lightweight classic-template approximation. It is designed for quick personal previews, not as a pixel-perfect replacement for Roblox Studio.

## GitHub Pages setup

1. Create a GitHub repository, e.g. `r6-outfit-previewer`.
2. Upload `index.html`, `style.css`, `app.js`, and `README.md`.
3. In the repository, open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select your main branch and `/ (root)`.
6. Save.
7. GitHub will give you a `https://YOUR-USERNAME.github.io/r6-outfit-previewer/` address.

Because this is a static site, there is no server to install.

## Local testing

You can open `index.html` directly in some browsers, but ES modules and fetch requests are more reliable through a local web server.

With Python installed:

```bash
python -m http.server 8000
```

Then open:

`http://localhost:8000`

## Updating the site

Edit the files, commit the changes, and push them to GitHub. GitHub Pages will rebuild the site automatically.

## Making the item system more advanced

For true item-on-rig rendering, the next step is a small backend/proxy that retrieves Roblox asset metadata/meshes and a proper Roblox R6 UV/material implementation. Keep any Roblox API credentials or server-side secrets off GitHub Pages.
