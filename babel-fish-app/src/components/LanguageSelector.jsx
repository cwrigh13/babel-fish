import React from 'react';
import { LANGUAGE_CODES, brandColors } from '../utils/constants';

const LanguageSelector = ({ selectedLanguage, onLanguageChange, mode }) => {
  const languages = Object.keys(LANGUAGE_CODES);

  return (
    <div className="language-selector">
      <h3 style={{ 
        color: brandColors.darkGreyText, 
        marginBottom: '1rem',
        fontSize: '1.1rem',
        fontWeight: '600'
      }}>
        {mode === 'staff' ? 'Select Language for Staff Communication:' : 'Select Language for Customer Communication:'}
      </h3>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
        gap: '0.75rem',
        marginBottom: '2rem'
      }}>
        {languages.map((language) => (
          <button
            key={language}
            onClick={() => onLanguageChange(language)}
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '50px',
              border: 'none',
              backgroundColor: selectedLanguage === language 
                ? brandColors.primaryTeal 
                : brandColors.lightGreyBackground,
              color: selectedLanguage === language 
                ? 'white' 
                : brandColors.darkGreyText,
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: selectedLanguage === language ? '600' : '500',
              transition: 'all 0.2s ease',
              boxShadow: selectedLanguage === language 
                ? '0 2px 8px rgba(0, 169, 157, 0.3)' 
                : '0 1px 3px rgba(0, 0, 0, 0.1)',
              ':hover': {
                backgroundColor: selectedLanguage === language 
                  ? brandColors.darkTeal 
                  : brandColors.filterButtonHoverBg,
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
              }
            }}
            onMouseEnter={(e) => {
              if (selectedLanguage !== language) {
                e.target.style.backgroundColor = brandColors.filterButtonHoverBg;
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
              }
            }}
            onMouseLeave={(e) => {
              if (selectedLanguage !== language) {
                e.target.style.backgroundColor = brandColors.lightGreyBackground;
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
              }
            }}
          >
            {LANGUAGE_CODES[language].nativeName}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSelector; 