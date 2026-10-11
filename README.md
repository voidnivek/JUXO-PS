# JUXO PS — First Working Version

A mobile-first, static HTML/CSS/JavaScript mini arcade starter. Includes:
- Responsive dark UI with monochrome + electric-blue accents
- Original inline wolf mascot illustration
- Three playable mini-games: Tap Rush, Memory Mix, Neon Dodge
- PWA manifest and basic service worker for install/offline shell support
- Local recent-play tracking foundation

## Run locally
Open `index.html` in a modern browser. Service-worker/PWA features require HTTPS or localhost.

## Deploy from Android
1. Extract the ZIP.
2. Create a GitHub repository named `juxo-ps`.
3. Upload the contents of this folder (not the ZIP itself) to the repository root.
4. In the hosting provider, import the GitHub repository.
5. Build command: leave blank. Publish/output directory: `/` (repository root).
6. Deploy, open the HTTPS URL on Android, test all three games.
7. In Chrome, use menu → Add to Home screen / Install app.

## Notes
- This is an early prototype, not a finished commercial platform.
- Game names and game art are demo content; replace or expand as we develop.
- No account system or remote database is included yet.
- The PWA icon uses SVG. Some app-store packaging workflows may need generated PNG icons.
- Before commercial release, review naming/trademark implications around “PS” and avoid implying an official connection to PlayStation.
