# Babel Fish — Refactor & Bug Fix Guide

This guide covers every issue identified in the app analysis, in the recommended order of completion. Work through each section sequentially — later steps assume earlier ones are done.

---

## Table of Contents

1. [Architecture Decision — Consolidate to One Codebase](#1-architecture-decision--consolidate-to-one-codebase)
2. [Fix the Translation Data](#2-fix-the-translation-data)
3. [Remove Duplicate Constants from App.jsx](#3-remove-duplicate-constants-from-appjsx)
4. [Decide on Firebase — Wire It Properly or Remove It](#4-decide-on-firebase--wire-it-properly-or-remove-it)
5. [Fix TTS Voice Selection (Cantonese/Mandarin Collision)](#5-fix-tts-voice-selection-cantoneseandarin-collision)
6. [Fix isSpeaking State (Timer vs Real Event)](#6-fix-isspeaking-state-timer-vs-real-event)
7. [Fix the Maps and QR Code URLs](#7-fix-the-maps-and-qr-code-urls)
8. [Fix the Translation Key Inconsistency](#8-fix-the-translation-key-inconsistency)
9. [Fix the QR Prompt Typo](#9-fix-the-qr-prompt-typo)
10. [Remove Placeholder and Dead Code](#10-remove-placeholder-and-dead-code)
11. [Fix the Double Render on Mode Switch](#11-fix-the-double-render-on-mode-switch)
12. [Acknowledge Unsupported TTS Languages](#12-acknowledge-unsupported-tts-languages)
13. [Split App.jsx into Smaller Components](#13-split-appjsx-into-smaller-components)

---

## 1. Architecture Decision — Consolidate to One Codebase

### The problem
There are currently two parallel versions of this app living in the same repository:
- **Vanilla JS version**: `app.js` + root `index.html`, with a build output in `dist/`
- **React/Vite version**: `babel-fish-app/src/`, with components, hooks, and services already partially built

Both are incomplete. They have diverged in data quality (the vanilla version has cleaner translations). The React version has more structural groundwork (components, hooks, a service layer) but is broken in several ways.

### Decision
**Adopt the React/Vite app (`babel-fish-app/`) as the single canonical version.** The vanilla `app.js` and root `index.html` will be kept only as a reference archive during the migration, then archived or deleted.

### Steps

1. **Confirm the React app builds and runs** before making any other changes:
   ```bash
   cd babel-fish-app
   npm install
   npm run dev
   ```
   Open the local URL in Chrome and verify the app loads. Note any runtime errors in the browser console.

2. **Copy the `dist/` output from the React app to the root `dist/` folder** (or configure the Vite build output to target the root `dist/` if that's where your deployment expects it). Check `babel-fish-app/vite.config.js` for the current `build.outDir` setting.

3. **Do not touch `app.js` directly** from this point on — use it only as a reference for correct translations (see Step 2). Once the React app is confirmed working, the vanilla files (`app.js`, root `index.html`, `serve.cjs`, `start.bat`, `start.ps1`) can be moved into an `_archive/` folder.

4. **Verify the deployed `index.html`** at the root references the React build output correctly. If it currently points at `/babel-fish/assets/index-BtYn46Fe.js` (a stale hash), it will need to be regenerated from a fresh `npm run build`.

---

## 2. Fix the Translation Data

### The problem
The translation data in the React app (`App.jsx` inline + `babel-fish-app/src/utils/initialPhrases.js`) is corrupted throughout — many translations contain mixed scripts, wrong languages, Korean inserted into Arabic, Tagalog used as Spanish, and English words left inside foreign-language strings. The data also exists in three places at once.

The vanilla `app.js` has the cleanest translations and should be used as the reference.

### Steps

#### 2a. Establish a single phrase data source

1. The canonical phrase data file is `babel-fish-app/src/utils/initialPhrases.js`. This is the only file that should define phrases going forward.

2. Open `babel-fish-app/src/App.jsx`. Around line 112, there is a large inline `const initialPhrases = [...]` block. **Delete this entire block** from `App.jsx`.

3. At the top of `App.jsx`, confirm the following import exists (add it if not):
   ```js
   import { initialPhrases } from './utils/initialPhrases';
   ```

4. Confirm no other file defines a separate phrase array. The `app.js` at the root can be referenced but should never be imported.

#### 2b. Audit and correct every translation in `initialPhrases.js`

Open `babel-fish-app/src/utils/initialPhrases.js` alongside `app.js` (the vanilla reference). Go through each phrase object and replace any corrupted translation with the correct one from `app.js`, or re-translate it properly.

The table below lists every confirmed corrupted entry found during analysis. Correct each one:

| Phrase (English) | Language Code | Broken text | Correct text |
|---|---|---|---|
| `"Please follow me."` | `mk-MK` | `Ве мо lám следете me。` | `Ве молам следете ме.` |
| `"Please follow me."` | `it-IT` | `Per favor, mi segua。` | `Per favore, mi segua.` |
| `"Please follow me."` | `id-ID` | `Tolong ikiti saya。` | `Tolong ikuti saya.` |
| `"Do you prefer to speak Mandarin or Cantonese?"` | `el-GR` | `Προτιμάτε να μιλάτε Μανδαarinika ή Καντονέζικα？` | `Προτιμάτε να μιλάτε Μανδαρινικά ή Καντονέζικα;` |
| `"Do you prefer to speak Mandarin or Cantonese?"` | `mk-MK` | `Дали претpočitate να зборувате μαndaринiski or кантонски？` | `Дали претпочитате да зборувате мандарински или кантонски?` |
| `"Do you prefer to speak Mandarin or Cantonese?"` | `id-ID` | `Apakah Anda more like to speak Mandarin or Kanton？` | `Apakah Anda lebih suka berbicara Mandarin atau Kanton?` |
| `"I speak Mandarin."` | `ar-SA` | `أنا أتحدث الماندايرين。` | `أنا أتحدث الماندرين.` |
| `"I speak Mandarin."` | `mk-MK` | `Зборуам μαndaринiski。` | `Зборувам мандарински.` |
| `"Please wait one moment"` | `ar-SA` | `الرجاء الانت 기다리다。` (Korean inserted) | `الرجاء الانتظار لحظة.` |
| `"Please wait one moment"` | `mk-MK` | `Ве моlam počekajte moment。` | `Ве молам почекајте момент.` |
| `"Please wait one moment"` | `it-IT` | `Per favor, aspetti un momento。` | `Per favore, aspetti un momento.` |
| `"Thank you."` | `es-ES` | `Salamat po。` (this is **Tagalog**) | `Gracias.` |
| `"Thank you."` | `id-ID` | `Terima kindness。` | `Terima kasih.` |
| `"Thank you."` | `mk-MK` | `Ви благодаруваме。` | `Ви благодариме.` |
| `"You are welcome."` | `mk-MK` | `Неμα na што。` | `Нема на што.` |
| `"Please show me your library card"` | `mk-MK` | `Ве мо lám pokažete mi ja vašata bibliotečna kartička。` | `Ве молам покажете ми ја вашата библиотечна картичка.` |
| `"Please show me your library card"` | `it-IT` | `Per favor, mi mostri la sua tessera della biblioteca。` | `Per favore, mi mostri la sua tessera della biblioteca.` |
| `"Would you like to create a library card? It is free of charge."` | `el-GR` | `...Είναι δω ücretsiz。` (Turkish word) | `Θα θέλατε να βγάλετε κάρτα βιβλιοθήκης; Είναι δωρεάν.` |
| `"Would you like to create a library card? It is free of charge."` | `id-ID` | `...This is free of charge。` | `Apakah Anda ingin membuat kartu perpustakaan? Ini gratis.` |
| `"Would you like to borrow these items?"` | `id-ID` | `Apakah Anda ingin meminjam barang-abag this？` | `Apakah Anda ingin meminjam barang-barang ini?` |
| `"Would you like to return these items?"` | `it-IT` | `Le piacerebbe restituire these items？` | `Le piacerebbe restituire questi articoli?` |
| `"Would you like to return these items?"` | `id-ID` | `Apakah Anda ingin mengembalikan barang-barang this？` | `Apakah Anda ingin mengembalikan barang-barang ini?` |
| `"Would you like to use the internet?"` | `id-ID` | `Apakah 您 want to use internet？` (Chinese char) | `Apakah Anda ingin menggunakan internet?` |
| `"Would you like to use the printer?"` | `id-ID` | `Apakah 您 want to use printer？` | `Apakah Anda ingin menggunakan printer?` |
| `"Do you need help using the printer?"` | `id-ID` | `Apakah 您 butuh bantuan using printer？` | `Apakah Anda butuh bantuan menggunakan printer?` |
| `"Do you need help using the internet?"` | `id-ID` | `Apakah 您 butuh bantuan using internet？` | `Apakah Anda butuh bantuan menggunakan internet?` |
| `"How do I renew my borrowed items?"` | `id-ID` | `Bagaimana cara memperpanjang peminjaman barang-abag this？` | `Bagaimana cara memperpanjang peminjaman barang-barang ini?` |
| `"Is there anyone here who can speak Mandarin?"` | `el-GR` | `...που να μιλάει Μανδαarinika？` | `Υπάρχει κάποιος εδώ που να μιλάει Μανδαρινικά;` |
| `"Is there anyone here who can speak Mandarin?"` | `ar-SA` | `...يتحدث المανταрин？` (Cyrillic mixed in) | `هل يوجد هنا من يتحدث الماندرين؟` |
| `"Is there anyone here who can speak Cantonese?"` | `el-GR` | `Υπάρχει κάποιος here who can speak Cantonese？` | `Υπάρχει κάποιος εδώ που μιλάει Καντονέζικα;` |
| `"Is there anyone here who can speak Cantonese?"` | `es-ES` | `¿Has alguien here who can speak Cantonese？` | `¿Hay alguien aquí que hable cantonés?` |
| `"Is there anyone here who can speak Cantonese?"` | `it-IT` | `C'è qualcuno here who can speak Cantonese？` | `C'è qualcuno qui che parla cantonese?` |
| `"Is there anyone here who can speak Cantonese?"` | `id-ID` | `Apakah there is anyone here who can speak Cantonese？` | `Apakah ada orang di sini yang bisa berbicara Kanton?` |
| `"Do you have Chinese language DVDs?"` | `id-ID` | `Apakah 您 punya majalah berbahasas Cina？` | `Apakah Anda punya DVD berbahasa Cina?` |
| `"Are there public computers available?"` | `it-IT` | `Ci sono computer publics disponibles with connessione internet？` | `Ci sono computer pubblici disponibili con connessione internet?` |
| `"Are there printers available?"` | `es-ES` | `¿Hay impresoras available？` | `¿Hay impresoras disponibles?` |
| `"Are there printers available?"` | `it-IT` | `Ci sono stampanti available？` | `Ci sono stampanti disponibili?` |
| `"Are there printers available?"` | `id-ID` | `Apakah there printers available？` | `Apakah ada printer yang tersedia?` |
| `"Are there scanners available?"` | `id-ID` | `Apakah ada pemindaईที่ available？` (Devanagari + Thai) | `Apakah ada pemindai yang tersedia?` |

> **Note on Macedonian (`mk-MK`)**: Many Macedonian entries are a mix of Cyrillic and transliterated Latin. Macedonian is written exclusively in Cyrillic. Any entry with Latin characters mixed into Macedonian text (e.g. `da`, `gi`, `ima`) should be reviewed and corrected to pure Cyrillic.

#### 2c. Verify the `app.js` translations are also clean

Open `app.js` and do a quick scan. Its translations are generally better but a few entries use Chinese full-width punctuation (`。`) at the end of non-Chinese strings (e.g. Italian, Spanish). These should use standard Latin punctuation (`.`, `?`) — they will not cause functional errors but look wrong when displayed.

---

## 3. Remove Duplicate Constants from `App.jsx`

### The problem
`App.jsx` redefines every constant locally that already exists in `utils/constants.js`:
- `LANGUAGE_CODES`
- `STAFF_CATEGORY_ORDER`
- `CUSTOMER_CATEGORY_ORDER`
- `brandColors`
- `QR_PROMPT_TRANSLATIONS`
- `CLICK_FOR_OPTIONS_PROMPT_TRANSLATIONS`
- `centrelinkMapsEmbedUrl`
- `centrelinkMapsUrl`
- `qrCodeImageUrl`

Any edit to one copy is invisible to the other. The constants file exists but is being ignored.

### Steps

1. Open `babel-fish-app/src/App.jsx`.

2. Delete the following inline constant blocks from `App.jsx` (lines approximately 39–109):
   - `const LANGUAGE_CODES = {...}`
   - `const brandColors = {...}`
   - `const centrelinkMapsEmbedUrl = ...`
   - `const centrelinkMapsUrl = ...`
   - `const qrCodeImageUrl = ...`
   - `const QR_PROMPT_TRANSLATIONS = {...}`
   - `const CLICK_FOR_OPTIONS_PROMPT_TRANSLATIONS = {...}`
   - `const STAFF_CATEGORY_ORDER = [...]`
   - `const CUSTOMER_CATEGORY_ORDER = [...]`

3. Replace with a single import at the top of `App.jsx`:
   ```js
   import {
     LANGUAGE_CODES,
     STAFF_CATEGORY_ORDER,
     CUSTOMER_CATEGORY_ORDER,
     brandColors,
     QR_PROMPT_TRANSLATIONS,
     CLICK_FOR_OPTIONS_PROMPT_TRANSLATIONS,
   } from './utils/constants';
   ```
   Note: `centrelinkMapsEmbedUrl`, `centrelinkMapsUrl`, and `qrCodeImageUrl` should be **removed from constants entirely** rather than imported, because they need to be dynamic (see Step 7). For now, just delete them from both `App.jsx` and `constants.js`.

4. Also delete the duplicated `STAFF_SUBCATEGORY_DISPLAY_MAP` and `CUSTOMER_SUBCATEGORY_DISPLAY_MAP` objects defined inside the `MainApp` component function (around lines 581–593 of `App.jsx`) — these are never used anywhere.

5. Run the app to confirm nothing broke.

---

## 4. Decide on Firebase — Wire It Properly or Remove It

### The problem
Firebase is initialised in `App.jsx` and attempts to authenticate and fetch phrases from Firestore. But:
- The `__firebase_config` global variable is only injected by a specific hosting environment (e.g. Google's AI Studio canvas). Outside that environment it silently falls back to an empty object, causing all Firebase operations to fail with no visible error.
- Even when Firebase does initialise, phrases are seeded from the static `initialPhrases` array — meaning the app never actually relies on Firestore data in practice.
- A broken Firebase init causes a visible error state: `userId` shows `'Error: Check Firebase Config'`.

### Two options — choose one:

#### Option A: Remove Firebase entirely (recommended for now)
If phrases are static and there is no near-term requirement for live data or analytics, remove Firebase entirely and load phrases from the static file.

**Steps:**
1. Delete the Firebase imports from `App.jsx`:
   ```js
   // Delete these lines:
   import { initializeApp } from 'firebase/app';
   import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
   import { getFirestore, collection, onSnapshot, addDoc, query, getDocs } from 'firebase/firestore';
   ```

2. Delete the Firebase initialisation `useEffect` block (approximately lines 597–634 in `App.jsx`).

3. Delete the Firestore phrase-fetching `useEffect` block (approximately lines 636–680).

4. Remove the `db`, `auth`, `isAuthReady`, and `userId` state declarations.

5. Replace `const [phrases, setPhrases] = useState([])` with a direct import:
   ```js
   import { initialPhrases } from './utils/initialPhrases';
   ```
   Then wherever `phrases` is used in the JSX, replace it with `initialPhrases`.

6. Uninstall the Firebase packages to keep the bundle lean:
   ```bash
   cd babel-fish-app
   npm uninstall firebase
   ```

7. Delete `babel-fish-app/src/hooks/useFirebase.js` and `babel-fish-app/src/services/firebase.js` — they become dead code.

#### Option B: Keep Firebase but wire it correctly
If you intend to use Firestore to manage phrases or track analytics, Firebase needs proper configuration.

**Steps:**
1. Create a `.env` file in `babel-fish-app/` based on `env.example`. Add your Firebase project credentials:
   ```
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_APP_ID=...
   ```

2. Replace the `__firebase_config` global injection pattern in `App.jsx` with Vite environment variables:
   ```js
   // Replace:
   const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};

   // With:
   const firebaseConfig = {
     apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
     authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
     projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
     appId: import.meta.env.VITE_FIREBASE_APP_ID,
   };
   ```

3. Similarly replace `typeof __app_id !== 'undefined' ? __app_id : 'default-app-id'` with `import.meta.env.VITE_APP_ID`.

4. Add a guard so that if the config is missing, the app falls back to static phrases rather than showing an error:
   ```js
   const firebaseReady = !!(firebaseConfig.apiKey && firebaseConfig.projectId);
   ```
   Use this flag to decide whether to attempt Firebase init at all.

5. Remove `__initial_auth_token` references — this is another canvas-specific injection pattern that won't exist in a real deployment.

---

## 5. Fix TTS Voice Selection (Cantonese/Mandarin Collision)

### The problem
In `babel-fish-app/src/services/speech.js` at line 40:
```js
const voice = voices.find(v => v.lang.startsWith(langCode.split('-')[0]));
```
Both `zh-CN` (Mandarin) and `zh-HK` (Cantonese) split to `'zh'`. Chrome finds the first Chinese voice it has (typically a Mandarin voice) and uses it for both. **Cantonese text will be read aloud in Mandarin**, which is incomprehensible to a Cantonese speaker.

### Steps

1. Open `babel-fish-app/src/services/speech.js`.

2. Replace the voice-selection logic (lines 38–42) with a more precise match:
   ```js
   speakPhrase(text, langCode) {
     if (!this.synthesis) {
       console.warn('Speech synthesis not supported');
       return;
     }

     this.synthesis.cancel();

     const utterance = new SpeechSynthesisUtterance(text);
     utterance.lang = langCode;
     utterance.rate = 0.9;
     utterance.pitch = 1;
     utterance.volume = 1;

     const voices = this.synthesis.getVoices();

     // Try exact locale match first (e.g. zh-HK vs zh-CN)
     let voice = voices.find(v => v.lang === langCode);

     // Fall back to base language match only for non-Chinese languages,
     // because zh-CN and zh-HK are mutually incomprehensible dialects.
     if (!voice) {
       const baseLang = langCode.split('-')[0];
       const isChinese = baseLang === 'zh';
       if (!isChinese) {
         voice = voices.find(v => v.lang.startsWith(baseLang));
       }
     }

     if (voice) {
       utterance.voice = voice;
     }

     this.synthesis.speak(utterance);
   }
   ```

3. **Why this matters:** If no `zh-HK` voice is found, the app will speak Cantonese text using whatever default voice Chrome chooses — which will produce gibberish. This is a known Chrome limitation on platforms without a Cantonese system voice installed (see Step 12 for how to surface this to the user).

---

## 6. Fix `isSpeaking` State (Timer vs Real Event)

### The problem
In `babel-fish-app/src/hooks/useSpeech.js` at lines 16–18:
```js
setTimeout(() => {
  setIsSpeaking(false);
}, 1000);
```
The speaking state resets after 1 second regardless of how long the phrase actually takes. A long phrase will still be playing while `isSpeaking` is `false`, causing any UI that depends on this state (loading spinners, button disabled states) to be wrong.

### Steps

1. Open `babel-fish-app/src/services/speech.js`.

2. Modify `speakPhrase` to accept an `onEnd` callback:
   ```js
   speakPhrase(text, langCode, onEnd) {
     // ... existing setup code ...

     utterance.onend = () => {
       if (onEnd) onEnd();
     };

     utterance.onerror = (e) => {
       console.warn('Speech synthesis error:', e.error);
       if (onEnd) onEnd();
     };

     this.synthesis.speak(utterance);
   }
   ```

3. Open `babel-fish-app/src/hooks/useSpeech.js`.

4. Replace the `speakPhrase` callback with one that uses `onEnd`:
   ```js
   const speakPhrase = useCallback((text, langCode) => {
     try {
       setIsSpeaking(true);
       setError(null);
       speechService.speakPhrase(text, langCode, () => {
         setIsSpeaking(false);
       });
     } catch (err) {
       setError(err.message);
       setIsSpeaking(false);
     }
   }, []);
   ```
   Remove the `setTimeout` entirely.

---

## 7. Fix the Maps and QR Code URLs

### The problem
The Google Maps URLs in `constants.js` are hardcoded to `language=zh-CN` and `hl=zh-CN`. They never update regardless of which language is selected. Additionally, the Maps Embed API URL has an empty `key=` parameter which will cause the iframe to fail in production.

### Steps

#### 7a. Remove the hardcoded URL constants

1. Open `babel-fish-app/src/utils/constants.js`.

2. Delete the three constants that hardcode a language:
   ```js
   // Delete all three of these:
   export const centrelinkMapsEmbedUrl = "...language=zh-CN";
   export const centrelinkMapsUrl = "...hl=zh-CN";
   export const qrCodeImageUrl = `...`;
   ```

3. Replace them with **generator functions** that accept a language code:
   ```js
   export const CENTRELINK_ORIGIN = 'Hurstville+Library,+12-16+MacMahon+St,+Hurstville+NSW+2220,+Australia';
   export const CENTRELINK_DESTINATION = 'Centrelink+Hurstville,+125+Forest+Rd,+Hurstville+NSW+2220,+Australia';

   export function getMapsEmbedUrl(langCode, apiKey = '') {
     return `https://www.google.com/maps/embed/v1/directions?key=${apiKey}&origin=${CENTRELINK_ORIGIN}&destination=${CENTRELINK_DESTINATION}&mode=driving&language=${langCode}`;
   }

   export function getMapsDirectionsUrl(langCode) {
     return `https://www.google.com/maps/dir/?api=1&origin=12-16%20MacMahon%20St,%20Hurstville%20NSW%202220,%20Australia&destination=125%20Forest%20Rd,%20Hurstville%20NSW%202220,%20Australia&travelmode=driving&hl=${langCode}`;
   }

   export function getQrCodeUrl(langCode) {
     const mapsUrl = getMapsDirectionsUrl(langCode);
     return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(mapsUrl)}`;
   }
   ```

#### 7b. Update the QR popup in `App.jsx` to use the generators

1. Find the QR popup rendering code in `App.jsx`. It will reference the old hardcoded constants.

2. Replace static references like:
   ```js
   src={qrCodeImageUrl}
   src={centrelinkMapsEmbedUrl}
   ```
   With dynamic calls that pass the current language code:
   ```js
   // Determine the active language code based on current mode
   const activeLangCode = LANGUAGE_CODES[currentMode === 'staff' ? staffLanguage : customerLanguage]?.code || 'en-US';

   // Then in JSX:
   <img src={getQrCodeUrl(activeLangCode)} ... />
   <iframe src={getMapsEmbedUrl(activeLangCode, import.meta.env.VITE_MAPS_API_KEY)} ... />
   ```

#### 7c. Add a Maps API key environment variable

1. Add to `babel-fish-app/.env`:
   ```
   VITE_MAPS_API_KEY=your_google_maps_embed_api_key_here
   ```

2. In Google Cloud Console, enable the **Maps Embed API** for your project and generate a key restricted to your deployment domain.

3. Without a key, the embedded map will return an error in production. As a temporary measure while awaiting a key, you can hide the map iframe and show only the QR code + a plain text address.

---

## 8. Fix the Translation Key Inconsistency

### The problem
Two translation lookup objects use different key formats:
- `QR_PROMPT_TRANSLATIONS` uses BCP-47 codes as keys (`'zh-CN'`, `'el-GR'`, etc.)
- `CLICK_FOR_OPTIONS_PROMPT_TRANSLATIONS` uses English display names as keys (`'Mandarin'`, `'Greek'`, etc.)

Whichever pattern is used in the rest of the code, the other one will silently return `undefined`.

### Steps

1. Open `babel-fish-app/src/utils/constants.js`.

2. **Pick one key format** and apply it consistently. The correct format is **BCP-47 codes**, because that's what `LANGUAGE_CODES` produces when you do `LANGUAGE_CODES[lang].code`.

3. Rekey `CLICK_FOR_OPTIONS_PROMPT_TRANSLATIONS` to use BCP-47 codes:
   ```js
   export const CLICK_FOR_OPTIONS_PROMPT_TRANSLATIONS = {
     'zh-CN': '点击获取选项',
     'zh-HK': '點擊獲取選項',
     'ne-NP': 'विकल्पहरूको लागि क्लिक गर्नुहोस्',
     'el-GR': 'Κάντε κλικ για επιλογές',
     'ar-SA': 'انقر للاختيارات',
     'mk-MK': 'Кликнете за опции',
     'es-ES': 'Haz clic para opciones',
     'it-IT': 'Clicca per le opzioni',
     'id-ID': 'Klik untuk opsi',
     'en-US': 'Click for options',
   };
   ```
   Note the Nepali entry was also corrupted (`विक विकल्पहरूको लागि क्लिक गर्नुहोस्` — leading `विक` is a fragment). Use `विकल्पहरूको लागि क्लिक गर्नुहोस्`.
   The Macedonian entry was `'Кликnete za opcii'` (mixed Cyrillic/Latin). Use `'Кликнете за опции'`.

4. Find every place in `App.jsx` that looks up `CLICK_FOR_OPTIONS_PROMPT_TRANSLATIONS`. Change the lookup key from the display name to the BCP-47 code:
   ```js
   // Before:
   CLICK_FOR_OPTIONS_PROMPT_TRANSLATIONS[staffLanguage]

   // After:
   CLICK_FOR_OPTIONS_PROMPT_TRANSLATIONS[LANGUAGE_CODES[staffLanguage]?.code]
   ```

---

## 9. Fix the QR Prompt Typo

### The problem
In `utils/constants.js` (and its duplicate in `App.jsx`):
```js
'es-ES': 'Haz clic en mí para un map',
```
"map" is English. The Spanish word is "mapa".

### Steps

1. Open `babel-fish-app/src/utils/constants.js`.

2. In `QR_PROMPT_TRANSLATIONS`, change:
   ```js
   'es-ES': 'Haz clic en mí para un map',
   ```
   to:
   ```js
   'es-ES': 'Haz clic en mí para un mapa',
   ```

---

## 10. Remove Placeholder and Dead Code

### The problem
Several functions in `app.js` (the vanilla version) were never implemented, and equivalent stubs may have been carried into the React app.

### Steps

#### 10a. In `app.js` (vanilla — for archival hygiene)

1. **`checkUserStatus()`** (lines 152–160): This sets a hardcoded user ID of `'GR12345'` after a 1-second delay. It simulates a login but does nothing real. Delete the function and its call in `DOMContentLoaded`.

2. **`hideLanguageChoicePopup()`** (lines 168–171): Stub function with only a `console.log`. There is no corresponding popup in the HTML. Delete it.

3. **`setCurrentMode(mode)`** (lines 162–164): Wrapper that just calls `setMode(mode)`. Delete it and find any callers in the HTML (e.g. `onclick="setCurrentMode('staff')"`) and change them to call `setMode('staff')` directly.

#### 10b. In `App.jsx` (React app)

1. Search for `staffQuery`, `suggestedPhrases`, and `isSuggesting` state. If these belong to an LLM phrase-suggestion feature that is not yet implemented, remove the state declarations and any JSX that references them to avoid dead state cluttering the component.

2. Search for any `console.log` statements that were used for debugging (e.g. `console.log('Hiding language choice popup...')`). Remove them.

3. The `STAFF_SUBCATEGORY_DISPLAY_MAP` and `CUSTOMER_SUBCATEGORY_DISPLAY_MAP` objects defined inside `MainApp` (around lines 581–593) are never used anywhere in the visible code. Delete them.

---

## 11. Fix the Double Render on Mode Switch

### The problem
In the vanilla `app.js`, the `setMode()` function has an ordering bug:
```js
function setMode(mode) {
  currentMode = mode;
  // ...
  populateCategoryFilter();  // ← renders with OLD filter state

  // Reset category filter to 'All'
  if (currentMode === 'staff') {
    staffSubcategoryFilter = 'All';  // ← state changes AFTER render
  } else {
    customerSubcategoryFilter = 'All';
  }

  updatePhrases();  // ← finally renders with correct state
}
```
The filter renders once with stale state, then corrects itself. Users may see a flash of the wrong active category button.

This may also be present in the equivalent React code depending on how mode switching is implemented.

### Steps

#### For the vanilla `app.js`:

1. Move the filter reset **before** the `populateCategoryFilter()` call:
   ```js
   function setMode(mode) {
     currentMode = mode;

     // Reset filter first, then render
     if (currentMode === 'staff') {
       staffSubcategoryFilter = 'All';
     } else {
       customerSubcategoryFilter = 'All';
     }

     // Update UI
     const staffBtn = document.getElementById('staffModeBtn');
     // ... rest of button/section toggling ...

     populateCategoryFilter();
     updatePhrases();
   }
   ```

#### For the React app:

1. In `App.jsx`, find the mode-switching handler (the function called when the Staff/Customer toggle is clicked).

2. Ensure the category filter state resets in the same state update as the mode change, not in a subsequent `useEffect`. In React this can be done atomically:
   ```js
   function handleModeChange(newMode) {
     setCurrentMode(newMode);
     // Reset both filters on mode switch so the render is consistent
     setStaffSubcategoryFilter('All');
     setCustomerSubcategoryFilter('All');
   }
   ```
   React batches state updates in event handlers, so these three `setState` calls will produce only one re-render.

---

## 12. Acknowledge Unsupported TTS Languages

### The languages with no TTS support in Chrome

| Language | Code | Status |
|---|---|---|
| Nepali | `ne-NP` | No TTS voice available on any major OS |
| Macedonian | `mk-MK` | No TTS voice available on any major OS |

When a user taps the speaker button for one of these languages, `speechSynthesis.speak()` will fire but produce silence (no matching voice found) or fall back to reading the text in the wrong language entirely. There is no error thrown — it just does nothing useful.

### Steps

1. In `babel-fish-app/src/services/speech.js`, add a voice-availability check that runs once on initialisation:
   ```js
   getSupportedLanguageCodes() {
     const voices = this.synthesis ? this.synthesis.getVoices() : [];
     return new Set(voices.map(v => v.lang));
   }

   isLanguageSupported(langCode) {
     const available = this.getSupportedLanguageCodes();
     // Check exact match or base-language match (but never for Chinese dialects — see Step 5)
     const baseLang = langCode.split('-')[0];
     const isChinese = baseLang === 'zh';
     if (isChinese) {
       return available.has(langCode);
     }
     return available.has(langCode) || [...available].some(l => l.startsWith(baseLang));
   }
   ```

2. In the component that renders the speaker button (likely `PhraseCard.jsx`), use this check to show a visual indicator when audio is unavailable:
   ```jsx
   const audioAvailable = speechService.isLanguageSupported(langCode);

   <button
     onClick={() => audioAvailable && speakPhrase(text, langCode)}
     title={audioAvailable ? 'Play audio' : 'Audio not available for this language'}
     className={audioAvailable ? 'speaker-button' : 'speaker-button speaker-button-unavailable'}
   >
     {/* speaker icon */}
   </button>
   ```

3. Add a CSS class `speaker-button-unavailable` that greys out or adds an indicator (e.g. a small slash through the icon) so staff can see at a glance that audio won't play.

4. **Do not remove Nepali or Macedonian from the app** — the text translations are still valuable even without audio. The fix is purely about communicating the limitation clearly rather than silently failing.

> **Note for Version 2:** Replacing the native `SpeechSynthesis` API with a cloud TTS service (Google Cloud TTS, Azure Cognitive Services, or ElevenLabs) would give reliable, high-quality audio for all supported languages including Nepali and Macedonian. This is the recommended path for Version 2.

---

## 13. Split `App.jsx` into Smaller Components

### The problem
`App.jsx` is approximately 1,548 lines. It contains:
- All phrase data (now moved in Step 2)
- All constants (now moved in Step 3)
- Firebase initialisation (now removed or moved in Step 4)
- The QR code popup
- The language choice popup
- The language selector UI
- The category filter UI
- The phrase card grid
- The mode toggle
- Staff query/LLM suggestion state
- Security utilities

This makes it very hard to read, test, or modify individual features without risk of breaking something unrelated.

### Steps

The component infrastructure already exists in `babel-fish-app/src/components/`. The task is to move logic into the right places.

1. **`QrPopup` component**: Extract the QR popup JSX and its open/close state into its own component. It needs: current language code as a prop, open/close state managed by the parent. Create `babel-fish-app/src/components/QrPopup.jsx`.

2. **`LanguageChoicePopup` component**: The Mandarin/Cantonese "I speak..." popup is already referenced in the app. Confirm it is rendered in the right place and extract it to its own component if it isn't already. It needs: `staffLanguage` prop, `onClose` callback, and the `speakPhrase` function.

3. **`PhraseGrid` component**: The section of `App.jsx` that maps over filtered phrases and renders category headings + phrase cards should become its own component. It takes: filtered phrases, current language code, and the `speakPhrase` function as props.

4. **Move mode/filter state into a custom hook**: Consider extracting `currentMode`, `staffLanguage`, `customerLanguage`, `staffSubcategoryFilter`, `customerSubcategoryFilter`, and all their setters into a custom hook (`useAppState.js`). `App.jsx` becomes thin — it imports the hook, passes state to components, and renders a layout.

5. **`App.jsx` target structure** after refactor:
   ```jsx
   function MainApp() {
     const appState = useAppState();
     const { speakPhrase, isSpeaking } = useSpeech();

     return (
       <div>
         <Header />
         <ModeToggle mode={appState.currentMode} onChange={appState.setMode} />
         <LanguageSelector ... />
         <CategoryFilter ... />
         <PhraseGrid ... />
         <QrPopup ... />
         <LanguageChoicePopup ... />
         <FeedbackButton ... />
         <FeedbackModal ... />
       </div>
     );
   }
   ```

---

## Summary Checklist

- [ ] **Step 1**: React app confirmed as the single codebase; vanilla files archived
- [ ] **Step 2a**: Phrase data loaded only from `initialPhrases.js`; duplicate in `App.jsx` removed
- [ ] **Step 2b**: All corrupted translations corrected (see table)
- [ ] **Step 2c**: Chinese full-width punctuation removed from non-Chinese strings
- [ ] **Step 3**: Duplicate constants removed from `App.jsx`; imported from `constants.js`
- [ ] **Step 4**: Firebase either properly configured with env vars, or removed entirely
- [ ] **Step 5**: TTS voice selection uses exact locale match; no zh-CN/zh-HK collision
- [ ] **Step 6**: `isSpeaking` state uses `utterance.onend`, not a 1-second timer
- [ ] **Step 7**: Maps/QR URLs are dynamic functions; Google Maps API key in env var
- [ ] **Step 8**: `CLICK_FOR_OPTIONS_PROMPT_TRANSLATIONS` uses BCP-47 codes; lookups updated
- [ ] **Step 9**: Spanish QR prompt typo fixed (`un map` → `un mapa`)
- [ ] **Step 10**: Placeholder functions and dead state removed
- [ ] **Step 11**: Mode switch resets filter state before re-rendering
- [ ] **Step 12**: Unsupported TTS languages (Nepali, Macedonian) show a visual indicator
- [ ] **Step 13**: `App.jsx` split into smaller focused components
