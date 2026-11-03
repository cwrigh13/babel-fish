import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import {
  validateUserQuery,
  validateLanguage,
  RateLimiter,
  enforceHTTPS,
  validateAPIResponse,
  sanitizeAPIPayload
} from './utils/security';
import FeedbackButton from './components/FeedbackButton';
import FeedbackModal from './components/FeedbackModal';
import LiveTestScenarios from './components/LiveTestScenarios';
import { submitFeedback } from './services/feedback';
import { initialPhrases } from './utils/initialPhrases';


// Define a custom order for staff categories
const STAFF_CATEGORY_ORDER = [
  'General Enquiries',
  'Transactional',
  'Digital Services',
];

// Define a custom order for customer categories
const CUSTOMER_CATEGORY_ORDER = [
  'General Assistance',
  'Transactional',
  'Library Layout',
  'Language & Community Resources',
  'Digital Services',
];

// Sort published phrases by custom category order, then by English phrase for consistent display.
// Unpublished phrases stay in initialPhrases but are never rendered.
const PHRASES = initialPhrases.filter(phrase => phrase.published === true).sort((a, b) => {
  if (a.type === 'staff' && b.type === 'staff') {
    const aIndex = STAFF_CATEGORY_ORDER.indexOf(a.category);
    const bIndex = STAFF_CATEGORY_ORDER.indexOf(b.category);
    if (aIndex !== -1 && bIndex !== -1) {
      if (aIndex !== bIndex) return aIndex - bIndex;
    }
  } else if (a.type === 'customer' && b.type === 'customer') { // Apply custom order for customer section
    const aIndex = CUSTOMER_CATEGORY_ORDER.indexOf(a.category);
    const bIndex = CUSTOMER_CATEGORY_ORDER.indexOf(b.category);
    if (aIndex !== -1 && bIndex !== -1) {
      if (aIndex !== bIndex) return aIndex - bIndex;
    }
  }
  // Default sort by category name, then by English phrase
  const categoryCompare = a.category.localeCompare(b.category);
  if (categoryCompare !== 0) return categoryCompare;
  return a.english.localeCompare(b.english);
});

// Mapping of display names to BCP-47 language codes for SpeechSynthesisUtterance
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
  'English': { code: 'en-US', nativeName: 'English' }, // Added English for consistent lookup
};

// v1 release scope: only these languages appear anywhere in the UI
const ENABLED_LANGUAGE_CODES = ['en-US', 'zh-CN'];
const ENABLED_LANGUAGES = Object.keys(LANGUAGE_CODES).filter(langName => ENABLED_LANGUAGE_CODES.includes(LANGUAGE_CODES[langName].code));

// Features held back from v1. Each stays dormant until its content is ready.
const LANGUAGE_CHOICE_POPUP_ENABLED = ENABLED_LANGUAGE_CODES.includes('zh-HK'); // Mandarin/Cantonese chooser needs Cantonese
const AI_SUGGESTIONS_ENABLED = false; // Gemini is deferred
const TEST_SCENARIOS_ENABLED = false; // Scenarios reference languages and phrases outside v1

// Recorded audio clip for a phrase in a given language, served from public/audio
const audioUrl = (phraseId, langCode) => `${import.meta.env.BASE_URL}audio/${phraseId}_${langCode}.mp3`;

// Custom brand colours (approximated from the Georges River Council website)
const brandColors = {
  primaryTeal: '#00A99D',
  darkTeal: '#007A70',
  lightTealBackground: '#E0F2F1',
  accentRed: '#EB001B',
  lightRedBackground: '#FDE0DF',
  darkGreyText: '#333333',
  mediumGrey: '#6B7280',
  lightGreyBackground: '#F9FAFB',
  filterButtonActiveBlue: '#4285F4',
  filterButtonInactiveBg: '#F1F3F4',
  filterButtonInactiveText: '#3C4043',
  filterButtonHoverBg: '#E8EAED',
};

// Google Maps Embed API URL for directions from Hurstville Library to Centrelink Hurstville
// Note: The Embed API requires an API key for production use. For local development and simple embeds, it might work without it,
// but for deployment, you'll need to enable the Maps Embed API in your Google Cloud project and potentially add a key.
// For this example, we'll use a basic embed URL.
const centrelinkMapsEmbedUrl = "https://www.google.com/maps/embed/v1/directions?key=&origin=Hurstville+Library,+12-16+MacMahon+St,+Hurstville+NSW+2220,+Australia&destination=Centrelink+Hurstville,+125+Forest+Rd,+Hurstville+NSW+2220,+Australia&mode=driving&language=zh-CN";

// Standard Google Maps directions URL for QR code linking
const centrelinkMapsUrl = "https://www.google.com/maps/dir/?api=1&origin=12-16%20MacMahon%20St,%20Hurstville%20NSW%202220,%20Australia&destination=125%20Forest%20Rd,%20Hurstville%20NSW%202220,%20Australia&travelmode=driving&hl=zh-CN";

// QR Code API URL (using a free public service) - Increased size to 200x200
// This QR code will still link to the standard Google Maps directions URL, which is good for mobile devices.
const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(centrelinkMapsUrl)}`;


// Translations for QR Code prompt
const QR_PROMPT_TRANSLATIONS = {
  'zh-CN': '点击我获取地图',
  'zh-HK': '點擊我獲取地圖',
  'ne-NP': 'नक्साको लागि ममा क्लिक गर्नुहोस्',
  'el-GR': 'Κάντε κλικ για χάρτη',
  'ar-SA': 'انقر علي للحصول على خريطة',
  'mk-MK': 'Кликнете на мене за карта',
  'es-ES': 'Haz clic en mí para un map',
  'it-IT': 'Clicca su di me per una mappa',
  'id-ID': 'Klik saya untuk peta',
  'en-US': 'Click on me for a map',
};

// Translations for "Click for options" prompt
const CLICK_FOR_OPTIONS_PROMPT_TRANSLATIONS = {
  'Mandarin': '点击获取选项',
  'Cantonese': '點擊獲取選項',
  'Nepali': 'विक विकल्पहरूको लागि क्लिक गर्नुहोस्',
  'Greek': 'Κάντε κλικ για επιλογές',
  'Arabic': 'انقر للاختيارات',
  'Macedonian': 'Кликnete za opcii',
  'Spanish': 'Haz clic para opciones',
  'Italian': 'Clicca per le opzioni',
  'Indonesian': 'Klik untuk opsi',
  'English': 'Click for options',
};



// Main Babel Fish App Component
function MainApp() {
  const phrases = PHRASES;
  const [currentMode, setCurrentMode] = useState('staff'); // 'staff' or 'customer'
  const [customerLanguage, setCustomerLanguage] = useState('Mandarin'); // Default customer language
  const [staffLanguage, setStaffLanguage] = useState('Mandarin'); // Changed default from 'English' to 'Mandarin'
  const [userId] = useState(() => crypto.randomUUID()); // Per-session identifier for rate limiting
  const [staffQuery, setStaffQuery] = useState(''); // State for staff's dynamic query
  const [suggestedPhrases, setSuggestedPhrases] = useState([]); // State for LLM suggested phrases
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [showQrPopup, setShowQrPopup] = useState(false); // State to control QR code pop-up visibility
  const [showLanguageChoicePopup, setShowLanguageChoicePopup] = useState(false); // New state for language choice popup
  const [showFeedbackModal, setShowFeedbackModal] = useState(false); // State for feedback modal

  // Security: Initialize rate limiter
  const rateLimiter = useRef(new RateLimiter(
    parseInt(import.meta.env.VITE_MAX_REQUESTS_PER_MINUTE) || 60,
    60000
  ));
  
  // Security: Enforce HTTPS in production
  useEffect(() => {
    if (import.meta.env.VITE_ENABLE_HTTPS_ENFORCEMENT === 'true') {
      enforceHTTPS();
    }
  }, []);

  // Audio: find which recorded clips exist so missing ones get no play button
  const [availableClips, setAvailableClips] = useState(() => new Set());
  const audioRef = useRef(null);
  useEffect(() => {
    let cancelled = false;
    const urls = PHRASES.flatMap(phrase => ENABLED_LANGUAGE_CODES.map(code => audioUrl(phrase.id, code)));
    Promise.all(urls.map(url =>
      fetch(url, { method: 'HEAD' })
        .then(res => (res.ok && (res.headers.get('content-type') || '').startsWith('audio/') ? url : null))
        .catch(() => null)
    )).then(found => {
      if (!cancelled) setAvailableClips(new Set(found.filter(Boolean)));
    });
    return () => { cancelled = true; };
  }, []);

  const playClip = (url) => {
    if (audioRef.current) audioRef.current.pause();
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.play().catch(err => console.warn('Audio playback failed:', err));
  };


  // Define Staff Subcategory Map for display names to actual category names
  const STAFF_SUBCATEGORY_DISPLAY_MAP = {
    'General Assistance': 'General Enquiries',
    'Transactional': 'Transactional',
    'Digital Services': 'Digital Services',
  };
  const [staffSubcategoryFilter, setStaffSubcategoryFilter] = useState('All'); // State for staff category filter

  // Define Customer Subcategory Map for display names to actual category names
  const CUSTOMER_SUBCATEGORY_DISPLAY_MAP = {
    'General Assistance': 'General Assistance',
    'Transactional': 'Transactional',
    'Digital Services': 'Digital Services',
  };
  const [customerSubcategoryFilter, setCustomerSubcategoryFilter] = useState('All'); // State for customer category filter

  // Only offer category filters that have published phrases
  const visibleStaffSubcategories = Object.entries(STAFF_SUBCATEGORY_DISPLAY_MAP)
    .filter(([, category]) => phrases.some(p => p.type === 'staff' && p.category === category));
  const visibleCustomerSubcategories = Object.entries(CUSTOMER_SUBCATEGORY_DISPLAY_MAP)
    .filter(([, category]) => phrases.some(p => p.type === 'customer' && p.category === category));


  // Function to call Gemini API for phrase suggestions
  const fetchSuggestedPhrases = async () => {
    if (!staffQuery.trim()) return; // Don't fetch if query is empty

    // Security: Validate and sanitize user input
    const validation = validateUserQuery(staffQuery);
    if (!validation.isValid) {
      console.error('Invalid user query:', validation.error);
      setSuggestedPhrases([{ english: 'Invalid input. Please try again.', chinese: '' }]);
      return;
    }

    // Security: Rate limiting
    const userIdentifier = userId || 'anonymous';
    if (!rateLimiter.current.isAllowed(userIdentifier)) {
      setSuggestedPhrases([{ english: 'Rate limit exceeded. Please wait before trying again.', chinese: '' }]);
      return;
    }

    setIsSuggesting(true);
    setSuggestedPhrases([]); // Clear previous suggestions

    try {
      let chatHistory = [];
      const sanitizedQuery = validation.sanitizedQuery;
      const prompt = `Given the scenario: "${sanitizedQuery}", what are some common library phrases a librarian might need to say? Provide up to 3 English phrases and their Simplified Chinese translations. Format the output as a JSON array of objects, where each object has "english" and "chinese" properties. Example: [{"english": "Hello", "chinese": "你好"}, {"chinese": "再见"}]`;
      chatHistory.push({ role: "user", parts: [{ text: prompt }] });

      const payload = {
        contents: chatHistory,
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                "english": { "type": "STRING" },
                "chinese": { "type": "STRING" }
              },
              "propertyOrdering": ["english", "chinese"]
            }
          }
        }
      };

      // Security: Sanitize API payload
      const sanitizedPayload = sanitizeAPIPayload(payload);

      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || ""; // Get API key from environment variables
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sanitizedPayload)
      });

      const result = await response.json();
      
      // Security: Validate API response
      if (!validateAPIResponse(result)) {
        console.error("Invalid API response detected");
        setSuggestedPhrases([{ english: "Error processing response. Please try again.", chinese: "" }]);
        return;
      }
      
      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
        const jsonText = result.candidates[0].content.parts[0].text;
        try {
          const parsedSuggestions = JSON.parse(jsonText);
          setSuggestedPhrases(parsedSuggestions);
        } catch (parseError) {
          console.error("Error parsing LLM response JSON:", parseError, "Raw response:", jsonText);
          // Fallback if JSON parsing fails (e.g., LLM returns malformed JSON)
          setSuggestedPhrases([{ english: "Could not parse suggestion. Try rephrasing your query.", chinese: "" }]);
        }
      } else {
        console.warn("LLM response did not contain expected content:", result);
        setSuggestedPhrases([{ english: "No suggestions found.", chinese: "" }]);
      }
    } catch (error) {
      console.error("Error fetching suggested phrases from Gemini API:", error);
      setSuggestedPhrases([{ english: "Error fetching suggestions.", chinese: "" }]);
    } finally {
      setIsSuggesting(false);
    }
  };


  // Filter phrases based on currentMode and staffSubcategoryFilter/customerSubcategoryFilter
  const filteredPhrases = phrases.filter(phrase => {
    if (phrase.type !== currentMode) {
      return false;
    }
    if (currentMode === 'staff') {
      // Exclude "I speak..." phrases from here, they are handled by the popup
      if (LANGUAGE_CHOICE_POPUP_ENABLED && (phrase.english === 'I speak Mandarin.' || phrase.english === 'I speak Cantonese.')) {
        return false;
      }
      if (staffSubcategoryFilter === 'All') {
        return true;
      }
      return phrase.category === staffSubcategoryFilter;
    } else if (currentMode === 'customer') {
      if (customerSubcategoryFilter === 'All') {
        return true;
      }
      // Use the actual category name for filtering customer phrases
      return phrase.category === customerSubcategoryFilter;
    }
    return true;
  });

  // Group filtered phrases by category
  const groupedPhrases = filteredPhrases.reduce((acc, phrase) => {
    if (!acc[phrase.category]) {
      acc[phrase.category] = [];
    }
    // Logic to insert "Do you prefer..." phrase
    if (LANGUAGE_CHOICE_POPUP_ENABLED && currentMode === 'staff' && phrase.english === 'Do you prefer to speak Mandarin or Cantonese?') { // Corrected English match
        // Ensure this phrase is only added once per category if it exists
        if (!acc[phrase.category].some(p => p.english === 'Do you prefer to speak Mandarin or Cantonese?')) { // Corrected English match
            acc[phrase.category].push(phrase);
        }
    } else {
        acc[phrase.category].push(phrase);
    }
    return acc;
  }, {});


  // Function to speak phrase using browser's SpeechSynthesisUtterance
  const speakPhrase = (text, langCode) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = langCode; // Set language dynamically
      utterance.rate = 0.9; // Slightly slower for better clarity
      window.speechSynthesis.speak(utterance);
    } else {
      console.warn("Speech Synthesis not supported in this browser.");
      // In a real app, you might show a fallback message to the user
    }
  };

  // Speaker icon SVG
  const speakerIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 inline-block ml-2">
      <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.5A2.25 2.25 0 0 0 2.25 9v6a2.25 2.25 0 0 0 2.25 2.25h2.44l4.5 4.5c.944.945 2.56.276 2.56-1.06V4.06ZM18.04 14.94a6.5 6.5 0 0 0 0-5.88l1.776-1.776a8.25 8.25 0 1 1 0 9.432l-1.776-1.776Z" />
    </svg>
  );

  // Get sorted category keys based on the current mode
  const sortedCategoryKeys = Object.keys(groupedPhrases).sort((a, b) => {
    if (currentMode === 'staff') {
      return STAFF_CATEGORY_ORDER.indexOf(a) - STAFF_CATEGORY_ORDER.indexOf(b);
    } else if (currentMode === 'customer') {
      return CUSTOMER_CATEGORY_ORDER.indexOf(a) - CUSTOMER_CATEGORY_ORDER.indexOf(b);
    }
    return a.localeCompare(b); // Default alphabetical sort if no custom order
  });

  return (
    <div className="min-h-screen" style={{ backgroundColor: brandColors.lightGreyBackground }}>
      <style>
        {`
        @import url('https://fonts.googleapis.com/css2?family=Work+Sans:wght@400;500;600;700&display=swap');
        body { font-family: 'Work Sans', sans-serif; margin: 0; }
        .text-shadow-light { text-shadow: 0.5px 0.5px 1px rgba(0,0,0,0.05); }
        .button-base {
          padding: 0.75rem 1.5rem;
          border-radius: 9999px; /* Fully rounded */
          font-weight: 600; /* Semi-bold */
          transition: all 0.2s ease-in-out;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          border: none;
        }
        .button-primary-active {
          background-color: #00A99D;
          color: white;
          transform: scale(1.05);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }
        .button-primary-inactive {
          background-color: #E5E7EB; /* Tailwind gray-200 */
          color: #333333;
        }
        .button-primary-inactive:hover {
          background-color: #E0F2F1;
          color: #007A70;
          transform: translateY(-1px);
          box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
        }
        .button-accent-active {
          background-color: #EB001B;
          color: white;
          transform: scale(1.05);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }
        .button-accent-inactive {
          background-color: #E5E7EB; /* Tailwind gray-200 */
          color: #333333;
        }
        .button-accent-inactive:hover {
          background-color: #FDE0DF;
          color: #EB001B;
          transform: translateY(-1px);
          box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
        }
        .phrase-list-grid { /* New class for grid layout */
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(calc(50% - 1rem), 1fr)); /* Two columns, considering gap */
          gap: 1rem; /* Gap between cards */
        }
        @media (max-width: 640px) { /* Adjust for small screens */
          .phrase-list-grid {
            grid-template-columns: 1fr; /* Single column on mobile */
          }
        }
        .phrase-card {
          background-color: white;
          padding: 1.5rem;
          border-radius: 0.75rem; /* rounded-lg */
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.08);
          display: flex;
          flex-direction: column;
          justify-content: flex-start; /* Align content to the start (left) */
          transition: all 0.2s ease-in-out;
        }
        .phrase-card:hover {
          box-shadow: 0 8px 12px rgba(0, 0, 0, 0.12);
          transform: translateY(-2px);
        }
        .category-section {
          background-color: #E0F2F1;
          padding: 1.5rem;
          border-radius: 0.75rem; /* rounded-lg */
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }
        .staff-category-button-active {
          background-color: #4285F4;
          color: white;
          transform: scale(1.05);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }
        .staff-category-button-inactive {
          background-color: #F1F3F4;
          color: #3C4043;
        }
        .staff-category-button-inactive:hover {
          background-color: #E8EAED;
          color: #4285F4;
          transform: translateY(-1px);
          box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
        }
        .customer-category-button-active { /* New class for customer filter */
          background-color: #EB001B; /* Use accent color for active */
          color: white;
          transform: scale(1.05);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }
        .customer-category-button-inactive { /* New class for customer filter */
          background-color: #F1F3F4;
          color: #3C4043;
        }
        .customer-category-button-inactive:hover { /* New class for customer filter */
          background-color: #FDE0DF;
          color: #EB001B;
          transform: translateY(-1px);
          box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
        }
        .popup-overlay { /* Generic popup overlay */
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        .popup-content { /* Generic popup content */
          background-color: white;
          padding: 2rem;
          border-radius: 1rem;
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
          text-align: center;
          position: relative;
          max-width: 90vw;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
        }
        .popup-close { /* Generic popup close button */
          position: absolute;
          top: 0.75rem;
          right: 0.75rem;
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #333333;
          padding: 0.25rem;
          line-height: 1;
        }
        `}
      </style>

      <div className="max-w-4xl mx-auto rounded-xl shadow-lg p-6 md:p-8" style={{ backgroundColor: 'white' }}>
        {/* Logo */}
        <div className="flex justify-center mb-6 p-6 rounded-lg" style={{ backgroundColor: brandColors.darkTeal }}> {/* Changed background and padding */}
          <img
            src="https://georgesriver.spydus.com/api/maintenance/1.0/imagebrowser/image?blobName=a31cf63f-7e24-41d5-b1f8-c206bde45ce6.png" // Updated logo source
            alt="Georges River Libraries Logo"
            className="h-24 md:h-28 object-contain rounded-md"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://placehold.co/160x80/cccccc/333333?text=Logo+Error";
            }}
          />
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-center mb-6 text-shadow-light" style={{ color: brandColors.darkTeal }}>
          Georges River Libraries Babel Fish
        </h1>

        {/* Navigation */}
        {TEST_SCENARIOS_ENABLED && (
        <div className="flex justify-center gap-4 mb-4">
          <Link
            to="/"
            className="px-4 py-2 rounded-full text-sm font-medium bg-teal-100 text-teal-700 hover:bg-teal-200 transition-all"
          >
            Home
          </Link>
          <Link
            to="/live-test-scenarios"
            className="px-4 py-2 rounded-full text-sm font-medium bg-teal-100 text-teal-700 hover:bg-teal-200 transition-all"
          >
            Test Scenarios
          </Link>
        </div>
        )}

        {/* Mode Toggle Buttons */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setCurrentMode('staff')}
            className={`button-base mt-2 ${currentMode === 'staff' ? 'button-primary-active' : 'button-primary-inactive'}`}
          >
            <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>For Staff</span><br />
            <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>
              {(() => {
                const staffTranslations = {
                  'zh-CN': '为员工', 'zh-HK': '為員工', 'ne-NP': 'कर्मचारीहरूको लागि', 'el-GR': 'Για το Προσωπικό', 'ar-SA': 'للموظفين', 'mk-MK': 'За персонал', 'es-ES': 'Para el Personal', 'it-IT': 'Per il Personale', 'id-ID': 'Untuk Staf'
                };
                const currentSelectedLanguage = currentMode === 'staff' ? staffLanguage : customerLanguage;
                const langCode = LANGUAGE_CODES[currentSelectedLanguage]?.code;
                return staffTranslations[langCode] || 'For Staff';
              })()}
            </span>
          </button>
          <button
            onClick={() => setCurrentMode('customer')}
            className={`button-base mt-2 ${currentMode === 'customer' ? 'button-accent-active' : 'button-accent-inactive'}`}
          >
            <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>For Customers</span><br />
            <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>
              {(() => {
                const customerTranslations = {
                  'zh-CN': '为顾客', 'zh-HK': '為顧客', 'ne-NP': 'ग्राहकहरूको लागि', 'el-GR': 'Για τους Πελάτες', 'ar-SA': 'للعملاء', 'mk-MK': 'За клиенти', 'es-ES': 'Para Clientes', 'it-IT': 'Per i Clienti', 'id-ID': 'Untuk Pelanggan'
                };
                const currentSelectedLanguage = currentMode === 'staff' ? staffLanguage : customerLanguage;
                const langCode = LANGUAGE_CODES[currentSelectedLanguage]?.code;
                return customerTranslations[langCode] || 'For Customers';
              })()}
            </span>
          </button>
        </div>

        {/* Staff Section UI */}
        {currentMode === 'staff' && (
          <>
            {/* Language Selection Buttons */}
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {ENABLED_LANGUAGES.map((langName) => (
                <button
                  key={langName}
                  onClick={() => setStaffLanguage(langName)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ease-in-out mt-2
                    ${staffLanguage === langName
                      ? 'bg-teal-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-teal-100 hover:text-teal-600'
                    }`}
                >
                  {langName}
                </button>
              ))}
              {/* Link to Suggested Phrases */}
              {AI_SUGGESTIONS_ENABLED && (
              <a
                href="#suggested-phrases-section"
                className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ease-in-out mt-2 bg-gray-100 text-gray-700 hover:bg-teal-100 hover:text-teal-600"
              >
                Suggested Phrases (AI)
              </a>
              )}
            </div>

            {/* Category Filter Buttons */}
            {visibleStaffSubcategories.length > 1 && (
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              <button
                onClick={() => setStaffSubcategoryFilter('All')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ease-in-out mt-2
                  ${staffSubcategoryFilter === 'All'
                    ? 'staff-category-button-active'
                    : 'staff-category-button-inactive'
                  }`}
              >
                All
              </button>
              {visibleStaffSubcategories.map(([displayKey, actualCategoryName]) => (
                <button
                  key={actualCategoryName}
                  onClick={() => setStaffSubcategoryFilter(actualCategoryName)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ease-in-out mt-2
                    ${staffSubcategoryFilter === actualCategoryName
                      ? 'staff-category-button-active'
                      : 'staff-category-button-inactive'
                    }`}
                >
                  {displayKey}
                </button>
              ))}
            </div>
            )}
          </>
        )}

        {/* Language Selection for Customer Section */}
        {currentMode === 'customer' && (
          <>
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {ENABLED_LANGUAGES.filter(langName => langName !== 'English').map((langName) => ( // Filter out English if present
                <button
                  key={langName}
                  onClick={() => setCustomerLanguage(langName)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ease-in-out mt-2
                    ${customerLanguage === langName
                      ? 'bg-red-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-red-100 hover:text-red-600'
                    }`}
                >
                  {`${LANGUAGE_CODES[langName].nativeName} (${langName})`}
                </button>
              ))}
            </div>
            {/* Customer Category Filter Buttons */}
            {visibleCustomerSubcategories.length > 1 && (
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              <button
                onClick={() => setCustomerSubcategoryFilter('All')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ease-in-out mt-2
                  ${customerSubcategoryFilter === 'All'
                    ? 'customer-category-button-active'
                    : 'customer-category-button-inactive'
                  }`}
              >
                All
              </button>
              {visibleCustomerSubcategories.map(([displayKey, actualCategoryName]) => (
                <button
                  key={actualCategoryName}
                  onClick={() => setCustomerSubcategoryFilter(actualCategoryName)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ease-in-out mt-2
                    ${customerSubcategoryFilter === actualCategoryName
                      ? 'customer-category-button-active'
                      : 'customer-category-button-inactive'
                    }`}
                >
                  {displayKey}
                </button>
              ))}
            </div>
            )}
          </>
        )}

        {/* Phrase List Display */}
        {Object.keys(groupedPhrases).length === 0 && (
          <div className="text-center text-lg py-10" style={{ color: brandColors.mediumGrey }}>
            {currentMode === 'customer' ? 'No customer phrases available yet.' : 'No phrases found.'}
          </div>
        )}

        {/* Sorted Categories for Current Mode */}
        {sortedCategoryKeys.map((category) => (
          <div key={category} className="mb-8 category-section">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 pb-2 border-b-2" style={{ color: brandColors.darkTeal, borderColor: brandColors.primaryTeal }}>
              {category}
            </h2>
            <ul className="phrase-list-grid">
              {/* Custom rendering for "Do you prefer to speak Mandarin or Cantonese?" */}
              {LANGUAGE_CHOICE_POPUP_ENABLED && currentMode === 'staff' && category === 'General Enquiries' && (staffLanguage === 'Mandarin' || staffLanguage === 'Cantonese') && ( // Condition for visibility
                <>
                  {phrases.find(p => p.english === 'Do you prefer to speak Mandarin or Cantonese?' && p.type === 'staff') && (
                    <li
                      key="Do you prefer to speak Mandarin or Cantonese?"
                      className="phrase-card cursor-pointer"
                      onClick={() => setShowLanguageChoicePopup(true)} // Click to open popup
                    >
                      <div className="flex-1 text-left mb-4">
                        <p className="text-base font-medium mb-1" style={{ color: brandColors.darkGreyText }}> {/* Adjusted size */}
                          {staffLanguage === 'Cantonese'
                            ? "Do you prefer to speak Cantonese or Mandarin?"
                            : "Do you prefer to speak Mandarin or Cantonese?"}
                        </p>
                        <p className="text-lg font-semibold" style={{ color: brandColors.darkTeal }}> {/* Adjusted size */}
                          {phrases.find(p => p.english === 'Do you prefer to speak Mandarin or Cantonese?').translations?.[LANGUAGE_CODES[staffLanguage].code] || 'Do you prefer to speak Mandarin or Cantonese?'}
                        </p>
                        <br />
                        <span className="text-blue-600 text-sm font-semibold"> {/* Adjusted size */}
                          Click for options ({CLICK_FOR_OPTIONS_PROMPT_TRANSLATIONS[staffLanguage] || 'Click for options'})
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          speakPhrase(
                            phrases.find(p => p.english === 'Do you prefer to speak Mandarin or Cantonese?').translations?.[LANGUAGE_CODES[staffLanguage].code] || 'Do you prefer to speak Mandarin or Cantonese?',
                            LANGUAGE_CODES[staffLanguage].code
                          );
                        }}
                        className="flex-shrink-0 p-3 rounded-full shadow-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-opacity-75"
                        style={{ backgroundColor: brandColors.primaryTeal, color: 'white', focusRingColor: brandColors.primaryTeal }}
                        title="Play audio"
                      >
                        {speakerIcon}
                      </button>
                    </li>
                  )}
                </>
              )}

              {/* Render all other phrases filtered by category and NOT "I speak..." or "Do you prefer..." */}
              {groupedPhrases[category]
                .filter(phrase => !(LANGUAGE_CHOICE_POPUP_ENABLED && (phrase.english === 'Do you prefer to speak Mandarin or Cantonese?' || phrase.english === 'I speak Mandarin.' || phrase.english === 'I speak Cantonese.')))
                .map((phrase) => {
                  const clipUrl = audioUrl(phrase.id, currentMode === 'staff' ? LANGUAGE_CODES[staffLanguage].code : 'en-US');
                  return (
                <li
                  key={phrase.id}
                  className="phrase-card cursor-pointer"
                  onClick={() => {
                    if (phrase.english === 'How do I get to Centrelink?' && currentMode === 'customer') {
                      setShowQrPopup(true);
                    }
                  }}
                >
                  <div className="flex-1 text-left mb-4">
                    {currentMode === 'staff' ? (
                      <>
                        <p className="text-lg font-semibold mb-1" style={{ color: brandColors.darkTeal }}>{phrase.english}</p>
                        <p className="text-base font-medium" style={{ color: brandColors.darkGreyText }}>
                          {phrase.translations?.[LANGUAGE_CODES[staffLanguage].code] || phrase.english}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-lg font-semibold mb-1" style={{ color: brandColors.darkTeal }}>
                          {phrase.translations?.[LANGUAGE_CODES[customerLanguage].code] || phrase.english}
                        </p>
                        <p className="text-base font-medium" style={{ color: brandColors.darkGreyText }}>
                          {phrase.english}
                          {phrase.english === 'How do I get to Centrelink?' && (
                            <>
                              <br />
                              <span className="text-sm ml-0 italic" style={{color: brandColors.mediumGrey}}>
                                {QR_PROMPT_TRANSLATIONS[LANGUAGE_CODES[customerLanguage].code] || 'Click on me for a map'}
                              </span>
                            </>
                          )}
                        </p>
                      </>
                    )}
                  </div>
                  {availableClips.has(clipUrl) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playClip(clipUrl);
                    }}
                    className="flex-shrink-0 p-3 rounded-full shadow-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-opacity-75"
                    style={{ backgroundColor: currentMode === 'staff' ? brandColors.primaryTeal : brandColors.accentRed, color: 'white', focusRingColor: brandColors.primaryTeal }}
                    title="Play audio"
                  >
                    {speakerIcon}
                  </button>
                  )}
                </li>
                  );
                })}
            </ul>
          </div>
        ))}

        {/* Suggested Phrases Section - Moved to bottom */}
        {AI_SUGGESTIONS_ENABLED && currentMode === 'staff' && (
          <div id="suggested-phrases-section" className="mb-8 p-4 bg-gray-50 rounded-lg shadow-inner">
            <h3 className="text-xl md:text-2xl font-bold text-teal-700 mb-4 pb-2 border-b-2 border-teal-200">
              Suggested Phrases
            </h3>
            <textarea
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 mb-3"
              rows="3"
              placeholder="Type a scenario (e.g., 'customer wants to borrow a specific book', 'someone needs help with computer reservations')"
              value={staffQuery}
              onChange={(e) => setStaffQuery(e.target.value)}
            ></textarea>
            <button
              onClick={fetchSuggestedPhrases}
              className={`w-full button-base ${isSuggesting ? 'bg-gray-400 cursor-not-allowed' : 'bg-teal-600 text-white hover:bg-teal-700'}`}
              disabled={isSuggesting}
            >
              {isSuggesting ? 'Suggesting...' : 'Suggest Phrases ✨'}
            </button>

            {suggestedPhrases.length > 0 && (
              <div className="mt-4 border-t pt-4">
                <h4 className="text-md font-semibold text-gray-700 mb-2">Suggestions:</h4>
                <ul className="space-y-3">
                  {suggestedPhrases.map((phrase, index) => (
                    <li key={index} className="bg-white p-3 rounded-md shadow-sm flex items-center justify-between">
                      <div className="flex-1 text-left">
                        <p className="text-base font-medium text-gray-800 mb-0.5">{phrase.english}</p>
                        <p className="text-lg font-semibold" style={{ color: brandColors.teal700 }}>
                          {phrase.chinese}
                        </p>
                      </div>
                      <button
                        onClick={() => speakPhrase(phrase.chinese, LANGUAGE_CODES['Mandarin'].code)} // Always speak Chinese from LLM suggestions
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
          </div>
        )}

        {/* Language Choice Pop-up Modal */}
        {showLanguageChoicePopup && (
          <div className="popup-overlay" onClick={() => setShowLanguageChoicePopup(false)}> {/* Close on overlay click */}
            <div className="popup-content" onClick={(e) => e.stopPropagation()}> {/* Prevent clicks inside from closing */}
              <button className="popup-close" onClick={() => setShowLanguageChoicePopup(false)}>
                &times;
              </button>
              <h3 className="text-2xl font-bold text-teal-800 mb-4">I Speak...</h3>
              <ul className="flex flex-col gap-4">
                {/* Conditional rendering based on staffLanguage for order */}
                {staffLanguage === 'Cantonese' ? (
                  <>
                    {/* Cantonese Option first */}
                    {initialPhrases.find(p => p.english === 'I speak Cantonese.' && p.type === 'staff') && (
                      <li className="phrase-card cursor-pointer" onClick={() => {
                        const cantonesePhrase = initialPhrases.find(p => p.english === 'I speak Cantonese.' && p.type === 'staff');
                        // Always speak the Cantonese version of "I speak Cantonese" and display its native form
                        const textToSpeak = cantonesePhrase.translations[LANGUAGE_CODES['Cantonese'].code] || cantonesePhrase.english;
                        speakPhrase(textToSpeak, LANGUAGE_CODES['Cantonese'].code);
                        setShowLanguageChoicePopup(false);
                      }}>
                        <div className="flex-1 text-left">
                          <p className="text-base font-medium mb-1" style={{ color: brandColors.darkGreyText }}>I speak Cantonese.</p>
                          <p className="text-lg font-semibold" style={{ color: brandColors.darkTeal }}>
                            {initialPhrases.find(p => p.english === 'I speak Cantonese.' && p.type === 'staff').translations[LANGUAGE_CODES['Cantonese'].code] || 'I speak Cantonese.'}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            speakPhrase(initialPhrases.find(p => p.english === 'I speak Cantonese.' && p.type === 'staff').translations[LANGUAGE_CODES['Cantonese'].code] || initialPhrases.find(p => p.english === 'I speak Cantonese.' && p.type === 'staff').english, LANGUAGE_CODES['Cantonese'].code);
                          }}
                          className="flex-shrink-0 p-3 rounded-full shadow-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-opacity-75"
                          style={{ backgroundColor: brandColors.primaryTeal, color: 'white', focusRingColor: brandColors.primaryTeal }}
                          title="Play audio"
                        >
                          {speakerIcon}
                        </button>
                      </li>
                    )}
                    {/* Mandarin Option second */}
                    {initialPhrases.find(p => p.english === 'I speak Mandarin.' && p.type === 'staff') && (
                      <li className="phrase-card cursor-pointer" onClick={() => {
                        const mandarinPhrase = initialPhrases.find(p => p.english === 'I speak Mandarin.' && p.type === 'staff');
                        const textToSpeak = mandarinPhrase.translations[LANGUAGE_CODES['Mandarin'].code] || mandarinPhrase.english;
                        speakPhrase(textToSpeak, LANGUAGE_CODES['Mandarin'].code);
                        setShowLanguageChoicePopup(false);
                      }}>
                        <div className="flex-1 text-left">
                          <p className="text-base font-medium mb-1" style={{ color: brandColors.darkGreyText }}>I speak Mandarin.</p>
                          <p className="text-lg font-semibold" style={{ color: brandColors.darkTeal }}>
                            {initialPhrases.find(p => p.english === 'I speak Mandarin.' && p.type === 'staff').translations[LANGUAGE_CODES['Mandarin'].code] || 'I speak Mandarin.'}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            speakPhrase(initialPhrases.find(p => p.english === 'I speak Mandarin.' && p.type === 'staff').translations[LANGUAGE_CODES['Mandarin'].code] || initialPhrases.find(p => p.english === 'I speak Mandarin.' && p.type === 'staff').english, LANGUAGE_CODES['Mandarin'].code);
                          }}
                          className="flex-shrink-0 p-3 rounded-full shadow-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-opacity-75"
                          style={{ backgroundColor: brandColors.primaryTeal, color: 'white', focusRingColor: brandColors.primaryTeal }}
                          title="Play audio"
                        >
                          {speakerIcon}
                        </button>
                      </li>
                    )}
                  </>
                ) : (
                  <>
                    {/* Default: Mandarin Option first */}
                    {initialPhrases.find(p => p.english === 'I speak Mandarin.' && p.type === 'staff') && (
                      <li className="phrase-card cursor-pointer" onClick={() => {
                        const mandarinPhrase = initialPhrases.find(p => p.english === 'I speak Mandarin.' && p.type === 'staff');
                        const textToSpeak = mandarinPhrase.translations[LANGUAGE_CODES['Mandarin'].code] || mandarinPhrase.english;
                        speakPhrase(textToSpeak, LANGUAGE_CODES['Mandarin'].code);
                        setShowLanguageChoicePopup(false);
                      }}>
                        <div className="flex-1 text-left">
                          <p className="text-base font-medium mb-1" style={{ color: brandColors.darkGreyText }}>I speak Mandarin.</p>
                          <p className="text-lg font-semibold" style={{ color: brandColors.darkTeal }}>
                            {initialPhrases.find(p => p.english === 'I speak Mandarin.' && p.type === 'staff').translations[LANGUAGE_CODES['Mandarin'].code] || 'I speak Mandarin.'}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            speakPhrase(initialPhrases.find(p => p.english === 'I speak Mandarin.' && p.type === 'staff').translations[LANGUAGE_CODES['Mandarin'].code] || initialPhrases.find(p => p.english === 'I speak Mandarin.' && p.type === 'staff').english, LANGUAGE_CODES['Mandarin'].code);
                          }}
                          className="flex-shrink-0 p-3 rounded-full shadow-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-opacity-75"
                          style={{ backgroundColor: brandColors.primaryTeal, color: 'white', focusRingColor: brandColors.primaryTeal }}
                          title="Play audio"
                        >
                          {speakerIcon}
                        </button>
                      </li>
                    )}
                    {/* Cantonese Option second */}
                    {initialPhrases.find(p => p.english === 'I speak Cantonese.' && p.type === 'staff') && (
                      <li className="phrase-card cursor-pointer" onClick={() => {
                        const cantonesePhrase = initialPhrases.find(p => p.english === 'I speak Cantonese.' && p.type === 'staff');
                        const textToSpeak = cantonesePhrase.translations[LANGUAGE_CODES['Cantonese'].code] || cantonesePhrase.english;
                        speakPhrase(textToSpeak, LANGUAGE_CODES['Cantonese'].code);
                        setShowLanguageChoicePopup(false);
                      }}>
                        <div className="flex-1 text-left">
                          <p className="text-base font-medium mb-1" style={{ color: brandColors.darkGreyText }}>I speak Cantonese.</p>
                          <p className="text-lg font-semibold" style={{ color: brandColors.darkTeal }}>
                            {initialPhrases.find(p => p.english === 'I speak Cantonese.' && p.type === 'staff').translations[LANGUAGE_CODES['Cantonese'].code] || 'I speak Cantonese.'}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            speakPhrase(cantonesePhrase.translations[LANGUAGE_CODES['Cantonese'].code] || cantonesePhrase.english, LANGUAGE_CODES['Cantonese'].code);
                          }}
                          className="flex-shrink-0 p-3 rounded-full shadow-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-opacity-75"
                          style={{ backgroundColor: brandColors.primaryTeal, color: 'white', focusRingColor: brandColors.primaryTeal }}
                          title="Play audio"
                        >
                          {speakerIcon}
                        </button>
                      </li>
                    )}
                  </>
                )}
              </ul>
            </div>
          </div>
        )}

        {/* QR Code Pop-up Modal */}
        {showQrPopup && (
          <div className="popup-overlay">
            <div className="popup-content">
              <button className="popup-close" onClick={() => setShowQrPopup(false)}>
                &times;
              </button>
              <h3 className="text-2xl font-bold text-teal-800 mb-4">Directions to Centrelink</h3>
              <p className="text-lg text-gray-700 mb-4">Scan this QR code for Google Maps directions (in Mandarin):</p>
              {/* Google Map iframe */}
              <iframe
                src={centrelinkMapsEmbedUrl} // Using Embed API URL
                width="100%"
                height="300"
                style={{ border: 0, borderRadius: '0.5rem', marginBottom: '1rem' }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Directions to Centrelink Hurstville"
              ></iframe>
              <img
                src={qrCodeImageUrl}
                alt="QR Code for Centrelink Directions"
                className="w-48 h-48 object-contain mx-auto rounded-md" // Adjusted size for better fit with map
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://placehold.co/192x192/cccccc/333333?text=QR+Error"; // Adjusted placeholder size
                }}
              />
              <p className="text-sm text-gray-500 mt-4">Opens in Google Maps app or browser.</p>
            </div>
          </div>
        )}

        {/* Feedback Button */}
        <FeedbackButton onClick={() => setShowFeedbackModal(true)} />

        {/* Feedback Modal */}
        <FeedbackModal
          isOpen={showFeedbackModal}
          onClose={() => setShowFeedbackModal(false)}
          onSubmit={submitFeedback}
          scenario={currentMode === 'staff' ? 'Staff Mode Testing' : 'Customer Mode Testing'}
        />
      </div>
    </div>
  );
}

// Router wrapper component
function App() {
  return (
    <BrowserRouter basename="/babel-fish">
      <Routes>
        <Route path="/" element={<MainApp />} />
        {TEST_SCENARIOS_ENABLED && <Route path="/live-test-scenarios" element={<LiveTestScenarios />} />}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
