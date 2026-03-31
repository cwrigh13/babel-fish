// Feedback service for submitting user feedback via Formspree

const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mreoqnld';

/**
 * Submit user feedback via Formspree
 * @param {Object} feedbackData - The feedback data
 * @param {string} feedbackData.message - The user's feedback message
 * @param {string} feedbackData.pageUrl - The current page URL
 * @param {string} feedbackData.userAgent - The user's browser/user agent
 * @param {string} feedbackData.scenario - The test scenario or context
 * @returns {Promise<Object>} - The response from the server
 */
export const submitFeedback = async (feedbackData) => {
  try {
    const response = await fetch(FORMSPREE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        message: feedbackData.message,
        pageUrl: feedbackData.pageUrl,
        userAgent: feedbackData.userAgent,
        scenario: feedbackData.scenario || 'General Testing',
        _subject: `Babel Fish Feedback - ${feedbackData.scenario || 'General Testing'}`,
        _replyto: 'noreply@babel-fish.app'
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error submitting feedback:', error);
    throw error;
  }
};

export default {
  submitFeedback
};
