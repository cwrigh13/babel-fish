import React, { useState, useEffect } from 'react';
import './App.css';
import { Download } from 'lucide-react';
import { LANGUAGE_CODES } from './constants/languages';
import { brandColors } from './constants/colors';
import { samplePhrases } from './data/phrases';
import { getVoiceStatus, getVoiceInstallInfo } from './utils/speechVoices';

// Languages unavailable as Windows speech voices — buttons hidden for now
const LANGUAGES_NO_WINDOWS_VOICE = ['Greek', 'Nepali', 'Arabic', 'Macedonian'];
const languageButtonFilter = ([name]) => name !== 'English' && !LANGUAGES_NO_WINDOWS_VOICE.includes(name);

// Speaker icon SVG
const speakerIcon = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
    </svg>
);

function App() {
    // Load saved state from localStorage or use defaults
    const getSavedState = (key, defaultValue) => {
        try {
            const saved = localStorage.getItem(`babelFish_${key}`);
            return saved ? JSON.parse(saved) : defaultValue;
        } catch (error) {
            console.warn(`Error loading saved state for ${key}:`, error);
            return defaultValue;
        }
    };

    const [currentMode, setCurrentMode] = useState(() => getSavedState('currentMode', 'staff'));
    const [showQrPopup, setShowQrPopup] = useState(false);
    const [qrPopupType, setQrPopupType] = useState('');
    const [showLanguagePreferencePopup, setShowLanguagePreferencePopup] = useState(false);
    const [languagePreferencePopupType, setLanguagePreferencePopupType] = useState('mandarin');
    const [staffLanguage, setStaffLanguage] = useState(() => getSavedState('staffLanguage', 'Mandarin'));
    const [customerLanguage, setCustomerLanguage] = useState(() => getSavedState('customerLanguage', 'Mandarin'));
    const [staffSubcategoryFilter, setStaffSubcategoryFilter] = useState(() => getSavedState('staffSubcategoryFilter', 'All'));
    const [customerSubcategoryFilter, setCustomerSubcategoryFilter] = useState(() => getSavedState('customerSubcategoryFilter', 'All'));
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [phrases, setPhrases] = useState([]);
    const [isAudioPlaying, setIsAudioPlaying] = useState(false);
    const [currentPlayingText, setCurrentPlayingText] = useState('');
    const [speechVoices, setSpeechVoices] = useState([]);
    const [showVoiceLanguagesModal, setShowVoiceLanguagesModal] = useState(false);
    /** Snapshot of voices shown in the modal; refreshed when modal opens or user clicks Refresh */
    const [modalVoiceList, setModalVoiceList] = useState([]);

    // Save state to localStorage
    const saveState = (key, value) => {
        try {
            localStorage.setItem(`babelFish_${key}`, JSON.stringify(value));
        } catch (error) {
            console.warn(`Error saving state for ${key}:`, error);
        }
    };

    // Save state whenever it changes
    useEffect(() => {
        saveState('currentMode', currentMode);
    }, [currentMode]);

    useEffect(() => {
        // Simulate loading phrases
        setTimeout(() => {
            setPhrases(samplePhrases);
            setIsAuthReady(true);
        }, 300);
    }, []);

    // Reset language to Mandarin if saved language has no Windows voice (buttons are hidden)
    useEffect(() => {
        if (LANGUAGES_NO_WINDOWS_VOICE.includes(staffLanguage)) {
            setStaffLanguage('Mandarin');
        }
        if (LANGUAGES_NO_WINDOWS_VOICE.includes(customerLanguage)) {
            setCustomerLanguage('Mandarin');
        }
    }, [staffLanguage, customerLanguage]);

    // Pre-load voices (Chrome returns [] until voiceschanged fires)
    useEffect(() => {
        if (!('speechSynthesis' in window)) return;
        const updateVoices = () => setSpeechVoices(speechSynthesis.getVoices());
        updateVoices();
        speechSynthesis.addEventListener('voiceschanged', updateVoices);
        return () => speechSynthesis.removeEventListener('voiceschanged', updateVoices);
    }, []);

    // When the voice modal opens, take a fresh snapshot for display; keep in sync for Refresh
    useEffect(() => {
        if (!showVoiceLanguagesModal || !('speechSynthesis' in window)) return;
        setModalVoiceList(Array.from(speechSynthesis.getVoices()));
    }, [showVoiceLanguagesModal]);

    const speakPhrase = (text, langCode) => {
        if (!('speechSynthesis' in window)) {
            alert('Text-to-speech is not supported in this browser.');
            return;
        }
        speechSynthesis.cancel();
        const voices = speechVoices.length > 0 ? speechVoices : speechSynthesis.getVoices();
        const targetLang = langCode.toLowerCase().replace('_', '-');
        const targetPrefix = targetLang.split('-')[0];
        const isEnglish = targetPrefix === 'en';

        // For non-English (e.g. Greek), we must use a matching voice or the engine spells letters
        const preferredVoice = voices.find(v => v.lang.toLowerCase().replace('_', '-') === targetLang) ||
                             voices.find(v => v.lang.toLowerCase().startsWith(targetPrefix));

        if (!isEnglish && !preferredVoice) {
            const langName = Object.entries(LANGUAGE_CODES).find(([, d]) => (d.code || '').toLowerCase().replace('_', '-') === targetLang)?.[0] || langCode;
            alert(`No ${langName} voice is available on this device. To hear the phrase pronounced correctly, add a ${langName} voice in your system settings (e.g. Windows: Settings → Time & language → Speech → Add voice).`);
            return;
        }

        setIsAudioPlaying(true);
        setCurrentPlayingText(text);

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = preferredVoice ? preferredVoice.lang : langCode;
        utterance.rate = 0.8;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }

        utterance.onend = () => {
            setIsAudioPlaying(false);
            setCurrentPlayingText('');
        };

        utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event.error);
            setIsAudioPlaying(false);
            setCurrentPlayingText('');
        };

        setTimeout(() => speechSynthesis.speak(utterance), 50);
    };

    const stopAudio = () => {
        if ('speechSynthesis' in window) {
            speechSynthesis.cancel();
            setIsAudioPlaying(false);
            setCurrentPlayingText('');
        }
    };

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape' && isAudioPlaying) {
                stopAudio();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isAudioPlaying]);

    // Filter phrases based on current mode and filters
    const filteredPhrases = phrases.filter(phrase => {
        if (phrase.type !== currentMode) return false;
        if (currentMode === 'staff' && staffSubcategoryFilter !== 'All' && phrase.category !== staffSubcategoryFilter) return false;
        if (currentMode === 'customer' && customerSubcategoryFilter !== 'All' && phrase.category !== customerSubcategoryFilter) return false;
        // Logic from legacy for special Mandarin/Cantonese phrases
        if (currentMode === 'staff' && phrase.english === 'Do you prefer to speak Mandarin or Cantonese?' && staffLanguage !== 'Mandarin') return false;
        if (currentMode === 'staff' && phrase.english === 'Do you prefer to speak Cantonese or Mandarin?' && staffLanguage !== 'Cantonese') return false;
        if (currentMode === 'staff' && phrase.english === 'Unfortunately we do not have any staff who speak Cantonese' && staffLanguage !== 'Cantonese') return false;
        return true;
    });

    // Group phrases by category
    const groupedPhrases = filteredPhrases.reduce((acc, phrase) => {
        if (!acc[phrase.category]) {
            acc[phrase.category] = [];
        }
        acc[phrase.category].push(phrase);
        return acc;
    }, {});

    // Get category names for filtering with specific ordering
    const STAFF_CATEGORY_ORDER = ['General Enquiries', 'Transactional', 'Digital Services'];
    const CUSTOMER_CATEGORY_ORDER = ['General Assistance', 'Transactional', 'Library Layout', 'Language & Community Resources', 'Digital Services'];

    const staffCategories = [...new Set(phrases.filter(p => p.type === 'staff').map(p => p.category))]
        .sort((a, b) => STAFF_CATEGORY_ORDER.indexOf(a) - STAFF_CATEGORY_ORDER.indexOf(b));
    const customerCategories = [...new Set(phrases.filter(p => p.type === 'customer').map(p => p.category))]
        .sort((a, b) => CUSTOMER_CATEGORY_ORDER.indexOf(a) - CUSTOMER_CATEGORY_ORDER.indexOf(b));

    // Function to get native language name for category
    const getCategoryNativeName = (categoryName, currentLanguage) => {
        const categoryTranslations = {
            'General Enquiries': {
                'zh-CN': '一般查询', 'zh-HK': '一般查詢', 'ne-NP': 'सामान्य जानकारी', 'el-GR': 'Γενικές Ερωτήσεις', 'ar-SA': 'استفسارات عامة', 'mk-MK': 'Општи прашања', 'es-ES': 'Consultas Generales', 'it-IT': 'Richieste Generali', 'id-ID': 'Pertanyaan Umum'
            },
            'Digital Services': {
                'zh-CN': '数字服务', 'zh-HK': '數位服務', 'ne-NP': 'डिजिटल सेवाहरू', 'el-GR': 'Ψηφιακές Υπηρεσίες', 'ar-SA': 'الخدمات الرقمية', 'mk-MK': 'Дигитални услуги', 'es-ES': 'Servicios Digitales', 'it-IT': 'Servizi Digitali', 'id-ID': 'Layanan Digital'
            },
            'Transactional': {
                'zh-CN': '交易服务', 'zh-HK': '交易服務', 'ne-NP': 'लेनदेन सेवाहरू', 'el-GR': 'Συναλλακτικές Υπηρεσίες', 'ar-SA': 'الخدمات المعاملاتية', 'mk-MK': 'Трансакциски услуги', 'es-ES': 'Servicios Transaccionales', 'it-IT': 'Servizi Transazionali', 'id-ID': 'Layanan Transaksional'
            },
            'General Assistance': {
                'zh-CN': '一般协助', 'zh-HK': '一般協助', 'ne-NP': 'सामान्य सहयोग', 'el-GR': 'Γενική Βοήθεια', 'ar-SA': 'المساعدة العامة', 'mk-MK': 'Општа помош', 'es-ES': 'Asistencia General', 'it-IT': 'Assistenza Generale', 'id-ID': 'Bantuan Umum'
            },
            'Library Layout': {
                'zh-CN': '图书馆布局', 'zh-HK': '圖書館佈局', 'ne-NP': 'पुस्तकालय रूपरेखा', 'el-GR': 'Διάταξη Βιβλιοθήκης', 'ar-SA': 'تخطيط المكتبة', 'mk-MK': 'Распоред на библиотека', 'es-ES': 'Distribución de la Biblioteca', 'it-IT': 'Layout della Biblioteca', 'id-ID': 'Tata Letak Perpustakaan'
            },
            'Language & Community Resources': {
                'zh-CN': '语言与社区资源', 'zh-HK': '語言與社區資源', 'ne-NP': 'भाषा र समुदाय स्रोतहरू', 'el-GR': 'Πόροι Γλώσσας και Κοινότητας', 'ar-SA': 'موارد اللغة والمجتمع', 'mk-MK': 'Јазични и ресурси во заедницата', 'es-ES': 'Recursos de Idioma y Comunidad', 'it-IT': 'Risorse Linguistiche e della Comunità', 'id-ID': 'Sumber Daya Bahasa & Komunitas'
            }
        };

        const langCode = LANGUAGE_CODES[currentLanguage]?.code;
        return categoryTranslations[categoryName]?.[langCode] || categoryName;
    };

    return (
        <div className="min-h-screen" style={{ backgroundColor: brandColors.lightGreyBackground, padding: '2rem 1rem' }}>
            <div className="max-w-4xl mx-auto rounded-xl shadow-lg p-6 md:p-8" style={{ backgroundColor: 'white' }}>
                {/* Logo */}
                <div className="flex justify-center mb-6 p-6 rounded-2xl" style={{ backgroundColor: brandColors.darkTeal }}>
                    <img
                        src="https://georgesriver.spydus.com/api/maintenance/1.0/imagebrowser/image?blobName=a31cf63f-7e24-41d5-b1f8-c206bde45ce6.png"
                        alt="Georges River Libraries Logo"
                        style={{ maxWidth: '200px', height: 'auto', objectFit: 'contain', borderRadius: '0.375rem' }}
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://placehold.co/300x80/007A70/ffffff?text=Georges+River+Libraries";
                        }}
                    />
                </div>

                <h1 className="text-4xl md:text-5xl font-bold text-center mb-6 text-shadow-light" style={{ color: brandColors.darkTeal }}>
                    Georges River Libraries Babel Fish
                </h1>

                {/* Mode Selection Buttons */}
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
                                const langCode = LANGUAGE_CODES[staffLanguage]?.code;
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
                                const langCode = LANGUAGE_CODES[customerLanguage]?.code;
                                return customerTranslations[langCode] || 'For Customers';
                            })()}
                        </span>
                    </button>
                </div>

                {/* Language Selection */}
                <div className="language-buttons-container mb-8">
                    <div className="language-buttons-row">
                        {currentMode === 'staff' ? (
                            Object.entries(LANGUAGE_CODES).filter(languageButtonFilter).map(([name, data]) => (
                                <button
                                    key={name}
                                    onClick={() => setStaffLanguage(name)}
                                    className={`language-button ${staffLanguage === name ? 'language-button-active' : 'language-button-inactive'}`}
                                >
                                    <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{name}</span><br />
                                    <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>{data.nativeName}</span>
                                </button>
                            ))
                        ) : (
                            Object.entries(LANGUAGE_CODES).filter(languageButtonFilter).map(([name, data]) => (
                                <button
                                    key={name}
                                    onClick={() => setCustomerLanguage(name)}
                                    className={`language-button ${customerLanguage === name ? 'language-button-active' : 'language-button-inactive'}`}
                                >
                                    <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{data.nativeName}</span><br />
                                    <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>{name}</span>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Category Filter Buttons */}
                <div className="flex flex-wrap justify-center gap-4 mb-8">
                    <button
                        onClick={() => currentMode === 'staff' ? setStaffSubcategoryFilter('All') : setCustomerSubcategoryFilter('All')}
                        className={`language-button ${(currentMode === 'staff' ? staffSubcategoryFilter : customerSubcategoryFilter) === 'All' ? 'language-button-active' : 'language-button-inactive'}`}
                    >
                        <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                            {(() => {
                                const allTranslations = { 'zh-CN': '全部', 'zh-HK': '全部', 'ne-NP': 'सबै', 'el-GR': 'Όλα', 'ar-SA': 'الكل', 'mk-MK': 'Сите', 'es-ES': 'Todo', 'it-IT': 'Tutto', 'id-ID': 'Semua' };
                                const langCode = LANGUAGE_CODES[currentMode === 'staff' ? staffLanguage : customerLanguage]?.code;
                                return allTranslations[langCode] || 'All';
                            })()}
                        </span><br />
                        <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>All</span>
                    </button>
                    {(currentMode === 'staff' ? staffCategories : customerCategories).map((cat) => (
                        <button
                            key={cat}
                            onClick={() => currentMode === 'staff' ? setStaffSubcategoryFilter(cat) : setCustomerSubcategoryFilter(cat)}
                            className={`language-button ${(currentMode === 'staff' ? staffSubcategoryFilter : customerSubcategoryFilter) === cat ? 'language-button-active' : 'language-button-inactive'}`}
                        >
                            <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                                {currentMode === 'staff' ? cat : getCategoryNativeName(cat, customerLanguage)}
                            </span><br />
                            <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                                {currentMode === 'staff' ? getCategoryNativeName(cat, staffLanguage) : cat}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Phrase List Display */}
                {!isAuthReady ? (
                    <div className="text-center text-lg py-10" style={{ color: brandColors.mediumGrey }}>
                        Initialising application...
                    </div>
                ) : Object.keys(groupedPhrases).length === 0 ? (
                    <div className="text-center text-lg py-10" style={{ color: brandColors.mediumGrey }}>
                        No phrases found.
                    </div>
                ) : (
                    Object.keys(groupedPhrases).map((category) => {
                        const categoryPhrases = groupedPhrases[category];
                        const firstPhrase = categoryPhrases[0];
                        const restPhrases = categoryPhrases.slice(1);

                        return (
                        <div key={category} className="category-section">
                            <div className="category-header">
                                <h2 className="category-title-en">
                                    {currentMode === 'staff' ? category : getCategoryNativeName(category, customerLanguage)}
                                </h2>
                                <div className="category-title-native">
                                    {currentMode === 'staff' ? getCategoryNativeName(category, staffLanguage) : category}
                                </div>
                                <div className="mx-auto mt-4 w-24 h-1 rounded-full" style={{ backgroundColor: brandColors.primaryTeal }}></div>
                            </div>

                            {/* Phrase cards in a single grid so the first card is same width as the rest */}
                            <div className="phrase-list-grid">
                            {firstPhrase && (() => {
                                const activeLangName = currentMode === 'staff' ? staffLanguage : customerLanguage;
                                const langToUse = LANGUAGE_CODES[activeLangName]?.code || 'en-US';
                                const textToSpeak = (currentMode === 'staff' || activeLangName !== 'English')
                                    ? (firstPhrase.translations?.[langToUse] || firstPhrase.english)
                                    : firstPhrase.english;
                                const isPlaying = isAudioPlaying && currentPlayingText === textToSpeak;
                                return (
                                    <div
                                        key={firstPhrase.id}
                                        className="phrase-card"
                                        onClick={() => {
                                            if (firstPhrase.english === 'How do I get to Centrelink?' && currentMode === 'customer') {
                                                setQrPopupType('centrelink');
                                                setShowQrPopup(true);
                                            } else if (firstPhrase.english === 'Do you have computers?' && currentMode === 'customer') {
                                                setQrPopupType('computers');
                                                setShowQrPopup(true);
                                            }
                                        }}
                                    >
                                        <div className="text-left mb-6">
                                            {currentMode === 'staff' ? (
                                                <>
                                                    <p className="text-2xl font-bold mb-3" style={{ color: brandColors.darkTeal, lineHeight: '1.25', letterSpacing: '-0.01em' }}>
                                                        {firstPhrase.english}
                                                    </p>
                                                    <p className="text-lg font-medium" style={{ color: brandColors.darkGreyText, opacity: 0.85 }}>
                                                        {firstPhrase.translations?.[LANGUAGE_CODES[staffLanguage].code] || firstPhrase.english}
                                                    </p>
                                                    {(firstPhrase.english === 'Do you prefer to speak Mandarin or Cantonese?' && staffLanguage === 'Mandarin') && (
                                                        <div className="flex justify-center mt-4">
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); setLanguagePreferencePopupType('mandarin'); setShowLanguagePreferencePopup(true); }}
                                                                className="pill-button"
                                                            >点击选择选项</button>
                                                        </div>
                                                    )}
                                                    {(firstPhrase.english === 'Do you prefer to speak Cantonese or Mandarin?' && staffLanguage === 'Cantonese') && (
                                                        <div className="flex justify-center mt-4">
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); setLanguagePreferencePopupType('cantonese'); setShowLanguagePreferencePopup(true); }}
                                                                className="pill-button"
                                                            >點擊選擇選項</button>
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                <>
                                                    <p className="text-2xl font-bold mb-3" style={{ color: brandColors.darkTeal, lineHeight: '1.25', letterSpacing: '-0.01em' }}>
                                                        {firstPhrase.translations?.[LANGUAGE_CODES[customerLanguage].code] || firstPhrase.english}
                                                    </p>
                                                    <p className="text-lg font-medium" style={{ color: brandColors.darkGreyText, opacity: 0.85 }}>
                                                        {firstPhrase.english}
                                                    </p>
                                                </>
                                            )}
                                        </div>

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (isPlaying) {
                                                    stopAudio();
                                                } else {
                                                    speakPhrase(textToSpeak, langToUse);
                                                }
                                            }}
                                            className={`speaker-button-wide ${isPlaying ? 'playing' : ''}`}
                                            style={{ backgroundColor: isPlaying ? '#004D40' : (currentMode === 'staff' ? brandColors.primaryTeal : brandColors.accentRed) }}
                                            aria-label={`Play pronunciation in ${activeLangName}`}
                                        >
                                            {speakerIcon}
                                        </button>
                                    </div>
                                );
                            })()}
                                {restPhrases.map((phrase) => {
                                    const activeLangName = currentMode === 'staff' ? staffLanguage : customerLanguage;
                                    const langToUse = LANGUAGE_CODES[activeLangName]?.code || 'en-US';
                                    const textToSpeak = (currentMode === 'staff' || activeLangName !== 'English') 
                                        ? (phrase.translations?.[langToUse] || phrase.english) 
                                        : phrase.english;
                                    const isPlaying = isAudioPlaying && currentPlayingText === textToSpeak;

                                    return (
                                        <div
                                            key={phrase.id}
                                            className="phrase-card"
                                            onClick={() => {
                                                if (phrase.english === 'How do I get to Centrelink?' && currentMode === 'customer') {
                                                    setQrPopupType('centrelink');
                                                    setShowQrPopup(true);
                                                } else if (phrase.english === 'Do you have computers?' && currentMode === 'customer') {
                                                    setQrPopupType('computers');
                                                    setShowQrPopup(true);
                                                }
                                            }}
                                        >
                                            <div className="text-left mb-6">
                                                {currentMode === 'staff' ? (
                                                    <>
                                                        <p className="text-2xl font-bold mb-3" style={{ color: brandColors.darkTeal, lineHeight: '1.25', letterSpacing: '-0.01em' }}>
                                                            {phrase.english}
                                                        </p>
                                                        <p className="text-lg font-medium" style={{ color: brandColors.darkGreyText, opacity: 0.85 }}>
                                                            {phrase.translations?.[LANGUAGE_CODES[staffLanguage].code] || phrase.english}
                                                        </p>
                                                        {(phrase.english === 'Do you prefer to speak Mandarin or Cantonese?' && staffLanguage === 'Mandarin') && (
                                                            <div className="flex justify-center mt-4">
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); setLanguagePreferencePopupType('mandarin'); setShowLanguagePreferencePopup(true); }}
                                                                    className="pill-button"
                                                                >点击选择选项</button>
                                                            </div>
                                                        )}
                                                        {(phrase.english === 'Do you prefer to speak Cantonese or Mandarin?' && staffLanguage === 'Cantonese') && (
                                                            <div className="flex justify-center mt-4">
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); setLanguagePreferencePopupType('cantonese'); setShowLanguagePreferencePopup(true); }}
                                                                    className="pill-button"
                                                                >點擊選擇選項</button>
                                                            </div>
                                                        )}
                                                    </>
                                                ) : (
                                                    <>
                                                        <p className="text-2xl font-bold mb-3" style={{ color: brandColors.darkTeal, lineHeight: '1.25', letterSpacing: '-0.01em' }}>
                                                            {phrase.translations?.[LANGUAGE_CODES[customerLanguage].code] || phrase.english}
                                                        </p>
                                                        <p className="text-lg font-medium" style={{ color: brandColors.darkGreyText, opacity: 0.85 }}>
                                                            {phrase.english}
                                                        </p>
                                                    </>
                                                )}
                                            </div>

                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (isPlaying) {
                                                        stopAudio();
                                                    } else {
                                                        speakPhrase(textToSpeak, langToUse);
                                                    }
                                                }}
                                                className={`speaker-button-wide ${isPlaying ? 'playing' : ''}`}
                                                style={{ backgroundColor: isPlaying ? '#004D40' : (currentMode === 'staff' ? brandColors.primaryTeal : brandColors.accentRed) }}
                                                aria-label={`Play pronunciation in ${activeLangName}`}
                                            >
                                                {speakerIcon}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        );
                    })
                )}
            </div>

            {/* Fixed bottom-right: check / install speech voices */}
            <button
                type="button"
                onClick={() => setShowVoiceLanguagesModal(true)}
                className="fixed bottom-6 right-6 p-3 rounded-full shadow-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{ backgroundColor: brandColors.darkTeal, color: 'white' }}
                aria-label="Check and install speech voices for all languages"
            >
                <Download size={24} aria-hidden="true" />
            </button>

            {/* Modals */}
            {showQrPopup && (
                <div className="popup-overlay" onClick={() => setShowQrPopup(false)}>
                    <div className="popup-content" onClick={e => e.stopPropagation()}>
                        <button className="popup-close" onClick={() => setShowQrPopup(false)}>&times;</button>
                        <h3 className="text-2xl font-bold mb-4 text-teal-800">
                            {qrPopupType === 'centrelink' ? 'Directions to Centrelink' : 'Computer Locations'}
                        </h3>
                        {qrPopupType === 'centrelink' ? (
                            <>
                                <iframe
                                    src="https://www.google.com/maps/embed/v1/directions?key=&origin=Hurstville+Library&destination=Centrelink+Hurstville&mode=walking&language=zh-CN"
                                    width="100%" height="300" style={{ border: 0 }}
                                    allowFullScreen="" loading="lazy" title="Map"
                                ></iframe>
                                <div className="mt-4">
                                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent('https://maps.google.com?q=Centrelink+Hurstville')}`} alt="QR Code" className="mx-auto rounded-md" />
                                    <p className="text-sm mt-2 text-gray-500">Scan for live directions</p>
                                </div>
                            </>
                        ) : (
                            <div className="text-left py-4">
                                <p className="font-bold">Locations:</p>
                                <ul className="list-disc pl-5 mb-4">
                                    <li>Ground Floor - Main area</li>
                                    <li>Level 1 - Study area</li>
                                </ul>
                                <p className="font-bold">WiFi Info:</p>
                                <p>Network: GeorgesRiver_Library</p>
                                <p>Password: Library2024</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {showLanguagePreferencePopup && (
                <div className="popup-overlay" onClick={() => setShowLanguagePreferencePopup(false)}>
                    <div className="popup-content" onClick={e => e.stopPropagation()}>
                        <button className="popup-close" onClick={() => setShowLanguagePreferencePopup(false)}>&times;</button>
                        <h3 className="text-2xl font-bold mb-6 text-teal-800">
                            {languagePreferencePopupType === 'mandarin' ? '请选择您偏好的语言：' : '請選擇您偏好的語言：'}
                        </h3>
                        <div className="grid gap-3">
                            {(() => {
                                const options = [
                                    { name: 'Mandarin', native: '普通话', code: 'zh-CN', speak: '我会说普通话。' },
                                    { name: 'Cantonese', native: '粤语', code: 'zh-HK', speak: '我識講廣東話。' }
                                ];
                                if (staffLanguage === 'Cantonese') {
                                    options.reverse();
                                }
                                options.push({ name: 'Either', native: '都可以', code: 'en-US', speak: 'Either language is fine.' });
                                return options;
                            })().map(opt => (
                                <button
                                    key={opt.name}
                                    onClick={() => { speakPhrase(opt.speak, opt.code); setTimeout(() => setShowLanguagePreferencePopup(false), 1500); }}
                                    className="p-4 bg-gray-100 rounded-lg border-none cursor-pointer hover:bg-gray-200 text-left flex justify-between items-center"
                                >
                                    <div>
                                        <div className="font-bold text-lg">{opt.native}</div>
                                        <div className="text-sm text-gray-500">{opt.name}</div>
                                    </div>
                                    <div style={{ color: brandColors.primaryTeal }}>{speakerIcon}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {showVoiceLanguagesModal && (() => {
                const { installed, missing } = getVoiceStatus(LANGUAGE_CODES, modalVoiceList);
                const installInfo = getVoiceInstallInfo();
                const handleRefreshVoices = () => {
                    if ('speechSynthesis' in window) {
                        const list = Array.from(speechSynthesis.getVoices());
                        setModalVoiceList(list);
                    }
                };
                return (
                    <div className="popup-overlay" onClick={() => setShowVoiceLanguagesModal(false)}>
                        <div
                            className="popup-content overflow-y-auto"
                            onClick={e => e.stopPropagation()}
                            style={{ maxWidth: '480px', maxHeight: '85vh' }}
                        >
                            <button className="popup-close" onClick={() => setShowVoiceLanguagesModal(false)} aria-label="Close">&times;</button>
                            <h3 className="text-2xl font-bold mb-4 text-teal-800">
                                Speech voices for Babel Fish
                            </h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Phrases are read using your device&apos;s text-to-speech. Languages without an installed voice cannot be pronounced correctly.
                            </p>
                            <div className="mb-4">
                                <h4 className="font-semibold text-teal-800 mb-2" style={{ color: brandColors.darkTeal }}>Installed ({installed.length})</h4>
                                <ul className="text-sm text-gray-700 space-y-1">
                                    {installed.length === 0 ? (
                                        <li>No Babel Fish languages detected. Voices may still be loading — try &quot;Refresh list&quot;.</li>
                                    ) : (
                                        installed.map(({ name, nativeName }) => (
                                            <li key={name} className="flex items-center gap-2">
                                                <span aria-hidden="true">✓</span> {name} ({nativeName})
                                            </li>
                                        ))
                                    )}
                                </ul>
                            </div>
                            <div className="mb-4">
                                <h4 className="font-semibold text-teal-800 mb-2" style={{ color: brandColors.darkTeal }}>Missing ({missing.length})</h4>
                                {missing.length === 0 ? (
                                    <p className="text-sm text-gray-700">All Babel Fish languages have a voice installed.</p>
                                ) : (
                                    <>
                                        <ul className="text-sm text-gray-700 space-y-1 mb-3">
                                            {missing.map(({ name, nativeName }) => (
                                                <li key={name} className="flex items-center gap-2">
                                                    <span aria-hidden="true">✗</span> {name} ({nativeName})
                                                </li>
                                            ))}
                                        </ul>
                                        <p className="text-sm text-gray-600 mb-2">{installInfo.instructions}</p>
                                        {installInfo.openSettingsUrl ? (
                                            <a
                                                href={installInfo.openSettingsUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-block px-4 py-2 rounded-lg font-medium text-white hover:opacity-90"
                                                style={{ backgroundColor: brandColors.primaryTeal }}
                                            >
                                                {installInfo.label}
                                            </a>
                                        ) : null}
                                    </>
                                )}
                            </div>
                            <div className="flex gap-3 justify-end pt-2">
                                <button
                                    type="button"
                                    onClick={handleRefreshVoices}
                                    className="text-sm underline"
                                    style={{ color: brandColors.darkTeal }}
                                >
                                    Refresh list
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowVoiceLanguagesModal(false)}
                                    className="px-4 py-2 rounded-lg font-medium text-white"
                                    style={{ backgroundColor: brandColors.darkTeal }}
                                >
                                    Done
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
}

export default App;
