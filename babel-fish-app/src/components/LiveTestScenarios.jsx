import React, { useState } from 'react';
import { brandColors } from '../utils/constants';
import FeedbackModal from './FeedbackModal';
import { submitFeedback } from '../services/feedback';

const scenarios = [
  {
    id: 'S1',
    title: 'Select a Display Language',
    context: 'A customer who speaks Mandarin has just approached the service desk. You need to set the app to show Mandarin translations so you can communicate with them.',
    steps: [
      'Confirm the app is in "For Staff" mode (the teal button should be active). If not, tap "For Staff".',
      'Find the row of language buttons below the mode selector.',
      'Tap "Mandarin" to select it as the display language.',
      'Scroll down and verify that each phrase card now shows English text on top with a Mandarin translation underneath.'
    ]
  },
  {
    id: 'S2',
    title: 'Play an Audio Phrase for a Customer',
    context: 'A Greek-speaking customer needs help but there is a language barrier. You want to play a greeting phrase out loud so the customer can understand.',
    steps: [
      'Make sure you are in "For Staff" mode.',
      'Select "Greek" from the language buttons.',
      'Scroll to find a greeting phrase (e.g. "Welcome to the library" or "How can I help you?").',
      'Tap the coloured speaker button on that phrase card.',
      'Listen to the audio that plays and observe the button state while it is speaking.'
    ]
  },
  {
    id: 'S3',
    title: 'Filter Phrases by Category',
    context: 'You are helping a customer with a book loan and only want to see transaction-related phrases, not the entire list.',
    steps: [
      'In "For Staff" mode, select any language.',
      'Find the category filter buttons (All, General Enquiries, Transactional, Digital Services).',
      'Tap "Transactional" to filter the list.',
      'Scroll through the results and confirm only borrowing/returning/renewal phrases appear.',
      'Tap "All" to reset the filter and confirm all phrases reappear.'
    ]
  }
];

const NoteIcon = ({ onClick }) => (
  <button
    onClick={onClick}
    aria-label="Leave feedback on this step"
    style={{
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: '4px',
      marginLeft: '8px',
      color: brandColors.mediumGrey,
      transition: 'color 0.2s ease'
    }}
    onMouseEnter={(e) => e.target.style.color = brandColors.primaryTeal}
    onMouseLeave={(e) => e.target.style.color = brandColors.mediumGrey}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
      <path d="M9 12h6" />
      <path d="M9 16h6" />
      <path d="M9 8h2" />
    </svg>
  </button>
);

const LiveTestScenarios = () => {
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackContext, setFeedbackContext] = useState({});
  const [completedSteps, setCompletedSteps] = useState({});

  const handleNoteClick = (scenarioId, scenarioTitle, stepIndex, stepText) => {
    setFeedbackContext({
      scenario: `${scenarioId}: ${scenarioTitle}`,
      step: `Step ${stepIndex + 1}: ${stepText}`,
      pageUrl: window.location.href
    });
    setShowFeedbackModal(true);
  };

  const toggleStep = (scenarioId, stepIndex) => {
    const key = `${scenarioId}-${stepIndex}`;
    setCompletedSteps(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const getProgress = (scenario) => {
    const completed = scenario.steps.filter((_, idx) => 
      completedSteps[`${scenario.id}-${idx}`]
    ).length;
    return {
      completed,
      total: scenario.steps.length,
      percentage: Math.round((completed / scenario.steps.length) * 100)
    };
  };

  const handleSubmitFeedback = async (feedbackData) => {
    const enhancedData = {
      ...feedbackData,
      ...feedbackContext
    };
    return submitFeedback(enhancedData);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ color: brandColors.darkGreyText, marginBottom: '30px' }}>
        Live Test Scenarios
      </h1>
      
      {scenarios.map((scenario) => {
        const progress = getProgress(scenario);
        
        return (
          <div
            key={scenario.id}
            style={{
              backgroundColor: brandColors.lightTealBackground,
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '24px',
              border: `2px solid ${brandColors.primaryTeal}`
            }}
          >
            <h2 style={{ color: brandColors.darkTeal, marginTop: 0 }}>
              {scenario.id}: {scenario.title}
            </h2>
            
            <p style={{ color: brandColors.darkGreyText, fontSize: '0.95rem', marginBottom: '16px' }}>
              <strong>Context:</strong> {scenario.context}
            </p>
            
            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.9rem', color: brandColors.mediumGrey }}>
                  {progress.percentage}% complete
                </span>
                <span style={{ fontSize: '0.9rem', color: brandColors.mediumGrey }}>
                  {progress.completed} / {progress.total} steps
                </span>
              </div>
              <div
                style={{
                  width: '100%',
                  height: '8px',
                  backgroundColor: 'white',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}
              >
                <div
                  style={{
                    width: `${progress.percentage}%`,
                    height: '100%',
                    backgroundColor: brandColors.primaryTeal,
                    transition: 'width 0.3s ease'
                  }}
                />
              </div>
            </div>

            <ol style={{ paddingLeft: '20px', margin: 0 }}>
              {scenario.steps.map((step, index) => {
                const isCompleted = completedSteps[`${scenario.id}-${index}`];
                
                return (
                  <li
                    key={index}
                    style={{
                      marginBottom: '12px',
                      color: isCompleted ? brandColors.mediumGrey : brandColors.darkGreyText,
                      textDecoration: isCompleted ? 'line-through' : 'none',
                      display: 'flex',
                      alignItems: 'flex-start'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isCompleted || false}
                      onChange={() => toggleStep(scenario.id, index)}
                      style={{ marginRight: '8px', marginTop: '4px' }}
                    />
                    <span style={{ flex: 1 }}>{step}</span>
                    <NoteIcon
                      onClick={() => handleNoteClick(scenario.id, scenario.title, index, step)}
                    />
                  </li>
                );
              })}
            </ol>

            {progress.percentage === 100 && (
              <div
                style={{
                  marginTop: '16px',
                  padding: '12px',
                  backgroundColor: brandColors.primaryTeal,
                  color: 'white',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}
              >
                ✓ Scenario Complete!
              </div>
            )}
          </div>
        );
      })}

      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        onSubmit={handleSubmitFeedback}
        scenario={feedbackContext.scenario}
      />
    </div>
  );
};

export default LiveTestScenarios;
