# Google Translate API Integration Guide for Babel Fish App

## Overview

This guide explains how to integrate Google Translate API into the Babel Fish app to replace the current Gemini API implementation in the "Suggest Phrases" section.

## Current Implementation

The app currently uses Google's Gemini API to generate phrase suggestions based on user input scenarios. The implementation is located in the `fetchSuggestedPhrases` function in `gemini-version.html`.

## Google Translate API Integration

### 1. Setup Google Translate API

1. **Enable Google Translate API:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the "Cloud Translation API" service
   - Create API credentials (API key)

2. **Get API Key:**
   - In Google Cloud Console, go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy the API key for use in the application

### 2. Implementation Steps

#### Step 1: Update the fetchSuggestedPhrases Function

Replace the current Gemini API implementation with Google Translate API:

```javascript
// Function to call Google Translate API for phrase suggestions
const fetchSuggestedPhrases = async () => {
  if (!staffQuery.trim()) return;

  setIsSuggesting(true);
  setSuggestedPhrases([]);

  try {
    // Common library phrases that might be relevant to the scenario
    const commonPhrases = [
      "How can I help you?",
      "Do you need assistance?",
      "Let me show you how to use this.",
      "Would you like me to explain this?",
      "Is there anything else you need?",
      "Please wait a moment.",
      "I'll be right back.",
      "Can I help you find something?",
      "Do you have any questions?",
      "Let me check that for you."
    ];

    // Filter phrases that might be relevant to the user's query
    const relevantPhrases = commonPhrases.filter(phrase => 
      phrase.toLowerCase().includes(staffQuery.toLowerCase()) ||
      staffQuery.toLowerCase().includes(phrase.toLowerCase()) ||
      phrase.toLowerCase().includes('help') ||
      phrase.toLowerCase().includes('assist')
    );

    // If no direct matches, use some general helpful phrases
    const phrasesToTranslate = relevantPhrases.length > 0 ? relevantPhrases.slice(0, 3) : commonPhrases.slice(0, 3);

    const translatedPhrases = [];

    for (const phrase of phrasesToTranslate) {
      try {
        // Google Translate API call
        const targetLanguage = LANGUAGE_CODES[staffLanguage]?.code || 'zh-CN';
        const apiKey = "YOUR_GOOGLE_TRANSLATE_API_KEY"; // Replace with your actual API key
        
        const translateUrl = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;
        
        const response = await fetch(translateUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            q: phrase,
            target: targetLanguage,
            source: 'en'
          })
        });

        if (response.ok) {
          const result = await response.json();
          if (result.data && result.data.translations && result.data.translations.length > 0) {
            translatedPhrases.push({
              english: phrase,
              translated: result.data.translations[0].translatedText
            });
          } else {
            // Fallback if API call fails or returns unexpected format
            translatedPhrases.push({
              english: phrase,
              translated: `[Translation for: ${phrase}]`
            });
          }
        } else {
          // Fallback for API errors
          translatedPhrases.push({
            english: phrase,
            translated: `[Translation for: ${phrase}]`
          });
        }
      } catch (error) {
        console.error(`Error translating phrase "${phrase}":`, error);
        // Fallback for individual phrase translation errors
        translatedPhrases.push({
          english: phrase,
          translated: `[Translation for: ${phrase}]`
        });
      }
    }

    setSuggestedPhrases(translatedPhrases);
  } catch (error) {
    console.error("Error fetching suggested phrases from Google Translate API:", error);
    setSuggestedPhrases([{ english: "Error fetching suggestions.", translated: "" }]);
  } finally {
    setIsSuggesting(false);
  }
};
```

#### Step 2: Update the UI to Display Translated Phrases

Update the suggested phrases display section:

```javascript
{suggestedPhrases.length > 0 && (
  <div className="mt-4 border-t pt-4">
    <h4 className="text-md font-semibold text-gray-700 mb-2">Suggestions:</h4>
    <ul className="space-y-3">
      {suggestedPhrases.map((phrase, index) => (
        <li key={index} className="bg-white p-3 rounded-md shadow-sm flex items-center justify-between">
          <div className="flex-1 text-left">
            <p className="text-base font-medium text-gray-800 mb-0.5">{phrase.english}</p>
            <p className="text-lg font-semibold" style={{ color: brandColors.teal700 }}>
              {phrase.translated}
            </p>
          </div>
          <button
            onClick={() => speakPhrase(phrase.translated, LANGUAGE_CODES[staffLanguage].code)}
            className="flex-shrink-0 p-2 rounded-full bg-teal-500 text-white hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-opacity-75"
            title="Play audio"
          >
            {speakerIcon}
          </button>
        </li>
      ))}
    </ul>
  </div>
)}
```

### 3. Environment Configuration

#### Option A: Environment Variables (Recommended for Production)

Create a `.env` file in your project root:

```env
REACT_APP_GOOGLE_TRANSLATE_API_KEY=your_api_key_here
```

Then update the API key reference:

```javascript
const apiKey = process.env.REACT_APP_GOOGLE_TRANSLATE_API_KEY;
```

#### Option B: Direct Configuration (For Development)

Replace the API key directly in the code:

```javascript
const apiKey = "your_actual_api_key_here";
```

### 4. Security Considerations

1. **API Key Security:**
   - Never commit API keys to version control
   - Use environment variables for production
   - Restrict API key usage to specific domains/IPs in Google Cloud Console

2. **Rate Limiting:**
   - Google Translate API has quotas and rate limits
   - Implement error handling for rate limit exceeded errors
   - Consider caching translations to reduce API calls

3. **Error Handling:**
   - Always implement fallback mechanisms
   - Handle network errors gracefully
   - Provide user-friendly error messages

### 5. Alternative Implementation (Free Tier)

If you want to avoid API costs during development, you can use a free translation service:

```javascript
// Alternative: Using a free translation service
const translateWithFreeService = async (text, targetLang) => {
  try {
    // Example using a free translation API (you'd need to find a suitable one)
    const response = await fetch(`https://api.freetranslation.com/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: text,
        target: targetLang
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      return result.translatedText;
    }
  } catch (error) {
    console.error('Translation error:', error);
  }
  
  return `[Translation for: ${text}]`;
};
```

### 6. Testing the Integration

1. **Test with Different Languages:**
   - Switch between different staff languages
   - Verify translations are accurate
   - Test error handling with invalid API keys

2. **Test Error Scenarios:**
   - Network connectivity issues
   - Invalid API responses
   - Rate limiting scenarios

3. **Performance Testing:**
   - Measure response times
   - Test with multiple simultaneous requests
   - Verify UI responsiveness during translation

### 7. Deployment Considerations

1. **Environment Setup:**
   - Configure environment variables in your hosting platform
   - Set up proper CORS headers if needed
   - Configure API key restrictions for production domains

2. **Monitoring:**
   - Set up logging for API calls
   - Monitor API usage and costs
   - Implement alerts for API errors

## Benefits of Google Translate API Integration

1. **Accurate Translations:** Google Translate provides high-quality translations
2. **Multiple Languages:** Support for 100+ languages
3. **Reliability:** Google's infrastructure ensures high availability
4. **Cost-Effective:** Pay-per-use pricing model
5. **Easy Integration:** Simple REST API with good documentation

## Migration Checklist

- [ ] Set up Google Cloud project and enable Translation API
- [ ] Create and secure API key
- [ ] Update `fetchSuggestedPhrases` function
- [ ] Update UI to display translated phrases
- [ ] Test with different languages and scenarios
- [ ] Implement proper error handling
- [ ] Set up environment variables for production
- [ ] Deploy and monitor the integration

## Troubleshooting

### Common Issues:

1. **CORS Errors:** Ensure your API key has proper domain restrictions
2. **Rate Limiting:** Implement exponential backoff for retries
3. **Invalid API Key:** Double-check the API key and project setup
4. **Network Errors:** Implement proper error handling and fallbacks

### Debug Tips:

1. Check browser console for error messages
2. Verify API key permissions in Google Cloud Console
3. Test API calls using tools like Postman
4. Monitor network tab in browser dev tools

## Files Created for Reference

1. **`google-translate-integration.js`** - Standalone JavaScript module with all functions
2. **`test-translate-integration.html`** - Test file to verify the integration
3. **`README.md`** - Updated with integration instructions

## Example Usage

```javascript
// Import the translation functions
import { fetchSuggestedPhrases } from './google-translate-integration.js';

// Use in your React component
const handleGetSuggestions = async () => {
  const suggestions = await fetchSuggestedPhrases(
    "customer needs help with computer", 
    "Mandarin"
  );
  setSuggestedPhrases(suggestions);
};
```

This integration will provide more accurate and reliable translations compared to the current Gemini API implementation, while maintaining the same user experience. 