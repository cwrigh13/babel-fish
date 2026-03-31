import React, { useState } from 'react';
import { brandColors } from '../utils/constants';

// Replace with your Formspree form endpoint, e.g. 'https://formspree.io/f/xxxxxxxx'
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mreoqnld';

const FeedbackModal = ({ isOpen, onClose, scenario, stepContext }) => {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!message.trim()) {
      setSubmitStatus({ type: 'error', text: 'Please enter a message' });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          message: message.trim(),
          scenario: scenario || 'General Testing',
          step: stepContext || '',
          page: window.location.href
        })
      });

      if (!response.ok) throw new Error('Submission failed');

      setSubmitStatus({ type: 'success', text: 'Feedback submitted — thank you!' });
      setMessage('');
      setTimeout(() => {
        onClose();
        setSubmitStatus(null);
      }, 2000);
    } catch {
      setSubmitStatus({ type: 'error', text: 'Failed to submit. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
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

        <form onSubmit={handleSubmit}>
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
              disabled={isSubmitting}
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
            {stepContext && <div>Step: {stepContext}</div>}
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
              disabled={isSubmitting}
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
              disabled={isSubmitting}
              style={{
                padding: '10px 24px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: brandColors.primaryTeal,
                color: 'white',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
                fontWeight: '500',
                opacity: isSubmitting ? 0.7 : 1
              }}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeedbackModal;
