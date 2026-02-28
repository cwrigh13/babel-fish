/**
 * Voice status for Babel Fish languages.
 * Compares speechSynthesis.getVoices() to LANGUAGE_CODES to determine installed vs missing.
 * Browsers cannot install voices from the page; we open OS settings so the user can add them.
 */

/**
 * Normalize a BCP 47 language code for comparison (e.g. "el-GR" -> "el-gr").
 * @param {string} code
 * @returns {string}
 */
const normalizeLangCode = (code) => (code || '').toLowerCase().replace('_', '-');

/**
 * Check if a voice matches a language code (exact or prefix, e.g. el-GR or el).
 * @param {{ lang: string }} voice
 * @param {string} targetLang
 * @param {string} targetPrefix
 * @returns {boolean}
 */
const voiceMatchesLang = (voice, targetLang, targetPrefix) => {
    const vLang = normalizeLangCode(voice.lang);
    return vLang === targetLang || vLang.startsWith(targetPrefix + '-') || vLang === targetPrefix;
};

/**
 * Get install info for the current platform (links/instructions to add voices).
 * Web apps cannot install TTS voices; we open system settings or show steps.
 * @returns {{ openSettingsUrl: string | null, label: string, instructions: string }}
 */
export const getVoiceInstallInfo = () => {
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    const isWin = /Windows|Win32|Win64/i.test(ua);
    const isMac = /Macintosh|Mac OS X/i.test(ua);

    if (isWin) {
        return {
            openSettingsUrl: 'ms-settings:speech',
            label: 'Open speech settings',
            instructions: 'In Settings, go to Time & language → Speech. Use "Manage voices" or "Add voices" to download more languages. After adding a language, refresh this page.'
        };
    }
    if (isMac) {
        return {
            openSettingsUrl: null,
            label: 'Open speech settings',
            instructions: 'Open System Settings → Accessibility → Spoken Content → System Voice → Manage Voices. Download the voices you need, then refresh this page.'
        };
    }
    return {
        openSettingsUrl: null,
        label: 'Install voices',
        instructions: 'Use your system or browser settings to add text-to-speech voices for the languages above (e.g. Settings → Accessibility or Language). Then refresh this page.'
    };
};

/**
 * Compute which Babel Fish languages have a voice installed and which are missing.
 * @param {Record<string, { code: string, nativeName?: string }>} languageCodes - e.g. LANGUAGE_CODES
 * @param {SpeechSynthesisVoice[]} voices - from speechSynthesis.getVoices()
 * @returns {{ installed: Array<{ name: string, code: string, nativeName: string }>, missing: Array<{ name: string, code: string, nativeName: string }> }}
 */
export const getVoiceStatus = (languageCodes, voices = []) => {
    const installed = [];
    const missing = [];

    for (const [name, data] of Object.entries(languageCodes)) {
        const code = data?.code || '';
        const nativeName = data?.nativeName || name;
        const targetLang = normalizeLangCode(code);
        const targetPrefix = targetLang.split('-')[0];

        const hasVoice = voices.some((v) => voiceMatchesLang(v, targetLang, targetPrefix));

        if (hasVoice) {
            installed.push({ name, code, nativeName });
        } else {
            missing.push({ name, code, nativeName });
        }
    }

    return { installed, missing };
};
