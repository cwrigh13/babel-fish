# Babel Fish — Codebase Architecture

A multilingual library assistant for staff and customers. Two modes, ten languages, phrase cards with text-to-speech.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend framework | React 18.2 |
| Build tool | Vite 5.0 |
| Backend | Node.js + Express 4.18 |
| Database | Firebase Firestore (NoSQL, real-time) |
| Auth | Firebase Anonymous Auth |
| Speech | Web Speech API (browser-native) |
| Hosting | GitHub Pages (via GitHub Actions) |
| Styling | Inline styles + utility classes (no CSS framework) |

**External APIs used:**
- Google Maps Embed — directions iframe
- QR Code Server API — client-side QR generation
- Google Translate API — optional translation layer (partially integrated)
- Google Gemini API — referenced in config, not fully wired

**Runtime environment variables** are consumed via Vite's `import.meta.env` prefix (`REACT_APP_*` in `.env.example`). There is no SSR.

---

## Database Schema

Firestore only. No migrations, no ORM, no SQL.

### Collection: `phrases`

```
{
  id:           string,              // Firestore doc ID
  type:         "staff" | "customer",
  category:     string,              // e.g. "General Enquiries"
  english:      string,
  translations: {
    "zh-CN": string,   // Mandarin
    "zh-HK": string,   // Cantonese
    "ne-NP": string,   // Nepali
    "el-GR": string,   // Greek
    "ar-SA": string,   // Arabic
    "mk-MK": string,   // Macedonian
    "es-ES": string,   // Spanish
    "it-IT": string,   // Italian
    "id-ID": string,   // Indonesian
    "en-US": string    // English
  }
}
```

### Collection: `conversations` (usage logging)

```
{
  phraseId:  string,
  userType:  "staff" | "customer",
  timestamp: Timestamp,
  userId:    string    // anonymous Firebase UID
}
```

Seed data lives in `babel-fish-app/src/utils/initialPhrases.js`. The app syncs from Firestore on load via `onSnapshot` listeners. If Firestore is unavailable, it falls back to the local seed data.

---

## Scripts

**No `/scripts` directory exists.**

Package scripts only:

```bash
# babel-fish-app/
npm run dev       # vite (port 3000, auto-open)
npm run build     # vite build → dist/
npm run preview   # vite preview

# server/
npm run start     # node index.js
npm run dev       # nodemon index.js
```

Root-level utility files (not npm scripts):
- `serve.cjs` — local static file server
- `start.bat` / `start.ps1` — Windows launch helpers
- `check-status.js` — ad-hoc status check

---

## Coding Patterns

Follow these. They are already established throughout the codebase.

### File naming
- React components: `PascalCase.jsx`
- Services, hooks, utils: `camelCase.js`
- Constants: `camelCase.js`, values exported as `UPPER_CASE`

### Module structure
- **Services** (`src/services/`) — class-based singletons exported as instances. One class per external integration (`FirebaseService`, `SpeechService`).
- **Hooks** (`src/hooks/`) — custom hooks consume services and expose state + handlers. No business logic inside components.
- **Components** (`src/components/`) — dumb presentational components. Receive props, render JSX, emit callbacks.
- **Utils** (`src/utils/`) — pure functions and constants only. No side effects.

### Async
- Use `async/await`. No raw `.then()` chains.
- Wrap every external call in `try/catch`. Log with `console.error`, set error state, degrade gracefully.
- API calls enforce a 10-second timeout. Retry logic caps at 3 attempts.

### State management
- `useState` for local UI state.
- `useCallback` for any function passed as a prop.
- `useRef` for DOM refs and mutable instance variables that must not trigger re-renders.
- No Redux, no Zustand, no Context API beyond what Firebase provides. Keep it that way unless the component tree grows significantly.

### Security (non-negotiable)
- All user input passes through `sanitizeInput()` from `src/utils/security.js` before use.
- Language codes are validated against the `allowedLanguages` allowlist before being passed to speech or translation APIs.
- Rate limiting is applied client-side via the `RateLimiter` class. Default: 60 req/min.
- HTTPS enforcement runs in production only (checked via `import.meta.env.PROD`).
- Never log sensitive values. Never store credentials anywhere but `.env`.

### Styling
- Brand teal: `#00A99D` (primary), `#007A70` (dark)
- Brand red: `#EB001B`
- Use inline styles for component-specific layout. Keep values in `src/utils/constants.js`.
- No CSS-in-JS library. No Tailwind. Inline only.

### What to avoid
- Do not add logic to components. Move it to a hook or service.
- Do not grow `App.jsx` further — it is already 1482 lines. Extract into components.
- Do not introduce a second state management library.
- Do not commit `.env` files.
- Do not bypass the `sanitizeInput` pipeline.
