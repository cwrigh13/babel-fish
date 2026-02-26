// Define a custom order for staff categories
export const STAFF_CATEGORY_ORDER = [
  'General Enquiries',
  'Transactional',
  'Digital Services',
];

// Define a custom order for customer categories
export const CUSTOMER_CATEGORY_ORDER = [
  'General Assistance',
  'Transactional',
  'Library Layout',
  'Language & Community Resources',
  'Digital Services',
];

// Mapping of display names to BCP-47 language codes for SpeechSynthesisUtterance
export const LANGUAGE_CODES = {
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

// Custom brand colours (approximated from the Georges River Council website)
export const brandColors = {
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
export const centrelinkMapsEmbedUrl = "https://www.google.com/maps/embed/v1/directions?key=&origin=Hurstville+Library,+12-16+MacMahon+St,+Hurstville+NSW+2220,+Australia&destination=Centrelink+Hurstville,+125+Forest+Rd,+Hurstville+NSW+2220,+Australia&mode=driving&language=zh-CN";

// Standard Google Maps directions URL for QR code linking
export const centrelinkMapsUrl = "https://www.google.com/maps/dir/?api=1&origin=12-16%20MacMahon%20St,%20Hurstville%20NSW%202220,%20Australia&destination=125%20Forest%20Rd,%20Hurstville%20NSW%202220,%20Australia&travelmode=driving&hl=zh-CN";

// QR Code API URL (using a free public service) - Increased size to 200x200
export const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(centrelinkMapsUrl)}`;

// Translations for QR Code prompt
export const QR_PROMPT_TRANSLATIONS = {
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
export const CLICK_FOR_OPTIONS_PROMPT_TRANSLATIONS = {
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