// Feedback service for submitting user feedback to GitHub Issues
// via the backend API proxy

const API_BASE_URL = typeof __api_url !== 'undefined'
  ? __api_url
  : (import.meta.env?.VITE_API_URL || 'http://localhost:5000');

/**
 * Submit user feedback to be created as a GitHub issue
 * @param {Object} feedbackData - The feedback data
 * @param {string} feedbackData.message - The user's feedback message
 * @param {string} feedbackData.pageUrl - The current page URL
 * @param {string} feedbackData.userAgent - The user's browser/user agent
 * @param {string} feedbackData.scenario - The test scenario or context
 * @returns {Promise<Object>} - The response from the server
 */
export const submitFeedback = async (feedbackData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(feedbackData)
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
