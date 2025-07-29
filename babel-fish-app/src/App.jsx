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
const centrelinkMapsEmbedUrl = "https://www.google.com/maps/embed/v1/directions?key=&origin=Hurstville+Library,+12-16+MacMahon+St,+Hurstville+NSW+2220,+Australia&destination=Centrelink+Hurstville,+125+Forest+Rd,+Hurstville+NSW+2220,+Australia&mode=driving&language=zh-CN";

// Standard Google Maps directions URL for QR code linking
const centrelinkMapsUrl = "https://www.google.com/maps/dir/Hurstville+Library,+12-16+MacMahon+St,+Hurstville+NSW+2220,+Australia/Centrelink+Hurstville,+125+Forest+Rd,+Hurstville+NSW+2220,+Australia/";

function App() {
  const [userType, setUserType] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showDirections, setShowDirections] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [auth, setAuth] = useState(null);
  const [db, setDb] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const recognitionRef = useRef(null);
  const synthesisRef = useRef(null);

  useEffect(() => {
    // Initialize Firebase
    try {
      const app = initializeApp(firebaseConfig);
      const authInstance = getAuth(app);
      const dbInstance = getFirestore(app);
      
      setAuth(authInstance);
      setDb(dbInstance);

      // Sign in anonymously
      signInAnonymously(authInstance)
        .then(() => {
          console.log('Signed in anonymously');
          setIsLoading(false);
        })
        .catch((error) => {
          console.error('Error signing in anonymously:', error);
          setIsLoading(false);
        });

      // Listen for auth state changes
      const unsubscribe = onAuthStateChanged(authInstance, (user) => {
        if (user) {
          console.log('User is signed in:', user.uid);
        } else {
          console.log('User is signed out');
        }
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Error initializing Firebase:', error);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = LANGUAGE_CODES[selectedLanguage]?.code || 'en-US';

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setTranscript(finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
    }

    // Initialize speech synthesis
    if ('speechSynthesis' in window) {
      synthesisRef.current = window.speechSynthesis;
    }
  }, [selectedLanguage]);

  const startListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const speak = (text) => {
    if (synthesisRef.current) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = LANGUAGE_CODES[selectedLanguage]?.code || 'en-US';
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      synthesisRef.current.speak(utterance);
    }
  };

  const saveConversation = async (conversation) => {
    if (db) {
      try {
        await addDoc(collection(db, 'conversations'), {
          ...conversation,
          timestamp: new Date(),
          userType,
          selectedLanguage
        });
      } catch (error) {
        console.error('Error saving conversation:', error);
      }
    }
  };

  const loadConversations = async () => {
    if (db) {
      try {
        const q = query(collection(db, 'conversations'));
        const querySnapshot = await getDocs(q);
        const conversationsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setConversations(conversationsData);
      } catch (error) {
        console.error('Error loading conversations:', error);
      }
    }
  };

  const handleUserTypeSelect = (type) => {
    setUserType(type);
    setSelectedCategory(null);
    setCurrentConversation(null);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setCurrentConversation(null);
  };

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
    if (recognitionRef.current) {
      recognitionRef.current.lang = LANGUAGE_CODES[language]?.code || 'en-US';
    }
  };

  const handleShowDirections = () => {
    setShowDirections(true);
  };

  const handleHideDirections = () => {
    setShowDirections(false);
  };

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: brandColors.lightGreyBackground
      }}>
        <div style={{ 
          textAlign: 'center',
          color: brandColors.darkGreyText
        }}>
          <h2>Loading Babel Fish...</h2>
          <p>Initializing Firebase connection...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: brandColors.lightGreyBackground,
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Header */}
      <header style={{
        backgroundColor: brandColors.primaryTeal,
        color: 'white',
        padding: '1rem',
        textAlign: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ margin: 0, fontSize: '2rem' }}>🐠 Babel Fish</h1>
        <p style={{ margin: '0.5rem 0 0 0', opacity: 0.9 }}>
          Library Staff & Customer Assistance
        </p>
      </header>

      {/* Language Selector */}
      <div style={{
        padding: '1rem',
        backgroundColor: 'white',
        borderBottom: `1px solid ${brandColors.lightGreyBackground}`
      }}>
        <label style={{ 
          display: 'block', 
          marginBottom: '0.5rem',
          color: brandColors.darkGreyText,
          fontWeight: 'bold'
        }}>
          Select Language / 选择语言:
        </label>
        <select 
          value={selectedLanguage} 
          onChange={(e) => handleLanguageChange(e.target.value)}
          style={{
            padding: '0.5rem',
            borderRadius: '4px',
            border: `1px solid ${brandColors.mediumGrey}`,
            fontSize: '1rem',
            width: '200px'
          }}
        >
          {Object.keys(LANGUAGE_CODES).map(lang => (
            <option key={lang} value={lang}>
              {lang} - {LANGUAGE_CODES[lang].nativeName}
            </option>
          ))}
        </select>
      </div>

      {/* Main Content */}
      <div style={{ padding: '2rem' }}>
        {!userType ? (
          // User Type Selection
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ color: brandColors.darkGreyText, marginBottom: '2rem' }}>
              Who are you? / 您是谁？
            </h2>
            <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center' }}>
              <button
                onClick={() => handleUserTypeSelect('staff')}
                style={{
                  padding: '2rem',
                  fontSize: '1.2rem',
                  backgroundColor: brandColors.primaryTeal,
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  minWidth: '200px',
                  transition: 'background-color 0.3s'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = brandColors.darkTeal}
                onMouseOut={(e) => e.target.style.backgroundColor = brandColors.primaryTeal}
              >
                👥 Staff / 员工
              </button>
              <button
                onClick={() => handleUserTypeSelect('customer')}
                style={{
                  padding: '2rem',
                  fontSize: '1.2rem',
                  backgroundColor: brandColors.accentRed,
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  minWidth: '200px',
                  transition: 'background-color 0.3s'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#D10000'}
                onMouseOut={(e) => e.target.style.backgroundColor = brandColors.accentRed}
              >
                👤 Customer / 顾客
              </button>
            </div>
          </div>
        ) : !selectedCategory ? (
          // Category Selection
          <div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              marginBottom: '2rem',
              gap: '1rem'
            }}>
              <button
                onClick={() => setUserType(null)}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: brandColors.mediumGrey,
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                ← Back
              </button>
              <h2 style={{ color: brandColors.darkGreyText, margin: 0 }}>
                {userType === 'staff' ? 'Staff Categories' : 'Customer Categories'}
              </h2>
            </div>
            
            <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
              {(userType === 'staff' ? STAFF_CATEGORY_ORDER : CUSTOMER_CATEGORY_ORDER).map(category => (
                <button
                  key={category}
                  onClick={() => handleCategorySelect(category)}
                  style={{
                    padding: '1.5rem',
                    fontSize: '1.1rem',
                    backgroundColor: 'white',
                    color: brandColors.darkGreyText,
                    border: `2px solid ${brandColors.lightGreyBackground}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.3s'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.borderColor = brandColors.primaryTeal;
                    e.target.style.backgroundColor = brandColors.lightTealBackground;
                  }}
                  onMouseOut={(e) => {
                    e.target.style.borderColor = brandColors.lightGreyBackground;
                    e.target.style.backgroundColor = 'white';
                  }}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        ) : (
          // Conversation Interface
          <div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              marginBottom: '2rem',
              gap: '1rem'
            }}>
              <button
                onClick={() => setSelectedCategory(null)}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: brandColors.mediumGrey,
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                ← Back
              </button>
              <h2 style={{ color: brandColors.darkGreyText, margin: 0 }}>
                {selectedCategory}
              </h2>
            </div>

            {/* Speech Controls */}
            <div style={{
              display: 'flex',
              gap: '1rem',
              marginBottom: '2rem',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={isListening ? stopListening : startListening}
                style={{
                  padding: '1rem 2rem',
                  fontSize: '1rem',
                  backgroundColor: isListening ? brandColors.accentRed : brandColors.primaryTeal,
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                {isListening ? '🛑 Stop Listening' : '🎤 Start Listening'}
              </button>
              
              <button
                onClick={() => speak('Hello, how can I help you today?')}
                disabled={isSpeaking}
                style={{
                  padding: '1rem 2rem',
                  fontSize: '1rem',
                  backgroundColor: isSpeaking ? brandColors.mediumGrey : brandColors.darkTeal,
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: isSpeaking ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                {isSpeaking ? '🔊 Speaking...' : '🔊 Speak'}
              </button>

              {userType === 'customer' && (
                <button
                  onClick={handleShowDirections}
                  style={{
                    padding: '1rem 2rem',
                    fontSize: '1rem',
                    backgroundColor: brandColors.filterButtonActiveBlue,
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  🗺️ Get Directions to Centrelink
                </button>
              )}
            </div>

            {/* Transcript Display */}
            {transcript && (
              <div style={{
                padding: '1rem',
                backgroundColor: brandColors.lightTealBackground,
                borderRadius: '8px',
                marginBottom: '2rem'
              }}>
                <h3 style={{ margin: '0 0 0.5rem 0', color: brandColors.darkGreyText }}>
                  Transcript / 转录:
                </h3>
                <p style={{ margin: 0, fontSize: '1.1rem' }}>{transcript}</p>
              </div>
            )}

            {/* Directions Modal */}
            {showDirections && (
              <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 1000
              }}>
                <div style={{
                  backgroundColor: 'white',
                  padding: '2rem',
                  borderRadius: '8px',
                  maxWidth: '90vw',
                  maxHeight: '90vh',
                  overflow: 'auto'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h2 style={{ margin: 0, color: brandColors.darkGreyText }}>
                      Directions to Centrelink Hurstville
                    </h2>
                    <button
                      onClick={handleHideDirections}
                      style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '1.5rem',
                        cursor: 'pointer',
                        color: brandColors.mediumGrey
                      }}
                    >
                      ✕
                    </button>
                  </div>
                  
                  <div style={{ marginBottom: '1rem' }}>
                    <p><strong>From:</strong> Hurstville Library, 12-16 MacMahon St, Hurstville NSW 2220</p>
                    <p><strong>To:</strong> Centrelink Hurstville, 125 Forest Rd, Hurstville NSW 2220</p>
                  </div>

                  <iframe
                    src={centrelinkMapsEmbedUrl}
                    width="100%"
                    height="400"
                    style={{ border: 0, borderRadius: '8px' }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>

                  <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                    <a
                      href={centrelinkMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-block',
                        padding: '1rem 2rem',
                        backgroundColor: brandColors.primaryTeal,
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '8px',
                        fontSize: '1.1rem'
                      }}
                    >
                      🗺️ Open in Google Maps
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App; 