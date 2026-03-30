import React, { useState } from 'react';
import { brandColors } from '../utils/constants';

const GITHUB_REPO_URL = 'https://github.com/cwrigh13/babel-fish';

const FeedbackModal = ({ isOpen, onClose, onSubmit, scenario }) => {
  const [message, setMessage] = useState('');
  const [submitStatus, setSubmitStatus] = useState(null);

  if (!isOpen) return null;

  const handleOpenGitHubIssue = (e) => {
    e.preventDefault();

    if (!message.trim()) {
      setSubmitStatus({ type: 'error', text: 'Please enter a message' });
      return;
    }

    const title = `[Testing Feedback] ${scenario || 'General Testing'}`;
    const body = `## Feedback\n\n${message.trim()}\n\n---\n**Context:**\n- Scenario: ${scenario || 'General Testing'}\n- Page: ${window.location.href}\n- User Agent: ${navigator.userAgent}`;

    const issueUrl = `${GITHUB_REPO_URL}/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
    window.open(issueUrl, '_blank');

    setMessage('');
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '24px',
          maxWidth: '500px',
          width: '90%',
          maxHeight: '80vh',
          overflow: 'auto',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, color: brandColors.darkGreyText, fontSize: '1.5rem', fontWeight: '600' }}>
            Leave Feedback
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: brandColors.mediumGrey,
              padding: '4px 8px',
              lineHeight: 1
            }}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleOpenGitHubIssue}>
          <div style={{ marginBottom: '16px' }}>
            <label
              htmlFor="feedback-message"
              style={{
                display: 'block',
                marginBottom: '8px',
                color: brandColors.darkGreyText,
                fontSize: '0.875rem',
                fontWeight: '500'
              }}
            >
              Your feedback:
            </label>
            <textarea
              id="feedback-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe what you noticed, any issues, or suggestions..."
              rows={5}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: `1px solid ${brandColors.filterButtonHoverBg}`,
                fontSize: '1rem',
                resize: 'vertical',
                minHeight: '120px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div
            style={{
              backgroundColor: brandColors.lightGreyBackground,
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '0.8rem',
              color: brandColors.mediumGrey
            }}
          >
            <strong>Context captured:</strong>
            <div>Scenario: {scenario || 'General Testing'}</div>
            <div>Page: {window.location.pathname}</div>
          </div>

          {submitStatus && (
            <div
              style={{
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '16px',
                backgroundColor: submitStatus.type === 'error' ? brandColors.lightRedBackground : brandColors.lightTealBackground,
                color: submitStatus.type === 'error' ? brandColors.accentRed : brandColors.darkTeal,
                fontSize: '0.9rem'
              }}
            >
              {submitStatus.text}
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: `1px solid ${brandColors.filterButtonHoverBg}`,
                backgroundColor: 'white',
                color: brandColors.darkGreyText,
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '500'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: '10px 24px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: brandColors.primaryTeal,
                color: 'white',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '500'
              }}
            >
              Open GitHub Issue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeedbackModal;
