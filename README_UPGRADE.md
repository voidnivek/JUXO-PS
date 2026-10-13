# JUXO PS — Interface & HTML5 Game Loader Upgrade

## What's changed
- Gameplay view expands to the available app viewport instead of a small floating card.
- Layout adapts better to portrait and landscape viewport sizes.
- Added game search and an Add Game panel.
- Hosted HTML5 games can be registered with an HTTPS URL (sites must allow iframe embedding).
- HTML5 ZIP packages can be imported (15 MB compressed limit, 20 MB expanded limit, up to 250 files) using JSZip loaded from a CDN.
- ZIP package data is saved in IndexedDB on the device; game cards are stored locally.
- PWA orientation preference is now `any`, and service worker cache version is bumped.

## Deploy from a phone
1. Download and extract this ZIP.
2. In your existing GitHub `juxo-ps` repository, replace `index.html`, `styles.css`, `app.js`, `manifest.webmanifest`, and `sw.js` with the matching files here.
3. Keep `assets/juxo-icon.svg` and any other existing assets. Do not delete the assets folder.
4. Commit the changes to the same branch Netlify deploys from.
5. Wait for Netlify to finish deploying, then open the installed app and refresh/reopen it. If old files persist, close the app and open the website in Chrome once to let the service worker update.

## ZIP format
A game ZIP should contain an `index.html` entry page plus its assets. The importer rewrites common HTML `src`/`href` references to embedded data URLs. This first version is best suited to simple, self-contained HTML5 games. Games that rely on complex relative asset paths inside CSS, module imports, fetch requests, server routes, or external libraries may need packaging adjustments. The browser does not safely run every arbitrary website or ZIP in the same way as a dedicated game engine.

## Known limitations
- Hosted sites may block embedding with their security headers; JUXO PS cannot override that.
- Orientation is responsive and the manifest allows both orientations, but a web app cannot force every Android/browser combination to rotate. Players may need to rotate their phone manually.
- The ZIP reader is loaded from JSDelivr, so importing ZIPs requires an internet connection. Existing built-in games do not depend on it.
- Imported game packages stay on the same device/browser storage. Clearing site data can remove them.
- This is a first working implementation, so test each imported game and all three built-in games after deployment.
