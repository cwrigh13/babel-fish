// Constants
const STAFF_CATEGORY_ORDER = [
  'General Enquiries',
  'Transactional',
  'Digital Services',
];

const CUSTOMER_CATEGORY_ORDER = [
  'General Assistance',
  'Transactional',
  'Library Layout',
  'Language & Community Resources',
  'Digital Services',
];

// Global variables
let currentMode = 'staff';
let staffLanguage = 'Mandarin';
let customerLanguage = 'Mandarin';
let staffSubcategoryFilter = 'All';
let customerSubcategoryFilter = 'All';

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
  'English': { code: 'en-US', nativeName: 'English' },
};

// Initial phrases for seeding the database
const initialPhrases = [
  // Staff Section Phrases
  { type: 'staff', category: 'General Enquiries', english: 'Please follow me.',
    translations: {
      'zh-CN': '请跟我来。', 'zh-HK': '请跟我来。', 'ne-NP': 'कृपया मलाई पछ्याउनुहोस्।',
      'el-GR': 'Παρακαλώ ακολουθήστε με。', 'ar-SA': 'الرجاء اتبعني。', 'mk-MK': 'Ве молим следете ме。',
      'es-ES': 'Por favor, sígame。', 'it-IT': 'Per favore, mi segua。',
      'id-ID': 'Tolong ikuti saya。', 'en-US': 'Please follow me.',
    }
  },
  { type: 'staff', category: 'General Enquiries', english: 'Do you prefer to speak Mandarin or Cantonese?',
    translations: {
      'zh-CN': '您更喜欢说普通话还是粤语？',
      'zh-HK': '你鍾意講普通話定廣東話？',
      'ne-NP': 'तपाईं मन्डारिन वा क्यान्टोनिज बोल्न रुचाउनुहुन्छ?',
      'el-GR': 'Προτιμάτε να μιλάτε Μανδαρινικά ή Καντονέζικα？',
      'ar-SA': 'هل تفضل التحدث بالماندرين أو الكانتونية؟',
      'mk-MK': 'Дали претпочитате да зборувате мандарински или кантонски？',
      'es-ES': '¿Prefiere hablar mandarín o cantonés？', 'it-IT': 'Preferisce parlare mandarino o cantonese？',
      'id-ID': 'Apakah Anda lebih suka berbicara Mandarin atau Kanton？',
      'en-US': 'Do you prefer to speak Mandarin or Cantonese?',
    }
  },
  { type: 'staff', category: 'General Enquiries', english: 'I speak Mandarin.',
    translations: {
      'zh-CN': '我会说普通话。',
      'zh-HK': '我識講普通話。',
      'ne-NP': 'म मन्डारिन बोल्छु।',
      'el-GR': 'Μιλάω Μανδαρινικά。', 'ar-SA': 'أنا أتحدث الماندرين。', 'mk-MK': 'Зборувам мандарински。',
      'es-ES': 'Hablo mandarín。', 'it-IT': 'Parlo mandarino。',
      'id-ID': 'Saya berbicara Mandarin。', 'en-US': 'I speak Mandarin.',
    }
  },
  { type: 'staff', category: 'General Enquiries', english: 'I speak Cantonese.',
    translations: {
      'zh-CN': '我会说粤语。',
      'zh-HK': '我識講廣東話。',
      'ne-NP': 'म क्यान्टोनिज बोल्छु।',
      'el-GR': 'Μιλάω Καντονέζικα。', 'ar-SA': 'أنا أتحدث الكانتونية。', 'mk-MK': 'Зборुвам кантонски।',
      'es-ES': 'Hablo cantonés。', 'it-IT': 'Parlo cantonese。',
      'id-ID': 'Saya berbicara Kanton。', 'en-US': 'I speak Cantonese.',
    }
  },
  { type: 'staff', category: 'General Enquiries', english: 'Please wait one moment',
    translations: {
      'zh-CN': '请稍等片刻。', 'zh-HK': '請你稍等一陣。', 'ne-NP': 'कृपया एक क्षण पर्खनुहोस्।',
      'el-GR': 'Παρακαλώ περιμένετε μια στιγμή。', 'ar-SA': 'الرجاء الانتظار لحظة。', 'mk-MK': 'Ве молиме почекајте момент。',
      'es-ES': 'Por favor, espere un momento。', 'it-IT': 'Per favore, aspetti un momento。',
      'id-ID': 'Mohon tunggu sebentar。', 'en-US': 'Please wait one moment',
    }
  },
  { type: 'staff', category: 'General Enquiries', english: 'I understand.',
    translations: {
      'zh-CN': '我明白了。', 'zh-HK': '我明白喇。', 'ne-NP': 'मैले बुझें।',
      'el-GR': 'Καταλαβαίνω。', 'ar-SA': 'أنا أفهم。', 'mk-MK': 'Разбирам。',
      'es-ES': 'Entiendo。', 'it-IT': 'Capisco。',
      'id-ID': 'Saya mengerti。', 'en-US': 'I understand.',
    }
  },
  { type: 'staff', category: 'General Enquiries', english: 'Thank you.',
    translations: {
      'zh-CN': '谢谢您。', 'zh-HK': '多謝你。', 'ne-NP': 'धन्यवाद।',
      'el-GR': 'Ευχαριστώ。', 'ar-SA': 'شكرا لك。', 'mk-MK': 'Ви благодариме।',
      'es-ES': 'Gracias。', 'it-IT': 'Grazie।',
      'id-ID': 'Terima kasih。', 'en-US': 'Thank you.',
    }
  },
  { type: 'staff', category: 'General Enquiries', english: 'You are welcome.',
    translations: {
      'zh-CN': '不客气。', 'zh-HK': '唔使客氣。', 'ne-NP': 'तपाईंलाई स्वागत छ।',
      'el-GR': 'Παρακαλώ。', 'ar-SA': 'على الرحب والسعة。', 'mk-MK': 'Нема на што।',
      'es-ES': 'De nada。', 'it-IT': 'Prego。',
      'id-ID': 'Sama-sama。', 'en-US': 'You are welcome.',
    }
  },

  // Customer Section Phrases
  { type: 'customer', category: 'General Assistance', english: 'How do I renew my borrowed items?',
    translations: {
      'zh-CN': '我如何续借我的借阅物品？', 'zh-HK': '我點樣續借我借嘅嘢？', 'ne-NP': 'मैले मेरो उधारो सामानहरू कसरी नवीकरण गर्ने?',
      'el-GR': 'Πώς ανανεώνω τα δανεισμένα μου αντικείμενα？', 'ar-SA': 'كيف يمكنني تجديد العناصر المستعارة؟', 'mk-MK': 'Како да ги обновам позајмените предмети？',
      'es-ES': '¿Cómo renuevo mis artículos prestados？', 'it-IT': 'Come posso rinnovare i miei articoli presi in prestito？',
      'id-ID': 'Bagaimana cara memperpanjang peminjaman barang-barang ini？', 'en-US': 'How do I renew my borrowed items?',
    }
  },
  { type: 'customer', category: 'Transactional', english: 'I do not have a library card.',
    translations: {
      'zh-CN': '我没有借书证。', 'zh-HK': '我冇圖書證。', 'ne-NP': 'मसँग पुस्तकालय कार्ड छैन।',
      'el-GR': 'Δεν έχω κάρτα βιβλιοθήκης。', 'ar-SA': 'ليس لدي بطاقة مكتبة。', 'mk-MK': 'Немам библиотечна картичка।',
      'es-ES': 'No tengo tarjeta de la biblioteca。', 'it-IT': 'Non ho una tessera della biblioteca。',
      'id-ID': 'Saya tidak punya kartu perpustakaan。', 'en-US': 'I do not have a library card.',
    }
  },
  { type: 'customer', category: 'Transactional', english: 'I would like to sign up for a library card.',
    translations: {
      'zh-CN': '我想办理一张借书证。', 'zh-HK': '我想申請圖書證。', 'ne-NP': 'म पुस्तकालय कार्ड बनाउन चाहन्छु।',
      'el-GR': 'Θα ήθελα να κάνω αίτηση για κάρτα βιβλιοθήκης。', 'ar-SA': 'أود التسجيل للحصول على بطاقة مكتبة۔', 'mk-MK': 'Би сакам да се регистрирам за библиотечна картичка।',
      'es-ES': 'Me gustaría registrarme para una tarjeta de la biblioteca。', 'it-IT': 'Vorrei registrarmi per una tessera della biblioteca।',
      'id-ID': 'Saya ingin mendaftar untuk kartu perpustakaan。', 'en-US': 'I would like to sign up for a library card.',
    }
  },
  { type: 'customer', category: 'Language & Community Resources', english: 'Is there anyone here who can speak Cantonese?',
    translations: {
      'zh-CN': '这里有会说粤语的人吗？', 'zh-HK': '呢度有冇人識講廣東話？', 'ne-NP': 'यहाँ क्यान्टोनिज बोल्न सक्ने कोही छ?',
      'el-GR': 'Υπάρχει κάποιος εδώ που μιλάει Καντονέζικα？', 'ar-SA': 'هل هناك أحد هنا يتحدث الكانتونية؟', 'mk-MK': 'Дали има некој тука што зборува кантонски？',
      'es-ES': '¿Hay alguien aquí que hable cantonés？', 'it-IT': 'C\'è qualcuno qui che parla cantonese？',
      'id-ID': 'Apakah ada yang bisa berbicara Kanton di sini？', 'en-US': 'Is there anyone here who can speak Cantonese?',
    }
  },
];



// User status functions
function checkUserStatus() {
    // Simulate checking user status
    setTimeout(() => {
        const userIdElement = document.getElementById('userId');
        if (userIdElement) {
            userIdElement.textContent = 'GR12345';
        }
    }, 1000);
}

function setCurrentMode(mode) {
    setMode(mode);
}



function hideLanguageChoicePopup() {
    // Placeholder function - can be implemented later
    console.log('Hiding language choice popup...');
}

// Initialize the application
function init() {
  populateLanguageSelects();
  populateCategoryFilter();
  updatePhrases();
}

// Populate language selection buttons
function populateLanguageSelects() {
  const staffLanguageButtons = document.getElementById('staffLanguageButtons');
  const customerLanguageButtons = document.getElementById('customerLanguageButtons');
  
  if (!staffLanguageButtons || !customerLanguageButtons) return;
  
  // Clear existing buttons
  staffLanguageButtons.innerHTML = '';
  customerLanguageButtons.innerHTML = '';
  
  // Define the language order matching the image (8 in top row, 2 in bottom row)
  const languageOrder = ['Mandarin', 'Cantonese', 'Nepali', 'Greek', 'Arabic', 'Macedonian', 'Spanish', 'Italian', 'Indonesian'];
  
  // Create language buttons for staff
  // Top row - 8 buttons
  const staffTopRow = document.createElement('div');
  staffTopRow.className = 'flex flex-wrap justify-center gap-1 mb-2';
  
  languageOrder.forEach(lang => {
    const button = document.createElement('button');
    button.textContent = lang; // Simplified text without native names
    button.className = `language-button ${lang === staffLanguage ? 'language-button-active' : 'language-button-inactive'}`;
    
    button.onclick = () => {
      staffLanguage = lang;
      populateLanguageSelects();
      updatePhrases();
    };
    
    staffTopRow.appendChild(button);
  });
  
  // Bottom row - 1 button (English only)
  const staffBottomRow = document.createElement('div');
  staffBottomRow.className = 'flex flex-wrap justify-center gap-1';
  
  // English button
  const englishButton = document.createElement('button');
  englishButton.textContent = 'English';
  englishButton.className = `language-button ${staffLanguage === 'English' ? 'language-button-active' : 'language-button-inactive'}`;
  englishButton.onclick = () => {
    staffLanguage = 'English';
    populateLanguageSelects();
    updatePhrases();
  };
  
  staffBottomRow.appendChild(englishButton);
  
  staffLanguageButtons.appendChild(staffTopRow);
  staffLanguageButtons.appendChild(staffBottomRow);
  
  // Create language buttons for customer
  // Top row - 8 buttons
  const customerTopRow = document.createElement('div');
  customerTopRow.className = 'flex flex-wrap justify-center gap-1 mb-2';
  
  languageOrder.forEach(lang => {
    const button = document.createElement('button');
    button.textContent = lang; // Simplified text without native names
    button.className = `language-button ${lang === customerLanguage ? 'language-button-active' : 'language-button-inactive'}`;
    
    button.onclick = () => {
      customerLanguage = lang;
      populateLanguageSelects();
      updatePhrases();
    };
    
    customerTopRow.appendChild(button);
  });
  
  // Bottom row - 1 button (English only)
  const customerBottomRow = document.createElement('div');
  customerBottomRow.className = 'flex flex-wrap justify-center gap-1';
  
  // English button
  const customerEnglishButton = document.createElement('button');
  customerEnglishButton.textContent = 'English';
  customerEnglishButton.className = `language-button ${customerLanguage === 'English' ? 'language-button-active' : 'language-button-inactive'}`;
  customerEnglishButton.onclick = () => {
    customerLanguage = 'English';
    populateLanguageSelects();
    updatePhrases();
  };
  
  customerBottomRow.appendChild(customerEnglishButton);
  
  customerLanguageButtons.appendChild(customerTopRow);
  customerLanguageButtons.appendChild(customerBottomRow);
}

// Populate category filter buttons
function populateCategoryFilter() {
  const staffCategoryButtons = document.getElementById('staffCategoryButtons');
  const customerCategoryButtons = document.getElementById('customerCategoryButtons');
  
  if (!staffCategoryButtons || !customerCategoryButtons) return;
  
  // Clear existing buttons
  staffCategoryButtons.innerHTML = '';
  customerCategoryButtons.innerHTML = '';
  
  // Create "All" button for staff
  const allStaffButton = document.createElement('button');
  allStaffButton.textContent = 'All Categories';
  allStaffButton.className = staffSubcategoryFilter === 'All' ? 'staff-category-button-active' : 'staff-category-button-inactive';
  
  allStaffButton.onclick = () => {
    staffSubcategoryFilter = 'All';
    populateCategoryFilter();
    updatePhrases();
  };
  
  staffCategoryButtons.appendChild(allStaffButton);
  
  // Create category buttons for staff
  STAFF_CATEGORY_ORDER.forEach(category => {
    const button = document.createElement('button');
    button.textContent = category;
    button.className = category === staffSubcategoryFilter ? 'staff-category-button-active' : 'staff-category-button-inactive';
    
    button.onclick = () => {
      staffSubcategoryFilter = category;
      populateCategoryFilter();
      updatePhrases();
    };
    
    staffCategoryButtons.appendChild(button);
  });
  
  // Create "All" button for customer
  const allCustomerButton = document.createElement('button');
  allCustomerButton.textContent = 'All Categories';
  allCustomerButton.className = customerSubcategoryFilter === 'All' ? 'customer-category-button-active' : 'customer-category-button-inactive';
  
  allCustomerButton.onclick = () => {
    customerSubcategoryFilter = 'All';
    populateCategoryFilter();
    updatePhrases();
  };
  
  customerCategoryButtons.appendChild(allCustomerButton);
  
  // Create category buttons for customer
  CUSTOMER_CATEGORY_ORDER.forEach(category => {
    const button = document.createElement('button');
    button.textContent = category;
    button.className = category === customerSubcategoryFilter ? 'customer-category-button-active' : 'customer-category-button-inactive';
    
    button.onclick = () => {
      customerSubcategoryFilter = category;
      populateCategoryFilter();
      updatePhrases();
    };
    
    customerCategoryButtons.appendChild(button);
  });
}

// Set mode (staff/customer)
function setMode(mode) {
  currentMode = mode;
  
  // Update UI
  const staffBtn = document.getElementById('staffModeBtn');
  const customerBtn = document.getElementById('customerModeBtn');
  const staffSection = document.getElementById('staffSection');
  const customerSection = document.getElementById('customerSection');
  
  if (staffBtn && customerBtn) {
    if (mode === 'staff') {
      staffBtn.className = 'button-base mt-2 button-primary-active';
      customerBtn.className = 'button-base mt-2 button-accent-inactive';
      if (staffSection) staffSection.style.display = 'block';
      if (customerSection) customerSection.style.display = 'none';
    } else {
      staffBtn.className = 'button-base mt-2 button-primary-inactive';
      customerBtn.className = 'button-base mt-2 button-accent-active';
      if (staffSection) staffSection.style.display = 'none';
      if (customerSection) customerSection.style.display = 'block';
    }
  }
  
  // Update category filter
  populateCategoryFilter();
  
  // Reset category filter to 'All'
  if (currentMode === 'staff') {
    staffSubcategoryFilter = 'All';
  } else {
    customerSubcategoryFilter = 'All';
  }
  
  updatePhrases();
}

// Update phrases display
function updatePhrases() {
  const container = document.getElementById('phraseContainer');
  if (!container) return;
  
  const filteredPhrases = getFilteredPhrases();
  
  // Group phrases by category
  const phrasesByCategory = {};
  filteredPhrases.forEach(phrase => {
    if (!phrasesByCategory[phrase.category]) {
      phrasesByCategory[phrase.category] = [];
    }
    phrasesByCategory[phrase.category].push(phrase);
  });
  
  // Sort categories based on current mode
  const categoryOrder = currentMode === 'staff' ? STAFF_CATEGORY_ORDER : CUSTOMER_CATEGORY_ORDER;
  const sortedCategories = categoryOrder.filter(cat => phrasesByCategory[cat]);
  
  container.innerHTML = sortedCategories.map(category => `
    <div class="mb-8">
      <h2 class="text-3xl md:text-4xl font-bold mb-6 pb-2 border-b-2 text-center" style="color: #007A70; border-color: #00A99D;">
        ${category}
      </h2>
      <div class="phrase-list-grid">
        ${phrasesByCategory[category].map((phrase, index) => `
          <div class="phrase-card">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <p class="text-base font-medium text-gray-900 mb-2">${phrase.english}</p>
                <p class="text-lg font-semibold text-teal-700">
                  ${phrase.translations[LANGUAGE_CODES[currentMode === 'staff' ? staffLanguage : customerLanguage]?.code] || phrase.english}
                </p>
              </div>
              <button
                onclick="speakPhrase('${phrase.translations[LANGUAGE_CODES[currentMode === 'staff' ? staffLanguage : customerLanguage]?.code] || phrase.english}', '${LANGUAGE_CODES[currentMode === 'staff' ? staffLanguage : customerLanguage]?.code}')"
                class="speaker-button"
                title="Play audio"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                </svg>
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
}

// Filter phrases based on current mode and category
function getFilteredPhrases() {
  let filtered = initialPhrases.filter(phrase => phrase.type === currentMode);
  
  if (currentMode === 'staff' && staffSubcategoryFilter !== 'All') {
    filtered = filtered.filter(phrase => phrase.category === staffSubcategoryFilter);
  } else if (currentMode === 'customer' && customerSubcategoryFilter !== 'All') {
    filtered = filtered.filter(phrase => phrase.category === customerSubcategoryFilter);
  }
  
  return filtered;
}

// Speech synthesis function
function speakPhrase(text, languageCode) {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = languageCode;
    utterance.rate = 0.8;
    speechSynthesis.speak(utterance);
  }
}

// Show QR popup
function showQrPopup() {
  const popup = document.getElementById('qrPopup');
  const qrPrompt = document.getElementById('qrPrompt');
  const centrelinkMap = document.getElementById('centrelinkMap');
  const qrCodeImage = document.getElementById('qrCodeImage');
  
  if (!popup || !qrPrompt || !centrelinkMap || !qrCodeImage) return;
  
  // Update prompt with current language
  const currentLang = currentMode === 'staff' ? staffLanguage : customerLanguage;
  qrPrompt.textContent = `Scan this QR code for Google Maps directions (in ${currentLang}):`;
  
  // Update map iframe with language
  const languageCode = LANGUAGE_CODES[currentLang]?.code || 'en-US';
  const mapsEmbedUrl = `https://www.google.com/maps/embed/v1/directions?key=&origin=Hurstville+Library,+12-16+MacMahon+St,+Hurstville+NSW+2220,+Australia&destination=Centrelink+Hurstville,+125+Forest+Rd,+Hurstville+NSW+2220,+Australia&mode=driving&language=${languageCode}`;
  centrelinkMap.src = mapsEmbedUrl;
  
  // Update QR code with language
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=12-16%20MacMahon%20St,%20Hurstville%20NSW%202220,%20Australia&destination=125%20Forest%20Rd,%20Hurstville%20NSW%202220,%20Australia&travelmode=driving&hl=${languageCode}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(mapsUrl)}`;
  qrCodeImage.src = qrCodeUrl;
  
  popup.style.display = 'flex';
}

// Hide QR popup
function hideQrPopup() {
  const popup = document.getElementById('qrPopup');
  if (popup) {
    popup.style.display = 'none';
  }
}



// Add event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  init();
  checkUserStatus();
  
  // Close QR popup when clicking outside
  const qrPopup = document.getElementById('qrPopup');
  if (qrPopup) {
    qrPopup.addEventListener('click', function(e) {
      if (e.target === this) {
        hideQrPopup();
      }
    });
  }
});

