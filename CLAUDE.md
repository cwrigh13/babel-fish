# CLAUDE.md — Babel Fish (Georges River Libraries)

This file provides guidance for AI assistants working with this codebase.

## Project Overview

**Babel Fish** is a multilingual phrasebook web application for Georges River Libraries, designed to bridge communication between library staff and non-English speaking customers. It provides instant phrase translations, audio playback, and AI-powered phrase suggestions.

Live URL: https://cwrigh13.github.io/babel-fish/

## Repository Structure

```
babel-fish/
├── babel-fish-app/          # React frontend (primary application)
│   ├── src/
│   │   ├── App.jsx          # Main component (monolithic, 1482 lines)
│   │   ├── App-optimized.jsx # Refactored modular version (252 lines)
│   │   ├── index.js         # Entry point with Firebase config injection
│   │   ├── components/      # Reusable UI components
│   │   ├── services/        # Firebase and Speech API wrappers
│   │   ├── hooks/           # Custom React hooks
│   │   ├── utils/           # Constants, seed data, security helpers
│   │   └── config/          # Security configuration
│   ├── public/
│   ├── dist/                # Vite production build output
│   ├── vite.config.js       # Bundler configuration
│   ├── env.example          # Environment variables template
│   └── package.json
├── server/                  # Node.js/Express backend
│   ├── index.js             # Express server with Firebase Admin SDK
│   └── package.json
├── .github/workflows/       # CI/CD pipelines
├── .claude/launch.json      # Development server launch config
├── assets/                  # Pre-built static assets
├── PRD.md                   # Product Requirements Document
├── user-testing-scenarios.md
└── README.md
```

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend framework | React 18.2.0 |
| Build tool | Vite 5.0.0 |
| Styling | Tailwind CSS + inline `brandColors` |
| Database & Auth | Firebase 10.7.0 (Firestore + anonymous auth) |
| Backend | Node.js + Express 4.18.2 |
| Backend auth | Firebase Admin SDK 12.0.0 |
| AI phrases | Google Gemini API |
| Maps | Google Maps Embed API |
| QR codes | QR Server API (public) |
| Speech | Browser Web Speech API (native) |

## Development Setup

### Prerequisites
- Node.js 18+
- npm

### Frontend

```bash
cd babel-fish-app
cp env.example .env      # Fill in actual API keys
npm install
npm run dev              # Starts on http://localhost:3000
```

### Backend

```bash
cd server
npm install
npm run dev              # Starts on http://localhost:5000 (with nodemon)
# or
npm start                # Starts on http://localhost:5000 (no hot reload)
```

### Environment Variables

Copy `babel-fish-app/env.example` to `babel-fish-app/.env` and fill in values:

```
# Firebase (required)
REACT_APP_FIREBASE_API_KEY
REACT_APP_FIREBASE_AUTH_DOMAIN
REACT_APP_FIREBASE_PROJECT_ID
REACT_APP_FIREBASE_STORAGE_BUCKET
REACT_APP_FIREBASE_MESSAGING_SENDER_ID
REACT_APP_FIREBASE_APP_ID

# Google APIs (optional for some features)
REACT_APP_GEMINI_API_KEY
REACT_APP_GOOGLE_TRANSLATE_API_KEY
REACT_APP_GOOGLE_MAPS_API_KEY

# App config
REACT_APP_APP_ID=babel-fish-app
REACT_APP_ENVIRONMENT=development
REACT_APP_MAX_REQUESTS_PER_MINUTE=60
REACT_APP_ENABLE_HTTPS_ENFORCEMENT=true
REACT_APP_ENABLE_RATE_LIMITING=true
```

**Important**: Vite uses `VITE_` prefix for env vars exposed to client-side code. The `REACT_APP_` prefix may need updating if migrating further — check `src/index.js` for how Firebase config is currently injected.

## Build & Deployment

### Build

```bash
cd babel-fish-app
npm run build    # Outputs to babel-fish-app/dist/
npm run preview  # Preview production build locally
```

The Vite config (`vite.config.js`) applies manual chunk splitting:
- `vendor` chunk: `react`, `react-dom`
- `firebase` chunk: `firebase/app`, `firebase/auth`, `firebase/firestore`

### CI/CD

Two GitHub Actions workflows exist:

| Workflow | File | Trigger | Action |
|----------|------|---------|--------|
| Build & Deploy | `.github/workflows/deploy.yml` | Push to `main`/`master` | Builds app, deploys to GitHub Pages via `peaceiris/actions-gh-pages` |
| Pages (pitch deck) | `.github/workflows/deploy-pages.yml` | Push to `main` or `claude/**`, manual dispatch | Deploys `pitch-deck.html` to GitHub Pages |

Deployment only occurs on `main`/`master` branch pushes, not on PRs.

## Key Source Files

### Frontend

| File | Role |
|------|------|
| `src/App.jsx` | Main monolithic component — state, filtering, audio, Gemini API calls |
| `src/App-optimized.jsx` | In-progress refactored version with extracted components |
| `src/index.js` | Firebase configuration and React DOM render |
| `src/components/LanguageSelector.jsx` | Language dropdown UI |
| `src/components/ModeToggle.jsx` | Staff / Customer mode switch |
| `src/components/CategoryFilter.jsx` | Category filter buttons |
| `src/components/PhraseCard.jsx` | Phrase display with audio playback |
| `src/services/firebase.js` | Firestore CRUD operations |
| `src/services/speech.js` | Web Speech API TTS/STT wrapper |
| `src/hooks/useFirebase.js` | Custom hook for Firebase state |
| `src/hooks/useSpeech.js` | Custom hook for speech synthesis |
| `src/utils/constants.js` | Brand colors, language codes, QR/map URLs, UI labels |
| `src/utils/initialPhrases.js` | Seed phrase data for 9+ languages |
| `src/utils/security.js` | Input sanitization, rate limiting utilities |
| `src/config/security.js` | Security policy settings |

### Backend

| File | Role |
|------|------|
| `server/index.js` | Express server, Firebase Admin SDK, `/api/phrases` endpoint, `/health` check |

## Architecture Decisions

### Dual-mode UX
The app has two distinct modes toggled via `ModeToggle`:
- **Staff mode**: Access to all phrases with TTS playback; can use Gemini AI to generate ad-hoc phrases
- **Customer mode**: Simplified view showing direction/service info (e.g., map + QR to Centrelink)

### Language Support
Supported languages with BCP-47 codes from `src/utils/constants.js`:
- Mandarin (`zh-CN`), Cantonese (`zh-HK`), Nepali (`ne-NP`), Greek (`el-GR`),
  Arabic (`ar-SA`), Macedonian (`mk-MK`), Spanish (`es-ES`), Italian (`it-IT`), Indonesian (`id-ID`)

English is intentionally excluded from staff language selection (staff select the customer's language).

### Phrase Data Structure
Phrases in Firestore follow this shape:
```js
{
  id: string,
  english: string,          // Source text
  category: string,         // e.g. "Greetings", "Library Services"
  translations: {
    "zh-CN": string,
    "zh-HK": string,
    // ... other language codes
  }
}
```

### App.jsx vs App-optimized.jsx
- `App.jsx` is the active production component (monolithic, ~1482 lines)
- `App-optimized.jsx` is the target refactored architecture (~252 lines, uses extracted components/hooks)
- When making changes, prefer adding to `App-optimized.jsx` if restructuring; otherwise modify `App.jsx` directly
- Do not mix logic between the two files without explicit intent to migrate

## Coding Conventions

### Naming
- **Components**: PascalCase (`LanguageSelector`, `PhraseCard`)
- **Files**: Match component name for components; camelCase for services/hooks/utils
- **Constants**: UPPER_SNAKE_CASE (`STAFF_CATEGORY_ORDER`, `LANGUAGE_CODES`)
- **Variables/functions**: camelCase (`currentMode`, `fetchSuggestedPhrases`)

### React Patterns
- Functional components with hooks only (no class components)
- `useState` for local state; `useCallback` for memoized handlers
- Custom hooks in `src/hooks/` for reusable stateful logic
- Services in `src/services/` for all external API calls (Firebase, Speech)

### Styling
- Inline styles using `brandColors` object from `src/utils/constants.js` for brand consistency
- Tailwind CSS utility classes for layout and spacing
- Mobile-first responsive design
- Georges River Council brand palette: teal/green primary, white secondary

### Security (important)
- Always sanitize user input before use — helpers exist in `src/utils/security.js`
- Validate API responses before rendering
- Never commit `.env` or API keys
- Rate limiting is applied to Gemini API calls via `src/config/security.js`
- HTTPS is enforced in production

## Testing

### Automated Tests
No automated testing framework is currently configured. Future tests should use:
- React Testing Library + Jest for component tests
- Test files go in `__tests__/` subdirectory alongside the code they test

### Manual Testing
See `user-testing-scenarios.md` for comprehensive QA scenarios covering:
- Staff language selection and audio playback
- Category filtering
- Mandarin/Cantonese modal interaction
- Customer mode (Centrelink map, QR code)
- AI phrase suggestion via Gemini

## Common Tasks

### Adding a new language
1. Add the BCP-47 code and display name to `LANGUAGE_CODES` in `src/utils/constants.js`
2. Add translations for all existing phrases in `src/utils/initialPhrases.js`
3. Ensure the language code is a valid `SpeechSynthesisUtterance` `lang` value for TTS

### Adding a new phrase category
1. Add the category name to `STAFF_CATEGORY_ORDER` in `src/utils/constants.js`
2. Add seed phrases for the category in `src/utils/initialPhrases.js`
3. The `CategoryFilter` component will automatically render it

### Adding a new API integration
1. Create a service file in `src/services/`
2. Create a corresponding custom hook in `src/hooks/` if stateful
3. Apply input validation and rate limiting per `src/config/security.js`
4. Add any required env vars to `env.example` with placeholder values

## Git Workflow

- Default branch: `main` (also `master` alias)
- Feature branches: `claude/<description>` or `cwrigh13/<description>`
- CI runs on PRs targeting `main`/`master`; deployment only triggers on merge
- Commits are signed (SSH key configured in git config)

## Important Notes for AI Assistants

- **Do not modify** `.env` files or expose API keys in any output
- **Prefer editing `App.jsx`** for functional fixes; use `App-optimized.jsx` only when explicitly refactoring
- The `assets/` directory at root contains pre-built static files — do not manually edit them; they are generated by the build
- `serve.cjs` and `check-status.js` are development utility scripts, not production code
- `app.js` at the root is a legacy/duplicate of `App.jsx` — avoid editing it unless explicitly asked
- `gemini.html`, `gemini-version.html`, and `test-translate-integration.html` are standalone prototype pages, not part of the main app build
- The `pitch-deck.html` is deployed separately via the `deploy-pages.yml` workflow
