import React, { useState } from 'react';

// Custom brand colours (from Georges River Council)
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

// Mapping of display names to BCP-47 language codes
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
};

// Define custom order for staff categories
const STAFF_CATEGORY_ORDER = [
  'General Enquiries',
  'Transactional',
  'Digital Services',
];

// Define custom order for customer categories
const CUSTOMER_CATEGORY_ORDER = [
  'General Assistance',
  'Transactional',
  'Library Layout',
  'Language & Community Resources',
  'Digital Services',
];

// Sample phrases data
const samplePhrases = [
  { 
    id: 1, 
    type: 'staff', 
    category: 'General Enquiries', 
    english: 'Please follow me.',
    translations: {
      'zh-CN': '请跟我来。',
      'zh-HK': '请跟我来。',
      'ne-NP': 'कृपया मलाई पछ्याउनुहोस्।',
      'el-GR': 'Παρακαλώ ακολουθήστε με。',
      'ar-SA': 'الرجاء اتبعني。',
      'mk-MK': 'Ве молам следете me。',
      'es-ES': 'Por favor, sígame。',
      'it-IT': 'Per favor, mi segua。',
      'id-ID': 'Tolong ikuti saya。',
    }
  },
  { 
    id: 2, 
    type: 'staff', 
    category: 'General Enquiries', 
    english: 'Thank you.',
    translations: {
      'zh-CN': '谢谢您。',
      'zh-HK': '多謝你。',
      'ne-NP': 'धन्यवाद।',
      'el-GR': 'Ευχαριστώ。',
      'ar-SA': 'شكرا لك。',
      'mk-MK': 'Ви благодариме。',
      'es-ES': 'Gracias。',
      'it-IT': 'Grazie。',
      'id-ID': 'Terima kasih。',
    }
  },
  { 
    id: 3, 
    type: 'staff', 
    category: 'Transactional', 
    english: 'Please show me your library card',
    translations: {
      'zh-CN': '请出示您的借书证',
      'zh-HK': '请出示你的图书证。',
      'ne-NP': 'कृपया आफ्नो पुस्तकालय कार्ड देखाउनुहोस्।',
      'el-GR': 'Παρακαλώ δείξτε μου την κάρτα βιβλιοθήκης σας।',
      'ar-SA': 'الرجاء إظهار بطاقة المكتبة الخاصة بك।',
      'mk-MK': 'Ве молам покажете ми ја вашата библиотечна картичка。',
      'es-ES': 'Por favor, muéstreme su tarjeta de la biblioteca。',
      'it-IT': 'Per favor, mi mostri la sua tessera della biblioteca。',
      'id-ID': 'Tolong tunjukkan kartu perpustakaan Anda。',
    }
  },
  { 
    id: 4, 
    type: 'staff', 
    category: 'Digital Services', 
    english: 'Would you like to use the internet?',
    translations: {
      'zh-CN': '您想使用互联网吗？',
      'zh-HK': '你想用上网吗？',
      'ne-NP': 'के तपाईं इन्टरनेट प्रयोग गर्न चाहनुहुन्छ?',
      'el-GR': 'Θα θέλατε να χρησιμοποιήσετε το διαδίκτυο？',
      'ar-SA': 'هل ترغب في استخدام الإنترنت？',
      'mk-MK': 'Дали сакате να го користите интернетот？',
      'es-ES': '¿Le gustaría usar internet？',
      'it-IT': 'Le piacerebbe usare internet？',
      'id-ID': 'Apakah Anda ingin menggunakan internet？',
    }
  },
  { 
    id: 5, 
    type: 'customer', 
    category: 'General Assistance', 
    english: 'How do I renew my borrowed items?',
    translations: {
      'zh-CN': '我如何续借我的借阅物品？',
      'zh-HK': '我点样续借我借嘅嘢？',
      'ne-NP': 'मैले मेरो उधारो सामानहरू कसरी नवीकरण गर्ने?',
      'el-GR': 'Πώς ανανεώνω τα δανεισμένα μου αντικείμενα？',
      'ar-SA': 'كيف يمكنني تجديد المواد المستعارة؟',
      'mk-MK': 'Како да ги обновам позајмените предмети？',
      'es-ES': '¿Cómo renuevo mis artículos prestados？',
      'it-IT': 'Come posso rinnovare i miei articoli presi in prestito？',
      'id-ID': 'Bagaimana cara memperpanjang peminjaman barang？',
    }
  },
  { 
    id: 6, 
    type: 'customer', 
    category: 'Library Layout', 
    english: 'Where is the bathroom?',
    translations: {
      'zh-CN': '洗手间在哪里？',
      'zh-HK': '洗手间喺边度？',
      'ne-NP': 'शौचालय कहाँ छ?',
      'el-GR': 'Πού είναι η τουαλέτα？',
      'ar-SA': 'أين دورة المياه？',
      'mk-MK': 'Каде е тоалетот？',
      'es-ES': '¿Dónde está el baño？',
      'it-IT': 'Dov\'è il bagno？',
      'id-ID': 'Di mana kamar mandi？',
    }
  },
];

function App() {
  const [currentMode, setCurrentMode] = useState('staff'); // 'staff' or 'customer'
  const [customerLanguage, setCustomerLanguage] = useState('Mandarin');
  const [staffLanguage, setStaffLanguage] = useState('Mandarin');
  const [staffSubcategoryFilter, setStaffSubcategoryFilter] = useState('All');
  const [customerSubcategoryFilter, setCustomerSubcategoryFilter] = useState('All');

  // Define Staff Subcategory Map for display names to actual category names
  const STAFF_SUBCATEGORY_DISPLAY_MAP = {
    'General Assistance': 'General Enquiries',
    'Transactional': 'Transactional',
    'Digital Services': 'Digital Services',
  };

  // Define Customer Subcategory Map for display names to actual category names
  const CUSTOMER_SUBCATEGORY_DISPLAY_MAP = {
    'General Assistance': 'General Assistance',
    'Transactional': 'Transactional',
    'Digital Services': 'Digital Services',
  };

  // Filter phrases based on currentMode and category filter
  const filteredPhrases = samplePhrases.filter(phrase => {
    if (phrase.type !== currentMode) {
      return false;
    }
    if (currentMode === 'staff') {
      if (staffSubcategoryFilter === 'All') {
        return true;
      }
      return phrase.category === staffSubcategoryFilter;
    } else if (currentMode === 'customer') {
      if (customerSubcategoryFilter === 'All') {
        return true;
      }
      return phrase.category === customerSubcategoryFilter;
    }
    return true;
  });

  // Group filtered phrases by category
  const groupedPhrases = filteredPhrases.reduce((acc, phrase) => {
    if (!acc[phrase.category]) {
      acc[phrase.category] = [];
    }
    acc[phrase.category].push(phrase);
    return acc;
  }, {});

  // Get sorted category keys based on the current mode
  const sortedCategoryKeys = Object.keys(groupedPhrases).sort((a, b) => {
    if (currentMode === 'staff') {
      return STAFF_CATEGORY_ORDER.indexOf(a) - STAFF_CATEGORY_ORDER.indexOf(b);
    } else if (currentMode === 'customer') {
      return CUSTOMER_CATEGORY_ORDER.indexOf(a) - CUSTOMER_CATEGORY_ORDER.indexOf(b);
    }
    return a.localeCompare(b);
  });

  // Speaker icon SVG
  const speakerIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 inline-block ml-2">
      <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.5A2.25 2.25 0 0 0 2.25 9v6a2.25 2.25 0 0 0 2.25 2.25h2.44l4.5 4.5c.944.945 2.56.276 2.56-1.06V4.06ZM18.04 14.94a6.5 6.5 0 0 0 0-5.88l1.776-1.776a8.25 8.25 0 1 1 0 9.432l-1.776-1.776Z" />
    </svg>
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: brandColors.lightGreyBackground }}>
      <style>
        {`
        @import url('https://fonts.googleapis.com/css2?family=Work+Sans:wght@400;500;600;700&display=swap');
        body { font-family: 'Work Sans', sans-serif; margin: 0; }
        .text-shadow-light { text-shadow: 0.5px 0.5px 1px rgba(0,0,0,0.05); }
        .button-base {
          padding: 0.75rem 1.5rem;
          border-radius: 9999px;
          font-weight: 600;
          transition: all 0.2s ease-in-out;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          border: none;
          cursor: pointer;
          display: inline-block;
        }
        .button-primary-active {
          background-color: ${brandColors.primaryTeal};
          color: white;
          transform: scale(1.05);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }
        .button-primary-inactive {
          background-color: #E5E7EB;
          color: ${brandColors.darkGreyText};
        }
        .button-primary-inactive:hover {
          background-color: ${brandColors.lightTealBackground};
          color: ${brandColors.darkTeal};
          transform: translateY(-1px);
          box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
        }
        .button-accent-active {
          background-color: ${brandColors.accentRed};
          color: white;
          transform: scale(1.05);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }
        .button-accent-inactive {
          background-color: #E5E7EB;
          color: ${brandColors.darkGreyText};
        }
        .button-accent-inactive:hover {
          background-color: ${brandColors.lightRedBackground};
          color: ${brandColors.accentRed};
          transform: translateY(-1px);
          box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
        }
        .phrase-list-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(calc(50% - 1rem), 1fr));
          gap: 1rem;
        }
        @media (max-width: 640px) {
          .phrase-list-grid {
            grid-template-columns: 1fr;
          }
        }
        .phrase-card {
          background-color: white;
          padding: 1.5rem;
          border-radius: 0.75rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.08);
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          transition: all 0.2s ease-in-out;
          cursor: pointer;
        }
        .phrase-card:hover {
          box-shadow: 0 8px 12px rgba(0, 0, 0, 0.12);
          transform: translateY(-2px);
        }
        .category-section {
          background-color: ${brandColors.lightTealBackground};
          padding: 1.5rem;
          border-radius: 0.75rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }
        .staff-category-button-active {
          background-color: ${brandColors.filterButtonActiveBlue};
          color: white;
          transform: scale(1.05);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }
        .staff-category-button-inactive {
          background-color: ${brandColors.filterButtonInactiveBg};
          color: ${brandColors.filterButtonInactiveText};
        }
        .staff-category-button-inactive:hover {
          background-color: ${brandColors.filterButtonHoverBg};
          color: ${brandColors.filterButtonActiveBlue};
          transform: translateY(-1px);
          box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
        }
        .customer-category-button-active {
          background-color: ${brandColors.accentRed};
          color: white;
          transform: scale(1.05);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }
        .customer-category-button-inactive {
          background-color: ${brandColors.filterButtonInactiveBg};
          color: ${brandColors.filterButtonInactiveText};
        }
        .customer-category-button-inactive:hover {
          background-color: ${brandColors.lightRedBackground};
          color: ${brandColors.accentRed};
          transform: translateY(-1px);
          box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
        }
        `}
      </style>

      <div className="max-w-4xl mx-auto rounded-xl shadow-lg p-6 md:p-8" style={{ backgroundColor: 'white' }}>
        {/* Logo */}
        <div className="flex justify-center mb-6 p-6 rounded-lg" style={{ backgroundColor: brandColors.darkTeal }}>
          <img
            src="https://georgesriver.spydus.com/api/maintenance/1.0/imagebrowser/image?blobName=a31cf63f-7e24-41d5-b1f8-c206bde45ce6.png"
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

        {/* Mode Toggle Buttons */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setCurrentMode('staff')}
            className={`button-base mt-2 ${currentMode === 'staff' ? 'button-primary-active' : 'button-primary-inactive'}`}
          >
            For Staff
          </button>
          <button
            onClick={() => setCurrentMode('customer')}
            className={`button-base mt-2 ${currentMode === 'customer' ? 'button-accent-active' : 'button-accent-inactive'}`}
          >
            For Customers
          </button>
        </div>

        {/* Staff Section UI */}
        {currentMode === 'staff' && (
          <>
            {/* Language Selection Buttons */}
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {Object.keys(LANGUAGE_CODES).map((langName) => (
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
            </div>

            {/* Category Filter Buttons */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              <button
                onClick={() => setStaffSubcategoryFilter('All')}
                className={`button-base mt-2 ${staffSubcategoryFilter === 'All'
                    ? 'staff-category-button-active'
                    : 'staff-category-button-inactive'
                  }`}
              >
                All
              </button>
              {Object.entries(STAFF_SUBCATEGORY_DISPLAY_MAP).map(([displayKey, actualCategoryName]) => (
                <button
                  key={actualCategoryName}
                  onClick={() => setStaffSubcategoryFilter(actualCategoryName)}
                  className={`button-base mt-2 ${staffSubcategoryFilter === actualCategoryName
                      ? 'staff-category-button-active'
                      : 'staff-category-button-inactive'
                    }`}
                >
                  {displayKey}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Customer Section UI */}
        {currentMode === 'customer' && (
          <>
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {Object.keys(LANGUAGE_CODES).map((langName) => (
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
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              <button
                onClick={() => setCustomerSubcategoryFilter('All')}
                className={`button-base mt-2 ${customerSubcategoryFilter === 'All'
                    ? 'customer-category-button-active'
                    : 'customer-category-button-inactive'
                  }`}
              >
                All
              </button>
              {Object.entries(CUSTOMER_SUBCATEGORY_DISPLAY_MAP).map(([displayKey, actualCategoryName]) => (
                <button
                  key={actualCategoryName}
                  onClick={() => setCustomerSubcategoryFilter(actualCategoryName)}
                  className={`button-base mt-2 ${customerSubcategoryFilter === actualCategoryName
                      ? 'customer-category-button-active'
                      : 'customer-category-button-inactive'
                    }`}
                >
                  {displayKey}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Phrase List Display */}
        {Object.keys(groupedPhrases).length === 0 && (
          <div className="text-center text-lg py-10" style={{ color: brandColors.mediumGrey }}>
            No phrases found for this selection.
          </div>
        )}

        {/* Sorted Categories for Current Mode */}
        {sortedCategoryKeys.map((category) => (
          <div key={category} className="mb-8 category-section">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 pb-2 border-b-2" style={{ color: brandColors.darkTeal, borderColor: brandColors.primaryTeal }}>
              {category}
            </h2>
            <ul className="phrase-list-grid">
              {groupedPhrases[category].map((phrase) => (
                <li
                  key={phrase.id}
                  className="phrase-card"
                >
                  <div className="flex-1 text-left mb-4">
                    {currentMode === 'staff' ? (
                      <>
                        <p className="text-base font-medium mb-1" style={{ color: brandColors.darkGreyText }}>{phrase.english}</p>
                        <p className="text-lg font-semibold" style={{ color: brandColors.darkTeal }}>
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
                        </p>
                      </>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Placeholder for speaker functionality
                      console.log('Play audio for:', phrase.english);
                    }}
                    className="flex-shrink-0 p-3 rounded-full shadow-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-opacity-75"
                    style={{ backgroundColor: currentMode === 'staff' ? brandColors.primaryTeal : brandColors.accentRed, color: 'white', focusRingColor: brandColors.primaryTeal }}
                    title="Play audio"
                  >
                    {speakerIcon}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App; 