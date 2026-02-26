import React from 'react';
import { brandColors, LANGUAGE_CODES } from '../utils/constants';

const PhraseCard = ({ 
  phrase, 
  selectedLanguage, 
  onSpeak, 
  onLogConversation, 
  mode,
  isSpeaking 
}) => {
  const translation = phrase.translations[LANGUAGE_CODES[selectedLanguage]?.code] || phrase.english;
  const langCode = LANGUAGE_CODES[selectedLanguage]?.code || 'en-US';

  const handleSpeak = () => {
    onSpeak(translation, langCode);
    if (onLogConversation) {
      onLogConversation(phrase.id, mode);
    }
  };

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '1.5rem',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      border: `2px solid ${brandColors.lightTealBackground}`,
      transition: 'all 0.2s ease',
      cursor: 'pointer',
      position: 'relative',
      overflow: 'hidden'
    }}
    onMouseEnter={(e) => {
      e.target.style.transform = 'translateY(-2px)';
      e.target.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.15)';
    }}
    onMouseLeave={(e) => {
      e.target.style.transform = 'translateY(0)';
      e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
    }}
    onClick={handleSpeak}
    >
      {/* English text */}
      <div style={{
        color: brandColors.darkGreyText,
        fontSize: '0.9rem',
        marginBottom: '0.75rem',
        fontWeight: '500',
        lineHeight: '1.4'
      }}>
        {phrase.english}
      </div>
      
      {/* Translation */}
      <div style={{
        color: brandColors.primaryTeal,
        fontSize: '1.1rem',
        fontWeight: '600',
        marginBottom: '1rem',
        lineHeight: '1.5',
        minHeight: '2.5rem',
        display: 'flex',
        alignItems: 'center'
      }}>
        {translation}
      </div>
      
      {/* Play button */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        backgroundColor: isSpeaking ? brandColors.darkTeal : brandColors.primaryTeal,
        color: 'white',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        margin: '0 auto'
      }}>
        {isSpeaking ? (
          <div style={{
            width: '20px',
            height: '20px',
            border: '2px solid white',
            borderTop: '2px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
        ) : (
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="currentColor"
          >
            <path d="M8 5v14l11-7z"/>
          </svg>
        )}
      </div>
      
      {/* Category badge */}
      <div style={{
        position: 'absolute',
        top: '0.75rem',
        right: '0.75rem',
        backgroundColor: brandColors.lightTealBackground,
        color: brandColors.primaryTeal,
        padding: '0.25rem 0.75rem',
        borderRadius: '20px',
        fontSize: '0.75rem',
        fontWeight: '600'
      }}>
        {phrase.category}
      </div>
    </div>
  );
};

export default PhraseCard; 