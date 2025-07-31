import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, addDoc, query, getDocs } from 'firebase/firestore';

// Ensure __app_id and __firebase_config are defined in the environment
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};

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

// Initial phrases for seeding the database
const initialPhrases = [
  // Staff Section Phrases
  { type: 'staff', category: 'General Enquiries', english: 'Please follow me.',
    translations: {
      'zh-CN': '请跟我来。', 'zh-HK': '请跟我来。', 'ne-NP': 'कृपया मलाई पछ्याउनुहोस्。',
      'el-GR': 'Παρακαλώ ακολουθήστε με。', 'ar-SA': 'الرجاء اتبعني。', 'mk-MK': 'Ве мо lám следете me。',
      'es-ES': 'Por favor, sígame。', 'it-IT': 'Per favor, mi segua。',
      'id-ID': 'Tolong ikiti saya。', 'en-US': 'Please follow me.',
    }
  },
  { type: 'staff', category: 'General Enquiries', english: 'Do you prefer to speak Mandarin or Cantonese?', // Base English text
    translations: {
      'zh-CN': '您更喜欢说普通话还是粤语？', // Mandarin translation
      'zh-HK': '你鍾意講普通話定廣東話？', // Cantonese translation
      'ne-NP': 'तपाईं मन्डारिन वा क्यान्टोनिज बोल्न रुचाउनुहुन्छ?',
      'el-GR': 'Προτιμάτε να μιλάτε Μανδαarinika ή Καντονέζικα？',
      'ar-SA': 'هل تفضل التحدث بالماندرين أو الكانتونية？',
      'mk-MK': 'Дали преتpočitate να зборувате μαндаринiski or кантонски？',
      'es-ES': '¿Prefiere hablar mandarín o cantonés？', 'it-IT': 'Preferisce parlare mandarino or cantonese？',
      'id-ID': 'Apakah Anda more like to speak Mandarin or Kanton？',
      'en-US': 'Do you prefer to speak Mandarin or Cantonese?',
    }
  },
  { type: 'staff', category: 'General Enquiries', english: 'I speak Mandarin.',
    translations: {
      'zh-CN': '我会说普通话。', // Mandarin spelling
      'zh-HK': '我識講普通話。', // Traditional Chinese for Mandarin
      'ne-NP': 'म मन्डारिन बोल्छु。',
      'el-GR': 'Μιλάω Μανδαρινικά。', 'ar-SA': 'أنا أتحدث المανταрин。', 'mk-MK': 'Зboruam μαндаρινiski。',
      'es-ES': 'Hablo mandarín。', 'it-IT': 'Parlo mandarino。',
      'id-ID': 'Saya berbicara Mandarin。', 'en-US': 'I speak Mandarin.',
    }
  },
  { type: 'staff', category: 'General Enquiries', english: 'I speak Cantonese.',
    translations: {
      'zh-CN': '我会说粤语。', // Simplified Chinese for Cantonese
      'zh-HK': '我識講廣東話。', // Cantonese spelling (Traditional Chinese)
      'ne-NP': 'म क्यान्टोनिज बोल्छु。',
      'el-GR': 'Μιλάω Καντονέζικα。', 'ar-SA': 'أنا أتحدث الكانتونية。', 'mk-MK': 'Зoruam кантонски。',
      'es-ES': 'Hablo cantonés。', 'it-IT': 'Parlo cantonese。',
      'id-ID': 'Saya berbicara Kanton。', 'en-US': 'I speak Cantonese.',
    }
  },
  { type: 'staff', category: 'General Enquiries', english: 'Please wait one moment',
    translations: {
      'zh-CN': '请稍等片刻。', 'zh-HK': '请你稍等一陣。', 'ne-NP': 'कृपया एक क्षण पर्खनुहोस्。',
      'el-GR': 'Παρακαλώ περιμένετε μια στιγμή。', 'ar-SA': 'الرجاء الانت 기다리다。', 'mk-MK': 'Ве моlam počekajte moment。',
      'es-ES': 'Por favor, espere un momento。', 'it-IT': 'Per favor, aspetti un momento。',
      'id-ID': 'Mohon tunggu sebentar。', 'en-US': 'Please wait one moment',
    }
  },
  { type: 'staff', category: 'General Enquiries', english: 'I understand.',
    translations: {
      'zh-CN': '我明白了。', 'zh-HK': '我明白喇。', 'ne-NP': 'मैले बुझें。',
      'el-GR': 'Καταλαβαίνω。', 'ar-SA': 'أنا أفهم。', 'mk-MK': 'Разбирам。',
      'es-ES': 'Entiendo。', 'it-IT': 'Capisco。',
      'id-ID': 'Saya mengerti。', 'en-US': 'I understand.',
    }
  },
  { type: 'staff', category: 'General Enquiries', english: 'Thank you.',
    translations: {
      'zh-CN': '谢谢您。', 'zh-HK': '多謝你。', 'ne-NP': 'धन्यवाद。',
      'el-GR': 'Ευχαριστώ。', 'ar-SA': 'شكرا لك。', 'mk-MK': 'Ви благоδαρουμε。',
      'es-ES': 'Salamat po。', 'it-IT': 'Grazie。',
      'id-ID': 'Terima kindness。', 'en-US': 'Thank you.',
    }
  },
  { type: 'staff', category: 'General Enquiries', english: 'You are welcome.',
    translations: {
      'zh-CN': '不客气。', 'zh-HK': '唔使客氣。', 'ne-NP': 'तपाईंलाई स्वागत छ。',
      'el-GR': 'Παρακαλώ。', 'ar-SA': 'على الرحب والسعة。', 'mk-MK': 'Неμα na што。',
      'es-ES': 'De nada。', 'it-IT': 'Prego。',
      'id-ID': 'Sama-sama。', 'en-US': 'You are welcome.',
    }
  },

  { type: 'staff', category: 'Transactional', english: 'Please show me your library card',
    translations: {
      'zh-CN': '请出示您的借书证', 'zh-HK': '请出示你的图书证。', 'ne-NP': 'कृपया आफ्नो पुस्तकालय कार्ड देखाउनुहोस्。',
      'el-GR': 'Παρακαλώ δείξτε μου την κάρτα βιβλιοθήκης σας。', 'ar-SA': 'الرجاء إظهار بطاقة المكتبة الخاصة بك。', 'mk-MK': 'Ве мо lám pokažete mi ja vašata bibliotečna kartička。',
      'es-ES': 'Por favor, muéstreme su tarjeta de la biblioteca。', 'it-IT': 'Per favor, mi mostri la sua tessera della biblioteca。',
      'id-ID': 'Tolong tunjukkan kartu perpustakaan Anda。', 'en-US': 'Please show me your library card',
    }
  },
  { type: 'staff', category: 'Transactional', english: 'Would you like to create a library card? It is free of charge.',
    translations: {
      'zh-CN': '您想办一张借书证吗？这是免费的。', 'zh-HK': '你想申请张图书证吗？系免费嘅。', 'ne-NP': 'के तपाईं पुस्तकालय कार्ड बनाउन चाहनुहुन्छ? यो निःशुल्क छ。',
      'el-GR': 'Θα θέлаτε να βγάλετε κάρτα βιβλιοθήκης; Είναι δω ücretsiz。', 'ar-SA': 'هل ترغب في إنشاء بطاقة مكتبة？إنها مجانية。', 'mk-MK': 'Даli сакате da napravite bibliotečna kartička? Besplatno e。',
      'es-ES': '¿Le gustaría crear una tarjeta de la biblioteca? Es gratis。', 'it-IT': 'Le piacerebbe creare una tessera della biblioteca? È gratuita。',
      'id-ID': 'Apakah Anda ingin membuat kartu perpustakaan? This is free of charge。', 'en-US': 'Would you like to create a library card? It is free of charge.',
    }
  },
  { type: 'staff', category: 'Transactional', english: 'Would you like to borrow these items?',
    translations: {
      'zh-CN': '您想借阅这些物品吗？', 'zh-HK': '你想借呢啲嘢嗎？', 'ne-NP': 'के तपाईं यी सामानहरू उधारो लिन चाहनुहुन्छ?',
      'el-GR': 'Θα θέлаτε να δανειστείτε αυτά τα αντικείμενα？', 'ar-SA': 'هل ترغب في استعارة هذه المواد？', 'mk-MK': 'Дали сакате da gi pozajmite ovie predmeti？',
      'es-ES': '¿Le gustaría pedir prestados estos artículos？', 'it-IT': 'Le piacerebbe prendre in prestito these items？',
      'id-ID': 'Apakah Anda ingin meminjam barang-abag this？', 'en-US': 'Would you like to borrow these items?',
    }
  },
  { type: 'staff', category: 'Transactional', english: 'Would you like to return these items?',
    translations: {
      'zh-CN': '您想归还这些物品吗？', 'zh-HK': '你想还呢啲嘢嗎？', 'ne-NP': 'के तपाईं यी सामानहरू फिर्ता गर्न चाहnuहुन्छ?',
      'el-GR': 'Θα θέлаτε να επιστρέσετε αυτά τα αντικείμενα？', 'ar-SA': 'هل ترغب في إرجάζ هذه المواد？', 'mk-MK': 'Даli сакате da gi vratite ovie predmeti？',
      'es-ES': '¿Le gustaría devolver estos artículos？', 'it-IT': 'Le piacerebbe restituire estos artículos？',
      'id-ID': 'Apakah 您 want to return these items？', 'en-US': 'Would you like to return these items?',
    }
  },
  { type: 'staff', category: 'Transactional', english: 'The due date is listed on the library receipt.',
    translations: {
      'zh-CN': '还书日期在图书馆收据上列明。', 'zh-HK': '还书日期喺图书馆收据上面。', 'ne-NP': 'फिर्ता गर्ने मिति पुस्तकालयको रसिदमा उल्लेख छ。',
      'el-GR': 'Η ημερομηνία λήξης αναγράφεται στην απόδειψη της βιβλιοθήκης。', 'ar-SA': 'تاريخ الاستحقác مدرg على إيصال المكتبة。', 'mk-MK': 'Крајniot rok e naveden на sметката od bibliotekata。',
      'es-ES': 'La fecha de vencimiento está en the recibo de la biblioteca。', 'it-IT': 'La data di scadencia is indicata sulla ricevuta della biblioteca。',
      'id-ID': 'Tanggal jatuh tempo tertera di struk perpustakaan。', 'en-US': 'The due date is listed on the library receipt.',
    }
  },
  { type: 'staff', category: 'Transactional', english: 'There is a fee for late and lost items.',
    translations: {
      'zh-CN': '逾期或遗失物品需支付費用。', 'zh-HK': '逾期或者遗失物品要收费。', 'ne-NP': 'ढिलो र हराएका सामानहरूको लागि शुल्क लाग्छ。',
      'el-GR': 'Υπάρχει χρέωση για καθυστερημένα και χαμένα αντικείμενα。', 'ar-SA': 'هناك رسوم على المواد المتأخرة والمفقودة。', 'mk-MK': 'Има надомест за zaдоצnezi i izgubeni predmeti。',
      'es-ES': 'Hay una tarifa por artículos atrasados y perdidos。', 'it-IT': 'C\'è una tassa for gli artículos in ritardo και smarriti。',
      'id-ID': 'Ada biaya for barang yang terlambat and hilang。', 'en-US': 'There is a fee for late and lost items.',
    }
  },
  { type: 'staff', category: 'Transactional', english: 'Your library card has expired. May I please see your photo identification so I may confirm your details.',
    translations: {
      'zh-CN': '您的借书证已过期。请出示您的带照片的身份证明，以便我确认您的信息。', 'zh-HK': '你嘅图书证过期喇。请出示你嘅有相身份证明，等我确认你嘅资料。', 'ne-NP': 'तपाईंको पुस्तकालय कार्ड म्याद सकिएको छ। कृपया तपाईंको फोटो परिचयपत्र देखाउनुहोस् ताकि म तपाईंको विवरणहरू पुष्टि गर्न सकूँ。',
      'el-GR': 'Η κάρτα βιβλιοθήκης σας έχει λήξη. Μπορώ να δω την ταυτότητά σας με φωτογραφία για να επιβεβαιώσω τα στοιχεία σας？', 'ar-SA': 'انتهت صلاحية بطاقة مكتبتك. هل يمكنني رؤية إثبات هويتك المصور لتأكيد التفاصيل الخاصة بك？', 'mk-MK': 'Vašata bibliotečna kartička e istekana. Može li da vidam lična karta so fotografija za da gi potvrdiam vašite podatoci？',
      'es-ES': 'Su tarjeta de la biblioteca ha caducado. ¿Puedo ver su identificación con foto para confirmar sus datos？', 'it-IT': 'La sua tessera della biblioteca is scaduta. Posso vedere un suo documento d\'identità με φωτογραφία para confirmar sus datos？',
      'id-ID': 'Kartu perpustakaan Anda sudah kedaluwarsa. Bisakah I see your photo identification so I may confirm your details？', 'en-US': 'Your library card has expired. May I please see your photo identification so I may confirm your details.',
    }
  },
  { type: 'staff', category: 'Transactional', english: 'May I see your photo ID to confirm details? If no photo ID, a passport plus a bank statement or phone bill copy is needed.',
    translations: {
      'zh-CN': '请出示您的带照片的身份证明以确认信息。如果没有带照片的身份证明，需要护照以及银行账单或电话账单的复印件。', 'zh-HK': '请出示你嘅有相身份证明嚟确认资料。如果冇有相身份证明，需要护照同埋银行月结单或者电话费单副本。', 'ne-NP': 'विवरण पुष्टि गर्नका लागि फोटो परिचयपत्र देखाउन सक्नुहुन्छ? यदि फोटो परिचयपत्र छैन भने, राहदानी र बैंक स्टेटमेन्ट वा फोन billको प्रतिलिलिपी चाहिन्छ。',
      'el-GR': 'Μπορώ να δω την ταυτότητά σας με φωτογραφία για επιβεβαίωση στοιχείων; Εάν δεν έχετε ταυτότητα με φωτογραφία, χρειάζεται διαβατήριο συν αντίγραφο τραπεζικής κατάσης ή λογαριασμού τηλεφώνου。', 'ar-SA': 'هل يمكنني رؤية هويتك المصورة لتأكيد التفاصيل？إذا لم يكن لديك هوية مصورة， فجواز سفر بالإضافة إلى كشف حساب بنكي أو فاتورة هاتف ضروريان.', 'mk-MK': 'Моże li da vidam lična karta so fotografija za potvrda na podatoci? Ako nemaate lična karta so fotografija, potreben e pasport plus kopija od bankarski izvod ili telefonska smetka。',
      'es-ES': '¿Puedo ver su identificación con foto para confirmar los details? If no photo ID, a passport plus a bank statement or phone bill copy is needed.', 'it-IT': 'Posso vedere un suo documento d\'identità με φωτογραφία para επιβεβαίωση στοιχείων; Εάν δεν έχετε ταυτότητα με φωτογραφία, χρειάζεται διαβατήριο συν αντίγραφο τραπεζικής κατάσης ή λογαριασμού τηλεφώνου。',
      'id-ID': 'Bisakah saya melihat ID foto Anda untuk mengonfirm details? If no photo ID, a passport plus a bank statement or phone bill copy is needed.', 'en-US': 'May I see your photo ID to confirm details? If no photo ID, a passport plus a bank statement or phone bill copy is needed.',
    }
  },

  { type: 'staff', category: 'Digital Services', english: 'Would you like to use the internet?',
    translations: {
      'zh-CN': '您想使用互联网吗？', 'zh-HK': '你想用上网吗？', 'ne-NP': 'के तपाईं इन्टरनेट प्रयोग गर्न चाहनुहुन्छ?',
      'el-GR': 'Θα θέлаτε να χρησιμοποιήσετε το διαδίκτυο？', 'ar-SA': 'هل ترغب في استخدام الإنترنت？', 'mk-MK': 'Дали сакате to κοριστε internet？',
      'es-ES': '¿Le gustaría usar internet？', 'it-IT': 'Le piacerebbe usar internet？',
      'id-ID': 'Apakah 您 want to use internet？', 'en-US': 'Would you like to use the internet?',
    }
  },
  { type: 'staff', category: 'Digital Services', english: 'Do you need help using the internet?',
    translations: {
      'zh-CN': '您需要使用互联网的帮助吗？', 'zh-HK': '你需要上网嘅帮助吗？', 'ne-NP': 'के तपाईंलाई इन्टरनेट प्रयोग गर्न मद्दत चाहिन्छ?',
      'el-GR': 'Χρειάζεστε βοήθεια με τη χρήση του διαδικτύου？', 'ar-SA': 'هل تحتاج مساعدة في استخدام الإنترنت？', 'mk-MK': 'Даli vi треба pomoš за κοριστε internet？',
      'es-ES': '¿Necesita ayuda para usar internet？', 'it-IT': 'Ha bisogno of help for usar internet？',
      'id-ID': 'Apakah 您 butuh bantuan using internet？', 'en-US': 'Do you need help using the internet?',
    }
  },
  { type: 'staff', category: 'Digital Services', english: 'Would you like to use the printer?',
    translations: {
      'zh-CN': '您想使用打印机吗？', 'zh-HK': '你想用打印机吗？', 'ne-NP': 'के तपाईं प्रिन्टर प्रयोग गर्न चाहनुहुन्छ?',
      'el-GR': 'Θα θέλατε να χρησιμοποιήσετε τον εκτυπωτή？', 'ar-SA': 'هل ترغب في استخدام الطابعة？', 'mk-MK': 'Дали сакате da go koristite pečatačот？',
      'es-ES': '¿Le gustaría usar la impresora？', 'it-IT': 'Le piacerebbe usar la stampante？',
      'id-ID': 'Apakah 您 want to use printer？', 'en-US': 'Would you like to use the printer?',
    }
  },
  { type: 'staff', category: 'Digital Services', english: 'Do you need help using the printer?',
    translations: {
      'zh-CN': '您需要使用打印机使用方面的帮助吗？', 'zh-HK': '你需要打印机嘅帮助吗？', 'ne-NP': 'मलाई प्रिन्टर प्रयोग गर्न मद्दत चाहिन्छ。',
      'el-GR': 'Χρειάζεστε βοήθεια με τη χρήση του εκτυπωτή？', 'ar-SA': 'هل تحتاج مساعدة في استخدام الطابعة？', 'mk-MK': 'Даli vi треба pomoš за κοrisenje на pečatačот？',
      'es-ES': '¿Necesita ayuda para usar la impresora？', 'it-IT': 'Ha bisogno de aiuto for usar la stampante？',
      'id-ID': 'Apakah 您 butuh bantuan using printer？', 'en-US': 'Do you need help using the printer?',
    }
  },
  { type: 'staff', category: 'Digital Services', english: 'How many copies do you need?',
    translations: {
      'zh-CN': '您需要多少份？', 'zh-HK': '你需要几多份？', 'ne-NP': 'तपाईंलाई कति प्रति चाहिन्छ?',
      'el-GR': 'Πόσα αντίγραφα χρειάζεστε？', 'ar-SA': 'كم عدد النسسख التي تحتاجها？', 'mk-MK': 'Коmčine pečatenjeto？',
      'es-ES': '¿Cuántas copias necesita？', 'it-IT': 'Quante copies le servono？',
      'id-ID': 'Berapa many copies do you need？', 'en-US': 'How many copies do you need?',
    }
  },

  // Customer Section Phrases
  { type: 'customer', category: 'General Assistance', english: 'How do I renew my borrowed items?',
    translations: {
      'zh-CN': '我如何续借我的借阅物品？', 'zh-HK': '我点样续借我借嘅嘢？', 'ne-NP': 'मैले मेरो उधारो सामानहरू कसरी नवीकरण गर्ने?',
      'el-GR': 'Πώς ανανεώνω τα δανεισμένα μου αντικείμενα？', 'ar-SA': 'كيف can I renew my borrowed items？', 'mk-MK': 'Каको da gi obnovaam pozajmenite predmeti？',
      'es-ES': '¿Cómo renuevo mis artículos prestados？', 'it-IT': 'Come posso rinnovare i miei artículos pris in prestito？',
      'id-ID': 'Bagaimana cara memperpanjang peminjaman barang-abag this？', 'en-US': 'How do I renew my borrowed items?',
    }
  },
  { type: 'customer', category: 'Transactional', english: 'I do not have a library card.',
    translations: {
      'zh-CN': '我没有借书证。', 'zh-HK': '我冇图书证。', 'ne-NP': 'मसँग पुस्तकालय कार्ड छैन。',
      'el-GR': 'Δεν έχω κάρτα βιβλιοθήκης。', 'ar-SA': 'ليس لدي بطاقة مكتبة。', 'mk-MK': 'Немам бібліотечна картичка。',
      'es-ES': 'No tengo tarjeta de la biblioteca。', 'it-IT': 'Non ho una tessera della biblioteca。',
      'id-ID': 'Saya tidak punya kartu perpustaraan。', 'en-US': 'I do not have a library card.',
    }
  },
  { type: 'customer', category: 'Transactional', english: 'I would like to sign up for a library card.',
    translations: {
      'zh-CN': '我想办理一张借书证。', 'zh-HK': '我想申请图书证。', 'ne-NP': 'म पुस्तकालय कार्ड बनाउन चाहन्छु。',
      'el-GR': 'Θα ήθελα να εγγραφώ για κάρτα βιβλιοθήκης。', 'ar-SA': 'أود التسجيل للحصول على بطاقة مكتبة。', 'mk-MK': 'Би сакал da se začlenam for bibliotečna kartička。',
      'es-ES': 'Me gustaría solicitar una tarjeta de la biblioteca。', 'it-IT': 'Vorrei iscrivermi per una tessera della biblioteca。',
      'id-ID': 'Saya ingin mendaftar kartu perpustakaan。', 'en-US': 'I would like to sign up for a library card.',
    }
  },
  { type: 'customer', category: 'Transactional', english: 'How much does it cost to join the library?',
    translations: {
      'zh-CN': '加入图书馆需要多少钱？', 'zh-HK': '加入图书馆要几多钱？', 'ne-NP': 'पुस्तकालयमा सामेल हुन कति लाग्छ?',
      'el-GR': 'Πόσο κοسτίζει η εγγραφή στη βιβλιοθήκη？', 'ar-SA': 'كم تكلفة الانضمณ إلى المكتبة？', 'mk-MK': 'Коmčine začlenuvanjeto vo bibliotekata？',
      'es-ES': '¿Cuánto cuesta hacerse socio de la biblioteca？', 'it-IT': 'Quanto costa iscriversi in biblioteca？',
      'id-ID': 'Berapa biaya for bergabung with perpustakaan？', 'en-US': 'How much does it cost to join the library?',
    }
  },
  { type: 'customer', category: 'General Assistance', english: 'Can you assist me with reserving an item?',
    translations: {
      'zh-CN': '您可以帮我预订物品吗？', 'zh-HK': '你可唔可以帮我预留一件物品？', 'ne-NP': 'के तपाईं मलाई कुनै वस्तु आरक्षित गर्न मद्दत गर्न सक्नुहुन्छ?',
      'el-GR': 'Μπορείτε να με βοηθήσετε να κάνω κράτηση ενός αντικειμένου？', 'ar-SA': 'هل يمكنك مساعدتي في حجز مادة？', 'mk-MK': 'Моže li da mi pomognete so rezerviranje να предмет？',
      'es-ES': '¿Puede ayudarme a reservar un artículo？', 'it-IT': 'Può aiutarmi να prenotare un artículo？',
      'id-ID': 'Bisakah Anda helping me with reserving an item？', 'en-US': 'Can you assist me with reserving an item?',
    }
  },
  { type: 'customer', category: 'General Assistance', english: 'How can I pay for my fees?',
    translations: {
      'zh-CN': '我如何支付費用？', 'zh-HK': '我点样交费？', 'ne-NP': 'मैले मेरो शुल्क कसरी तिर्न सक्छु?',
      'el-GR': 'Πώς μπορώ να πληρώσω τα τέλη μου？', 'ar-SA': 'كيف can I pay for my fees？', 'mk-MK': 'КаKаको можам da gi platiam moite taksi？',
      'es-ES': '¿Cómo puedo pagar mis cuotas？', 'it-IT': 'Como posso pagar le mie tasse？',
      'id-ID': 'Bagaimana cara saya membayar biaya saya？', 'en-US': 'How can I pay for my fees?',
    }
  },
  { type: 'customer', category: 'General Assistance', english: 'When is this item due back?',
    translations: {
      'zh-CN': '这个物品什么时候到期归还？', 'zh-HK': '呢件物品几时要还？', 'ne-NP': 'यो सामान कहिले फिर्ता गर्नुपर्scha?',
      'el-GR': 'Πότε πρέπει να επιστραφεί αυτό το αντικείμενο？', 'ar-SA': 'متى يجب إرجάς هذه المادة？', 'mk-MK': 'Коm треба da se vrati ovoj предмет？',
      'es-ES': '¿Cuando debo devolver este artículo？', 'it-IT': 'Cuando debe be restituido este artículo？',
      'id-ID': 'Kapan barang this harus dikembalikan？', 'en-US': 'When is this item due back?',
    }
  },
  { type: 'customer', category: 'General Assistance', english: 'Can I borrow this item?',
    translations: {
      'zh-CN': '我可以借阅这个物品吗？', 'zh-HK': '我可唔可以借呢件物品？', 'ne-NP': 'के म यो सामान उधारो लिन सक्छु?',
      'el-GR': 'Μπορώ να δανειστώ αυτό το αντικείμενο？', 'ar-SA': 'هل يمكنني استعارة هذه المادة？', 'mk-MK': 'Моže li da go pozajmam ovoj предмет？',
      'es-ES': '¿Puedo tomar prestado este artículo？', 'it-IT': 'Posso prendre in prestito este artículo？',
      'id-ID': 'Bisakah saya meminjam barang this？', 'en-US': 'Can I borrow this item?',
    }
  },
  { type: 'customer', category: 'General Assistance', english: 'How long can I borrow items from the library?',
    translations: {
      'zh-CN': '我可以在图书馆借阅物品多久？', 'zh-HK': '我点样借几耐图书馆嘅嘢？', 'ne-NP': 'म पुस्तकालयबाट कति लामो समयसम्म सामान उधारो लिन सक्छु?',
      'el-GR': 'Πόσο καιρό μπορώ να δανειστώ αντικείDμενα from τη βιβλιοθήκη？', 'ar-SA': 'كم المدة التي can I borrow items from المكتبة？', 'mk-MK': 'Колку dugo možam da pozajmuvam predmeti od bibliotekata？',
      'es-ES': '¿For cuánto tempo posso pedir prestados artículos da biblioteca？', 'it-IT': 'Per quanto tempo posso prendere in prestito artículos dalla biblioteca？',
      'id-ID': 'Berapa lama saya can borrow items from perpustakaan？', 'en-US': 'How long can I borrow items from the library?',
    }
  },
  { type: 'customer', category: 'General Assistance', english: 'Where can I return these items?',
    translations: {
      'zh-CN': '我在哪里可以归还这些物品？', 'zh-HK': '我喺边度可以还呢啲嘢？', 'ne-NP': 'मैले यी सामानहरू कहाँ फिर्ता गर्न सक्छु?',
      'el-GR': 'Πού μπορώ να επιστρέψω αυτά τα αντικείμενα？', 'ar-SA': 'أén can I return these items？', 'mk-MK': 'Каde можам da gi vratam ovie predmeti？',
      'es-ES': '¿Dónde puedo devolver estos artículos？', 'it-IT': 'Dove puedo restituir estos artículos？',
      'id-ID': 'Di mana saya can return these items？', 'en-US': 'Where can I return these items?',
    }
  },
  { type: 'customer', category: 'General Assistance', english: 'Is there a justice of the peace available today?',
    translations: {
      'zh-CN': '今天有太平绅士吗？', 'zh-HK': '今天有冇太平绅士喺度？', 'ne-NP': 'आज शान्ति न्यायाधीश उपलब्ध छ?',
      'el-GR': 'Υπάρχει διαθέσιμος ειρηνοδίκης σήμερα？', 'ar-SA': 'هل يوجد qazi صلح mتاح اليوم？', 'mk-MK': 'Даli ima mirovén sudija dostapen denes？',
      'es-ES': '¿Has un juez de paz available today？', 'it-IT': 'C\'è un giudice of peace disponible today？',
      'id-ID': 'Apakah ada hakim perdamaímที่ verfügbar heute？', 'en-US': 'Is there a justice of the peace available today?',
    }
  },

  { type: 'customer', category: 'Library Layout', english: 'Where is the bathroom?',
    translations: {
      'zh-CN': '洗手间在哪里？', 'zh-HK': '洗手间喺边度？', 'ne-NP': 'शौचालय कहाँ छ?',
      'el-GR': 'Πού είναι η τουαλέτα？', 'ar-SA': 'أén دورة المياه？', 'mk-MK': 'Каde е toaletoт？',
      'es-ES': '¿Dónde está el baño？', 'it-IT': 'Dov\'è el baño？',
      'id-ID': 'Di mana kamar mandi？', 'en-US': 'Where is the bathroom?',
    }
  },
  { type: 'customer', category: 'Library Layout', english: 'Where is the Chinese section?',
    translations: {
      'zh-CN': '中文区在哪里？', 'zh-HK': '中文区喺边度？', 'ne-NP': 'चिनियाँ खण्ड कहाँ छ?',
      'el-GR': 'Πού είναι το κινεζικό τμήμα？', 'ar-SA': 'أén القسم الصيني？', 'mk-MK': 'Каde е kineskiot del？',
      'es-ES': '¿Dónde está la sección china？', 'it-IT': 'Dov\'è la sección china？',
      'id-ID': 'Di mana bagian Cina？', 'en-US': 'Where is the Chinese section?',
    }
  },
  { type: 'customer', category: 'Library Layout', english: 'Are there any quiet spots to sit?',
    translations: {
      'zh-CN': '有安静的地方可以坐吗？', 'zh-HK': '有冇啲静嘅地方可以坐？', 'ne-NP': 'बस्नको लागि कुनै शान्त ठाउँ छ?',
      'el-GR': 'Υπάρχουν ήσυχα σημεία για να καθίσετε？', 'ar-SA': 'هل توجد أماكن هادئة لل جلوس？', 'mk-MK': 'Даli ima тивки mesta za sedenje？',
      'es-ES': '¿Hay algún lugar tranquilo para sentarse？', 'it-IT': 'Ci sono posti tranquilli per sedersi？',
      'id-ID': 'Apakah ada tempatที่ tenang for duduk？', 'en-US': 'Are there any quiet spots to sit?',
    }
  },
  { type: 'customer', category: 'Library Layout', english: 'Where is the children\'s section?',
    translations: {
      'zh-CN': '儿童区在哪里？', 'zh-HK': '儿童区喺边度？', 'ne-NP': 'बालबालिकाको खण्ड कहाँ छ?',
      'el-GR': 'Πού είναι το παιδικό τμήμα？', 'ar-SA': 'أén قسم الأطفال？', 'mk-MK': 'Каde е detskiot oddeel？',
      'es-ES': '¿Dónde está la sección infantil？', 'it-IT': 'Dov\'è la sección bambini？',
      'id-ID': 'Di mana bagian anak-आana？', 'en-US': 'Where is the children\'s section?',
    }
  },
  { type: 'customer', category: 'Library Layout', english: 'How do I get to Centrelink?',
    translations: {
      'zh-CN': '我怎么去Centrelink？', 'zh-HK': '我点样去Centrelink？', 'ne-NP': 'सेन्टरलिंक कसरी जाने?',
      'el-GR': 'Πώς πηγαίνω στο Centrelink？', 'ar-SA': 'كيف أصل إلى سنترلينك？', 'mk-MK': 'КаKаको da stignam до Centrelink？',
      'es-ES': '¿Cómo llego a Centrelink？', 'it-IT': 'Como arrivo al Centrelink？',
      'id-ID': 'Bagaimana cara menuju Centrelink？', 'en-US': 'How do I get to Centrelink?',
    }
  },
  { type: 'customer', category: 'Library Layout', english: 'How do I get to Council?',
    translations: {
      'zh-CN': '我怎么去市政厅？', 'zh-HK': '我点样去市政局？', 'ne-NP': 'काउन्सिल कसरी जाने?',
      'el-GR': 'Πώς πηγαίνω στο Συμβούλιο？', 'ar-SA': 'كيف أصل إلى المجلس？', 'mk-MK': 'КаKаको da stignam до Sovetot？',
      'es-ES': '¿Cómo llego al Ayuntamiento？', 'it-IT': 'Como arrivo al Comune？',
      'id-ID': 'Bagaimana cara menuju Dewan？', 'en-US': 'How do I get to Council?',
    }
  },
  { type: 'customer', category: 'Library Layout', english: 'How do I get to the Seniors Centre?',
    translations: {
      'zh-CN': '我怎么去老年活动中心？', 'zh-HK': '我点样去长者中心？', 'ne-NP': 'वरिष्ठ नागरिक केन्द्र कसरी जाने?',
      'el-GR': 'Πώς πηγαίνω στο Κέντρο Ηλικιωμένων？', 'ar-SA': 'كيف أصل إلى مركز كبار السν？', 'mk-MK': 'КаKаको da stignam до Centarot za postari graǵani？',
      'es-ES': '¿Cómo llego al Centro de Mayores？', 'it-IT': 'Como arrivo al Centro Anziani？',
      'id-ID': 'Bagaimana cara menuju Pusat Lansia？', 'en-US': 'How do I get to the Seniors Centre?',
    }
  },

  { type: 'customer', category: 'Digital Services', english: 'How can I connect to the wifi?',
    translations: {
      'zh-CN': '我怎么连接无线网络？', 'zh-HK': '我点样连接无线网络？', 'ne-NP': 'वाइफाइ कसरी जोड्ने?',
      'el-GR': 'Πώς μπορώ να συνδεθώ στο Wi-Fi？', 'ar-SA': 'كيف can I connect to the wifi？', 'mk-MK': 'КаKаको da se povrzam на Wi-Fi？',
      'es-ES': '¿Cómo me conecto al wifi？', 'it-IT': 'Come posso connettermmi al Wi-Fi？',
      'id-ID': 'Bagaimana cara menghubungkan to Wi-Fi？', 'en-US': 'How can I connect to the wifi?',
    }
  },
  { type: 'customer', category: 'Digital Services', english: 'Are there public computers available with an internet connection?',
    translations: {
      'zh-CN': '有可以连接互联网的公共電腦嗎？', 'zh-HK': '有冇可以上网嘅公共电脑？', 'ne-NP': 'इन्टरनेट जडान भएको सार्वजनिक कम्प्युटरहरू उपलब्ध छन्?',
      'el-GR': 'Υπάρχουν διαθέσιμοι δημόσιοι υπολογιστές με σύνδεση στο διαδίκτυο？', 'ar-SA': 'هل توجد أجهزة كمبيوتر عامة متوفرة with اتصال بالإنترنت？', 'mk-MK': 'Даli ima dostapni javni kompjuteri со internet konekcija？',
      'es-ES': '¿Hay computadoras públicas disponibles con conexión a internet？', 'it-IT': 'Ci sono computer publics disponibles with connessione internet？',
      'id-ID': 'Apakah ada komputer umumที่ available with koneksi internet？', 'en-US': 'Are there public computers available with an internet connection?',
    }
  },
  { type: 'customer', category: 'Digital Services', english: 'I need help using a computer',
    translations: {
      'zh-CN': '我需要电脑使用方面的帮助。', 'zh-HK': '我需要电脑使用方面嘅帮助。', 'ne-NP': 'मलाई कम्प्युटर प्रयोग गर्न मद्दत चाहिन्छ।',
      'el-GR': 'Χρειάζομαι βοήθεια με τη χρήση υπολογιστή。', 'ar-SA': 'أحتاج مساعدة في استخدام الحاسوب。', 'mk-MK': 'Ми треба pomoš за κοριστε kompjuter。',
      'es-ES': 'Necesito ayuda para usar una computadora。', 'it-IT': 'Ho bisogno di aiuto for usar un computer。',
      'id-ID': 'Saya butuh bantuan using komputer。', 'en-US': 'I need help using a computer',
    }
  },
  { type: 'customer', category: 'Digital Services', english: 'I need help using the internet.',
    translations: {
      'zh-CN': '我需要互联网使用方面的帮助。', 'zh-HK': '我需要上网方面嘅帮助。', 'ne-NP': 'मलाई इन्टरनेट प्रयोग गर्न मद्दत चाहिन्छ।',
      'el-GR': 'Χρειάζομαι βοήθεια με τη χρήση του διαδικτύου。', 'ar-SA': 'أحتاج مساعدة في استخدام الإنترنت。', 'mk-MK': 'Ми треба pomoš за κοrisenje internet。',
      'es-ES': '¿Necesita ayuda para usar internet？', 'it-IT': 'Ha bisogno of help for usar internet？',
      'id-ID': 'Saya butuh bantuan using internet。', 'en-US': 'I need help using the internet.',
    }
  },
  { type: 'customer', category: 'Digital Services', english: 'Are there printers available?',
    translations: {
      'zh-CN': '有打印机吗？', 'zh-HK': '有冇打印机？', 'ne-NP': 'प्रिन्तरहरू उपलब्ध छन्?',
      'el-GR': 'Υπάρχουν διαθέσιμοι εκτυπωτές？', 'ar-SA': 'هل تووجد طابعات متاحة？', 'mk-MK': 'Даli ima dostapni printeri？',
      'es-ES': '¿Hay impresoras available？', 'it-IT': 'Ci sono stampanti available？',
      'id-ID': 'Apakah there printers available？', 'en-US': 'Are there printers available?',
    }
  },
  { type: 'customer', category: 'Digital Services', english: 'I need help using a printer.',
    translations: {
      'zh-CN': '我需要打印机使用方面的帮助。', 'zh-HK': '我需要打印机使用方面嘅帮助。', 'ne-NP': 'मलाई प्रिन्टर प्रयोग गर्न मद्दत चाहिन्छ。',
      'el-GR': 'Χρειάζομαι βοήθεια με τη χρήση εκτυπωτή。', 'ar-SA': 'هل تحتاج مساعدة في استخدام الطابعة？', 'mk-MK': 'Ми треба pomoš за κοrisenje printer。',
      'es-ES': '¿Necesita ayuda para usar una impresora？', 'it-IT': 'Ha bisogno de aiuto for usar una stampante？',
      'id-ID': 'Saya butuh bantuan using printer。', 'en-US': 'I need help using a printer.',
    }
  },
  { type: 'customer', category: 'Digital Services', english: 'Are there scanners available?',
    translations: {
      'zh-CN': '有扫描仪吗？', 'zh-HK': '有冇扫描器？', 'ne-NP': 'स्क्यानरहरू उपलब्ध छन्?',
      'el-GR': 'Υπάρχουν διαθέσιμοι σαρωτές？', 'ar-SA': 'هل توجد ماسحات ضوئية متاحة？', 'mk-MK': 'Даli ima dostapni skeneri？',
      'es-ES': '¿Hay escáneres available？', 'it-IT': 'Ci sono scanner disponibles？',
      'id-ID': 'Apakah ada pemindाईที่ available？', 'en-US': 'Are there scanners available?',
    }
  },
  { type: 'customer', category: 'Digital Services', english: 'I need help using a scanner',
    translations: {
      'zh-CN': '我需要扫描仪使用方面的帮助。', 'zh-HK': '我需要扫描器使用方面嘅帮助。', 'ne-NP': 'मलाई स्क्यानर प्रयोग गर्न मद्दत चाहिन्छ。',
      'el-GR': 'Χρειάζομαι βοήθεια με τη χρήση σαρωτή。', 'ar-SA': 'أحتاج مسساعدة في استخدام الماسح الضوئي。', 'mk-MK': 'Ми треба pomoš for κοrisenje skener。',
      'es-ES': '¿Necesito ayuda para usar un escáner。', 'it-IT': 'Ho bisogno of help using a scanner。',
      'id-ID': 'Saya butuh bantuan using a scanner。', 'en-US': 'I need help using a scanner',
    }
  },
  { type: 'customer', category: 'Digital Services', english: 'How much does printing cost?',
    translations: {
      'zh-CN': '打印費用是多少？', 'zh-HK': '打印要几多钱？', 'ne-NP': 'प्रिन्ट गर्न कति लाग्छ?',
      'el-GR': 'Πόσο κοسτίζει η εκτύπωση？', 'ar-SA': 'كم تكلفة الطباعة？', 'mk-MK': 'Коmčine pečatenjeto？',
      'es-ES': '¿Cuánto cuesta imprimir？', 'it-IT': 'Quanto cuesta stampare？',
      'id-ID': 'Berapa biaya pencetakan？', 'en-US': 'How much does printing cost?',
    }
  },

  { type: 'customer', category: 'Language & Community Resources', english: 'Do you have Chinese language magazines?',
    translations: {
      'zh-CN': '你們有中文雜誌嗎？', 'zh-HK': '你有冇中文杂志？', 'ne-NP': 'तपाईंसँग चिनियाँ भाषाका पत्रिका छन्?',
      'el-GR': 'Έχετε κινεζικά περιοδικά？', 'ar-SA': 'هل لديكم مجلات باللغة الصينية？', 'mk-MK': 'Даli imate spisaniјa на kineski jazik？',
      'es-ES': '¿Tienen revistas en chino？', 'it-IT': 'Avete riviste in lingua cinese？',
      'id-ID': 'Apakah Anda punya majalah berbahasa Cina？', 'en-US': 'Do you have Chinese language magazines?',
    }
  },
  { type: 'customer', category: 'Language & Community Resources', english: 'Do you have Chinese language DVDs?',
    translations: {
      'zh-CN': '你們有中文DVD嗎？', 'zh-HK': '你有冇中文DVD？', 'ne-NP': 'त तपाईंसँग चिनियाँ भाषाका डीभीडी छन्?',
      'el-GR': 'Έχετε κινεζικά DVD？', 'ar-SA': 'هل لديكم أقraṣa DVD باللغة الصينية？', 'mk-MK': 'Даli imate kineski DVD-a？',
      'es-ES': '¿Tienen DVDs in chino？', 'it-IT': 'Avete DVD in lingua cinese？',
      'id-ID': 'Apakah 您 punya majalah berbahasas Cina？', 'en-US': 'Do you have Chinese language DVDs?',
    }
  },
  { type: 'customer', category: 'Language & Community Resources', english: 'Is there anyone here who can speak Mandarin?',
    translations: {
      'zh-CN': '这里有人会说普通话吗？', 'zh-HK': '呢度有冇人识讲普通话？', 'ne-NP': 'यहाँ कोही मन्डारिन बोल्न सक्ने छ?',
      'el-GR': 'Υπάρχει κάποιος εδώ που να μιλάει Μανδαarinika？', 'ar-SA': 'هل يوجد هنا من يتحدث المανταрин？', 'mk-MK': 'Даli ima nekoj ovde што zboruva mandarinski？',
      'es-ES': '¿Hay alguien here que hable mandarín？', 'it-IT': 'C\'è qualcuno here que parla mandarino？',
      'id-ID': 'Apakah ada orang di here who can speak Mandarin？', 'en-US': 'Is there anyone here who can speak Mandarin?',
    }
  },
  { type: 'customer', category: 'Language & Community Resources', english: 'Is there anyone here who can speak Cantonese?',
    translations: {
      'zh-CN': '这里有人会说粤语吗？', 'zh-HK': '呢度有冇人识讲广东话？', 'ne-NP': 'यहाँ कोही क्यान्टोनिज बोल्न सक्ने छ?',
      'el-GR': 'Υπάρχει κάποιος here who can speak Cantonese？', 'ar-SA': 'هل يوجد هنا من يتحدث الكانتونية？', 'mk-MK': 'Даli ima nekoj ovde што zboruva kantonski？',
      'es-ES': '¿Has alguien here who can speak Cantonese？', 'it-IT': 'C\'è qualcuno here who can speak Cantonese？',
      'id-ID': 'Apakah there is anyone here who can speak Cantonese？', 'en-US': 'Is there anyone here who can speak Cantonese?',
    }
  },
];


function App() {
  const [phrases, setPhrases] = useState([]);
  const [currentMode, setCurrentMode] = useState('staff'); // 'staff' or 'customer'
  const [customerLanguage, setCustomerLanguage] = useState('Mandarin'); // Default customer language
  const [staffLanguage, setStaffLanguage] = useState('Mandarin'); // Changed default from 'English' to 'Mandarin'
  const [userId, setUserId] = useState('Loading...');
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [staffQuery, setStaffQuery] = useState(''); // State for staff's dynamic query
  const [suggestedPhrases, setSuggestedPhrases] = useState([]); // State for LLM suggested phrases
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [showQrPopup, setShowQrPopup] = useState(false); // State to control QR code pop-up visibility
  const [showLanguageChoicePopup, setShowLanguageChoicePopup] = useState(false); // New state for language choice popup


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


  // Initialize Firebase and authenticate anonymously
  useEffect(() => {
    try {
      const app = initializeApp(firebaseConfig);
      const firestore = getFirestore(app);
      const firebaseAuth = getAuth(app);

      setDb(firestore);
      setAuth(firebaseAuth);

      const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
        if (user) {
          setUserId(user.uid);
        } else {
          try {
            // Sign in with custom token if available, otherwise anonymously
            if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
              await signInWithCustomToken(firebaseAuth, __initial_auth_token);
              setUserId(firebaseAuth.currentUser.uid);
            } else {
              await signInAnonymously(firebaseAuth);
              setUserId(crypto.randomUUID()); // Fallback to a random ID if sign-in fails
            }
          } catch (error) {
            console.error("Error during anonymous sign-in or custom token sign-in:", error);
            // Fallback to a random ID if sign-in fails
            setUserId(crypto.randomUUID());
          }
        }
        setIsAuthReady(true); // Authentication state is ready
      });

      return () => unsubscribe(); // Cleanup auth listener
    } catch (error) {
      console.error("Firebase initialisation error:", error);
      setUserId('Error: Check Firebase Config');
    }
  }, []);

  // Fetch phrases from Firestore and set up real-time listener
  useEffect(() => {
    if (!db || !isAuthReady) return; // Wait for Firebase and auth to be ready

    const phrasesCollectionRef = collection(db, `artifacts/${appId}/public/data/phrases`);

    // Check if the collection is empty and seed it if necessary
    const seedInitialData = async () => {
      try {
        const querySnapshot = await getDocs(phrasesCollectionRef);
        if (querySnapshot.empty) {
          console.log("Firestore 'phrases' collection is empty. Seeding initial data...");
          for (const phrase of initialPhrases) {
            await addDoc(phrasesCollectionRef, phrase);
          }
          console.log("Initial data seeded successfully.");
        }
      } catch (e) {
        console.error("Error checking or seeding initial data: ", e);
      }
    };

    seedInitialData();

    // Set up real-time listener for phrases
    const q = query(phrasesCollectionRef);
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedPhrases = [];
      snapshot.forEach((doc) => {
        fetchedPhrases.push({ id: doc.id, ...doc.data() });
      });
      // Sort phrases by custom category order, then by English phrase for consistent display
      fetchedPhrases.sort((a, b) => {
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
      setPhrases(fetchedPhrases);
    }, (error) => {
      console.error("Error fetching phrases from Firestore:", error);
    });

    return () => unsubscribe(); // Cleanup onSnapshot listener
  }, [db, isAuthReady]); // Re-run when db or auth state changes

  // Function to call Gemini API for phrase suggestions
  const fetchSuggestedPhrases = async () => {
    if (!staffQuery.trim()) return; // Don't fetch if query is empty

    setIsSuggesting(true);
    setSuggestedPhrases([]); // Clear previous suggestions

    try {
      let chatHistory = [];
      const prompt = `Given the scenario: "${staffQuery}", what are some common library phrases a librarian might need to say? Provide up to 3 English phrases and their Simplified Chinese translations. Format the output as a JSON array of objects, where each object has "english" and "chinese" properties. Example: [{"english": "Hello", "chinese": "你好"}, {"chinese": "再见"}]`;
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

      const apiKey = ""; // If you want to use models other than gemini-2.0-flash or imagen-3.0-generate-002, provide an API key here. Otherwise, leave this as-is.
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
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
      if (phrase.english === 'I speak Mandarin.' || phrase.english === 'I speak Cantonese.') {
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
    if (currentMode === 'staff' && phrase.english === 'Do you prefer to speak Mandarin or Cantonese?') { // Corrected English match
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

        {/* User ID Display */}
        <div className="text-center text-sm mb-6" style={{ color: brandColors.mediumGrey }}>
          Your User ID: <span className="font-mono text-xs break-all">{userId}</span>
        </div>

        {/* Staff Section UI */}
        {currentMode === 'staff' && (
          <>
            {/* Language Selection Buttons */}
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {Object.keys(LANGUAGE_CODES).filter(langName => langName !== 'English').map((langName) => ( // Filter out English
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
              <a
                href="#suggested-phrases-section"
                className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ease-in-out mt-2 bg-gray-100 text-gray-700 hover:bg-teal-100 hover:text-teal-600"
              >
                Suggested Phrases (AI)
              </a>
            </div>

            {/* Category Filter Buttons */}
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
              {Object.entries(STAFF_SUBCATEGORY_DISPLAY_MAP).map(([displayKey, actualCategoryName]) => (
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
          </>
        )}

        {/* Language Selection for Customer Section */}
        {currentMode === 'customer' && (
          <>
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {Object.keys(LANGUAGE_CODES).filter(langName => langName !== 'English').map((langName) => ( // Filter out English if present
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
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ease-in-out mt-2
                  ${customerSubcategoryFilter === 'All'
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
          </>
        )}

        {/* Phrase List Display */}
        {Object.keys(groupedPhrases).length === 0 && (
          <div className="text-center text-lg py-10" style={{ color: brandColors.mediumGrey }}>
            {isAuthReady ? 'Loading phrases or no phrases found.' : 'Initialising application...'}
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
              {currentMode === 'staff' && category === 'General Enquiries' && (staffLanguage === 'Mandarin' || staffLanguage === 'Cantonese') && ( // Condition for visibility
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
                .filter(phrase => !(phrase.english === 'Do you prefer to speak Mandarin or Cantonese?' || phrase.english === 'I speak Mandarin.' || phrase.english === 'I speak Cantonese.'))
                .map((phrase) => (
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
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (currentMode === 'staff') {
                        speakPhrase(
                          phrase.translations?.[LANGUAGE_CODES[staffLanguage].code] || phrase.english,
                          LANGUAGE_CODES[staffLanguage].code
                        );
                      } else {
                        speakPhrase(
                          phrase.english,
                          'en-AU'
                        );
                      }
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

        {/* Suggested Phrases Section - Moved to bottom */}
        {currentMode === 'staff' && (
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
      </div>
    </div>
  );
}

export default App;
