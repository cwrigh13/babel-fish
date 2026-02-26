// Google Translate API Integration for Babel Fish App
// This file demonstrates how to integrate Google Translate API to replace the Gemini API

// Configuration
const GOOGLE_TRANSLATE_API_KEY = process.env.REACT_APP_GOOGLE_TRANSLATE_API_KEY || '';
const GOOGLE_TRANSLATE_API_URL = 'https://translation.googleapis.com/language/translate/v2';

// Language codes mapping (from the existing app)
const LANGUAGE_CODES = {
  'Mandarin': { code: 'zh-CN', nativeName: '普通话' },
  'Cantonese': { code: 'zh-HK', nativeName: '粤语' },
  'Nepali': { code: 'ne-NP', nativeName: 'नेपाली' },
  'Greek': { code: 'el-GR', nativeName: 'Ελληνικά' },
  'Arabic': { code: 'ar-SA', nativeName: 'العربية' },
  'Macedonian': { code: 'mk-MK', nativeName: 'Македонски' },
  'Spanish': { code: 'es-ES', nativeName: 'Español' },
  'Italian': { code: 'it-IT', nativeName: 'Italiano' },
  'Indonesian': { code: 'id-ID', nativeName: 'Bahasa Indonesia' },
  'English': { code: 'en-US', nativeName: 'English' },
};

// Common library phrases for translation
const COMMON_LIBRARY_PHRASES = [
  "How can I help you?",
  "Do you need assistance?",
  "Let me show you how to use this.",
  "Would you like me to explain this?",
  "Is there anything else you need?",
  "Please wait a moment.",
  "I'll be right back.",
  "Can I help you find something?",
  "Do you have any questions?",
  "Let me check that for you.",
  "Would you like to borrow this item?",
  "Do you have a library card?",
  "Can I help you with the computer?",
  "Would you like to use the printer?",
  "Do you need help finding a book?",
  "Is there anything specific you're looking for?",
  "Let me help you with that.",
  "Would you like me to demonstrate this?",
  "Do you need help with your account?",
  "Can I assist you with anything else?"
];

/**
 * Translate text using Google Translate API
 * @param {string} text - Text to translate
 * @param {string} targetLanguage - Target language code (e.g., 'zh-CN')
 * @param {string} sourceLanguage - Source language code (default: 'en')
 * @returns {Promise<string>} - Translated text
 */
async function translateText(text, targetLanguage, sourceLanguage = 'en') {
  // Security: Validate inputs
  if (!text || typeof text !== 'string') {
    throw new Error('Invalid text input');
  }
  
  if (!targetLanguage || typeof targetLanguage !== 'string') {
    throw new Error('Invalid target language');
  }
  
  // Security: Sanitize inputs
  const sanitizedText = text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                           .replace(/javascript:/gi, '')
                           .replace(/on\w+\s*=/gi, '')
                           .trim();
  
  if (sanitizedText.length === 0) {
    throw new Error('Text cannot be empty after sanitization');
  }
  
  if (sanitizedText.length > 5000) {
    throw new Error('Text too long for translation');
  }
  
  try {
    const response = await fetch(`${GOOGLE_TRANSLATE_API_URL}?key=${GOOGLE_TRANSLATE_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: sanitizedText,
        target: targetLanguage,
        source: sourceLanguage
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.data && result.data.translations && result.data.translations.length > 0) {
      return result.data.translations[0].translatedText;
    } else {
      throw new Error('No translation data received');
    }
  } catch (error) {
    console.error('Translation error:', error);
    throw error;
  }
}

/**
 * Get relevant phrases based on user query
 * @param {string} userQuery - User's input query
 * @returns {string[]} - Array of relevant phrases
 */
function getRelevantPhrases(userQuery) {
  const query = userQuery.toLowerCase();
  
  // Filter phrases that might be relevant to the user's query
  const relevantPhrases = COMMON_LIBRARY_PHRASES.filter(phrase => {
    const phraseLower = phrase.toLowerCase();
    return phraseLower.includes(query) ||
           query.includes(phraseLower) ||
           phraseLower.includes('help') ||
           phraseLower.includes('assist') ||
           phraseLower.includes('need') ||
           phraseLower.includes('want');
  });

  // If no direct matches, return some general helpful phrases
  return relevantPhrases.length > 0 ? relevantPhrases.slice(0, 3) : COMMON_LIBRARY_PHRASES.slice(0, 3);
}

/**
 * Fetch suggested phrases using Google Translate API
 * @param {string} userQuery - User's input query
 * @param {string} targetLanguage - Target language (e.g., 'Mandarin', 'Cantonese')
 * @returns {Promise<Array>} - Array of translated phrases
 */
async function fetchSuggestedPhrases(userQuery, targetLanguage) {
  if (!userQuery.trim()) {
    return [];
  }

  try {
    // Get relevant phrases based on user query
    const phrasesToTranslate = getRelevantPhrases(userQuery);
    
    // Get target language code
    const targetLangCode = LANGUAGE_CODES[targetLanguage]?.code || 'zh-CN';
    
    const translatedPhrases = [];

    // Translate each phrase
    for (const phrase of phrasesToTranslate) {
      try {
        const translatedText = await translateText(phrase, targetLangCode);
        translatedPhrases.push({
          english: phrase,
          translated: translatedText,
          language: targetLanguage
        });
      } catch (error) {
        console.error(`Error translating phrase "${phrase}":`, error);
        // Add fallback for failed translations
        translatedPhrases.push({
          english: phrase,
          translated: `[Translation for: ${phrase}]`,
          language: targetLanguage
        });
      }
    }

    return translatedPhrases;
  } catch (error) {
    console.error('Error fetching suggested phrases:', error);
    return [{
      english: "Error fetching suggestions.",
      translated: "获取建议时出错。",
      language: targetLanguage
    }];
  }
}

/**
 * Alternative implementation using a free translation service
 * This can be used for development or as a fallback
 */
async function translateWithFreeService(text, targetLanguage) {
  try {
    // Example using a free translation API
    // Note: You would need to find a suitable free translation service
    const response = await fetch('https://api.freetranslation.com/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: text,
        target: targetLanguage
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      return result.translatedText;
    }
  } catch (error) {
    console.error('Free translation service error:', error);
  }
  
  return `[Translation for: ${text}]`;
}

/**
 * Cached translation function to reduce API calls
 */
const translationCache = new Map();

async function translateWithCache(text, targetLanguage) {
  const cacheKey = `${text}_${targetLanguage}`;
  
  // Check cache first
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey);
  }
  
  try {
    const translatedText = await translateText(text, targetLanguage);
    
    // Cache the result
    translationCache.set(cacheKey, translatedText);
    
    return translatedText;
  } catch (error) {
    console.error('Translation with cache error:', error);
    return `[Translation for: ${text}]`;
  }
}

/**
 * React hook for managing translation state
 * This can be used in a React component
 */
function useTranslationSuggestions() {
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSuggestions = async (userQuery, targetLanguage) => {
    if (!userQuery.trim()) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const results = await fetchSuggestedPhrases(userQuery, targetLanguage);
      setSuggestions(results);
    } catch (error) {
      setError(error.message);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    suggestions,
    isLoading,
    error,
    fetchSuggestions
  };
}

/**
 * Example React component showing how to integrate the translation API
 */
function TranslationSuggestionsComponent() {
  const [userQuery, setUserQuery] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('Mandarin');
  const { suggestions, isLoading, error, fetchSuggestions } = useTranslationSuggestions();

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchSuggestions(userQuery, targetLanguage);
  };

  return (
    <div className="translation-suggestions">
      <h3>Suggested Phrases</h3>
      
      <form onSubmit={handleSubmit}>
        <textarea
          value={userQuery}
          onChange={(e) => setUserQuery(e.target.value)}
          placeholder="Type a scenario (e.g., 'customer wants to borrow a book')"
          rows="3"
        />
        
        <select
          value={targetLanguage}
          onChange={(e) => setTargetLanguage(e.target.value)}
        >
          {Object.keys(LANGUAGE_CODES).map(lang => (
            <option key={lang} value={lang}>
              {LANGUAGE_CODES[lang].nativeName} ({lang})
            </option>
          ))}
        </select>
        
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Translating...' : 'Get Suggestions'}
        </button>
      </form>

      {error && (
        <div className="error">
          Error: {error}
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="suggestions">
          <h4>Suggestions:</h4>
          <ul>
            {suggestions.map((suggestion, index) => (
              <li key={index}>
                <div className="phrase">
                  <p className="english">{suggestion.english}</p>
                  <p className="translated">{suggestion.translated}</p>
                </div>
                <button onClick={() => speakPhrase(suggestion.translated, LANGUAGE_CODES[suggestion.language].code)}>
                  🔊
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// Export functions for use in other modules
export {
  translateText,
  fetchSuggestedPhrases,
  translateWithCache,
  useTranslationSuggestions,
  TranslationSuggestionsComponent,
  LANGUAGE_CODES,
  COMMON_LIBRARY_PHRASES
};

// Example usage:
// import { fetchSuggestedPhrases } from './google-translate-integration.js';
// 
// const suggestions = await fetchSuggestedPhrases(
//   "customer needs help with computer", 
//   "Mandarin"
// );
// console.log(suggestions); 