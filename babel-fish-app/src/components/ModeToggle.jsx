import React from 'react';
import { brandColors } from '../utils/constants';

const ModeToggle = ({ mode, onModeChange }) => {
  return (
    <div className="mode-toggle" style={{ marginBottom: '2rem' }}>
      <h3 style={{ 
        color: brandColors.darkGreyText, 
        marginBottom: '1rem',
        fontSize: '1.1rem',
        fontWeight: '600'
      }}>
        Select User Mode:
      </h3>
      
      <div style={{
        display: 'flex',
        gap: '1rem',
        justifyContent: 'center'
      }}>
        <button
          onClick={() => onModeChange('staff')}
          style={{
            padding: '1rem 2rem',
            borderRadius: '12px',
            border: 'none',
            backgroundColor: mode === 'staff' 
              ? brandColors.primaryTeal 
              : brandColors.lightGreyBackground,
            color: mode === 'staff' 
              ? 'white' 
              : brandColors.darkGreyText,
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '600',
            transition: 'all 0.2s ease',
            boxShadow: mode === 'staff' 
              ? '0 4px 12px rgba(0, 169, 157, 0.3)' 
              : '0 2px 8px rgba(0, 0, 0, 0.1)',
            minWidth: '120px'
          }}
          onMouseEnter={(e) => {
            if (mode !== 'staff') {
              e.target.style.backgroundColor = brandColors.filterButtonHoverBg;
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.15)';
            }
          }}
          onMouseLeave={(e) => {
            if (mode !== 'staff') {
              e.target.style.backgroundColor = brandColors.lightGreyBackground;
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
            }
          }}
        >
          Staff Mode
        </button>
        
        <button
          onClick={() => onModeChange('customer')}
          style={{
            padding: '1rem 2rem',
            borderRadius: '12px',
            border: 'none',
            backgroundColor: mode === 'customer' 
              ? brandColors.accentRed 
              : brandColors.lightGreyBackground,
            color: mode === 'customer' 
              ? 'white' 
              : brandColors.darkGreyText,
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '600',
            transition: 'all 0.2s ease',
            boxShadow: mode === 'customer' 
              ? '0 4px 12px rgba(235, 0, 27, 0.3)' 
              : '0 2px 8px rgba(0, 0, 0, 0.1)',
            minWidth: '120px'
          }}
          onMouseEnter={(e) => {
            if (mode !== 'customer') {
              e.target.style.backgroundColor = brandColors.filterButtonHoverBg;
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.15)';
            }
          }}
          onMouseLeave={(e) => {
            if (mode !== 'customer') {
              e.target.style.backgroundColor = brandColors.lightGreyBackground;
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
            }
          }}
        >
          Customer Mode
        </button>
      </div>
    </div>
  );
};

export default ModeToggle; 