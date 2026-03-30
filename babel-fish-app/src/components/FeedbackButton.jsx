import React from 'react';
import { brandColors } from '../utils/constants';

const FeedbackButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      aria-label="Leave feedback"
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        border: 'none',
        backgroundColor: brandColors.primaryTeal,
        color: 'white',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(0, 169, 157, 0.4)',
        transition: 'all 0.2s ease',
        zIndex: 9999
      }}
      onMouseEnter={(e) => {
        e.target.style.backgroundColor = brandColors.darkTeal;
        e.target.style.transform = 'scale(1.1)';
        e.target.style.boxShadow = '0 6px 20px rgba(0, 169, 157, 0.5)';
      }}
      onMouseLeave={(e) => {
        e.target.style.backgroundColor = brandColors.primaryTeal;
        e.target.style.transform = 'scale(1)';
        e.target.style.boxShadow = '0 4px 12px rgba(0, 169, 157, 0.4)';
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    </button>
  );
};

export default FeedbackButton;
