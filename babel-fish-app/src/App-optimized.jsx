import React, { useState, useEffect } from 'react';
import { useFirebase } from './hooks/useFirebase';
import { useSpeech } from './hooks/useSpeech';
import LanguageSelector from './components/LanguageSelector';
import ModeToggle from './components/ModeToggle';
import CategoryFilter from './components/CategoryFilter';
import PhraseCard from './components/PhraseCard';
import { brandColors } from './utils/constants';
import { initialPhrases } from './utils/initialPhrases';

function App() {
  // State management
  const [mode, setMode] = useState('staff');
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [phrases, setPhrases] = useState([]);
  const [filteredPhrases, setFilteredPhrases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Custom hooks
  const { 
    user, 
    isInitialized, 
    addDocument, 
    subscribeToCollection, 
    logConversation 
  } = useFirebase();
  
  const { 
    speakPhrase, 
    isSpeaking 
  } = useSpeech();

  // Initialize phrases from Firebase or use initial data
  useEffect(() => {
    const initializePhrases = async () => {
      try {
        // Try to get phrases from Firebase
        const unsubscribe = subscribeToCollection('phrases', (firebasePhrases) => {
          if (firebasePhrases.length > 0) {
            setPhrases(firebasePhrases);
          } else {
            // If no phrases in Firebase, seed with initial data
            seedInitialData();
            setPhrases(initialPhrases);
          }
          setIsLoading(false);
        });

        return unsubscribe;
      } catch (error) {
        console.error('Error initializing phrases:', error);
        setPhrases(initialPhrases);
        setIsLoading(false);
      }
    };

    if (isInitialized) {
      initializePhrases();
    }
  }, [isInitialized, subscribeToCollection]);

  // Filter phrases based on selected category and mode
  useEffect(() => {
    const filtered = phrases.filter(phrase => {
      const categoryMatch = selectedCategory === 'All' || phrase.category === selectedCategory;
      const modeMatch = phrase.type === mode;
      return categoryMatch && modeMatch;
    });
    setFilteredPhrases(filtered);
  }, [phrases, selectedCategory, mode]);

  // Seed initial data to Firebase
  const seedInitialData = async () => {
    try {
      for (const phrase of initialPhrases) {
        await addDocument('phrases', phrase);
      }
      console.log('Initial phrases seeded successfully');
    } catch (error) {
      console.error('Error seeding initial data:', error);
    }
  };

  // Handle phrase speaking
  const handleSpeak = (text, langCode) => {
    speakPhrase(text, langCode);
  };

  // Handle conversation logging
  const handleLogConversation = (phraseId, userType) => {
    logConversation(phraseId, userType);
  };

  // Handle mode change
  const handleModeChange = (newMode) => {
    setMode(newMode);
    setSelectedCategory('All'); // Reset category when mode changes
  };

  // Handle language change
  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
  };

  // Handle category change
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  if (!isInitialized) {
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
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid',
            borderTop: `4px solid ${brandColors.primaryTeal}`,
            borderRight: '4px solid transparent',
            borderBottom: '4px solid transparent',
            borderLeft: '4px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p>Initializing Babel Fish...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: brandColors.lightGreyBackground,
      padding: '2rem',
      fontFamily: 'Work Sans, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '3rem'
      }}>
        <h1 style={{
          color: brandColors.primaryTeal,
          fontSize: '2.5rem',
          fontWeight: '700',
          marginBottom: '0.5rem'
        }}>
          Babel Fish
        </h1>
        <p style={{
          color: brandColors.mediumGrey,
          fontSize: '1.1rem',
          marginBottom: '2rem'
        }}>
          Library Communication Assistant
        </p>
      </div>

      {/* Mode Toggle */}
      <ModeToggle mode={mode} onModeChange={handleModeChange} />

      {/* Language Selector */}
      <LanguageSelector 
        selectedLanguage={selectedLanguage}
        onLanguageChange={handleLanguageChange}
        mode={mode}
      />

      {/* Category Filter */}
      <CategoryFilter 
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
        mode={mode}
      />

      {/* Phrases Grid */}
      {isLoading ? (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          color: brandColors.mediumGrey
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid',
            borderTop: `4px solid ${brandColors.primaryTeal}`,
            borderRight: '4px solid transparent',
            borderBottom: '4px solid transparent',
            borderLeft: '4px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p>Loading phrases...</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '2rem',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {filteredPhrases.map((phrase) => (
            <PhraseCard
              key={phrase.id}
              phrase={phrase}
              selectedLanguage={selectedLanguage}
              onSpeak={handleSpeak}
              onLogConversation={handleLogConversation}
              mode={mode}
              isSpeaking={isSpeaking}
            />
          ))}
        </div>
      )}

      {/* No phrases message */}
      {!isLoading && filteredPhrases.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          color: brandColors.mediumGrey
        }}>
          <p>No phrases found for the selected category.</p>
        </div>
      )}

      {/* CSS for animations */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default App; 