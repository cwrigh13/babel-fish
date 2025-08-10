import { LANGUAGE_CODES } from '../utils/constants';

class SpeechService {
  constructor() {
    this.synthesis = window.speechSynthesis;
    this.recognition = null;
    this.isListening = false;
    this.initializeSpeechRecognition();
  }

  // Initialize speech recognition
  initializeSpeechRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';
    }
  }

  // Speak text using speech synthesis
  speakPhrase(text, langCode) {
    if (!this.synthesis) {
      console.warn('Speech synthesis not supported');
      return;
    }

    // Cancel any ongoing speech
    this.synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langCode;
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    // Find a voice for the specified language
    const voices = this.synthesis.getVoices();
    const voice = voices.find(v => v.lang.startsWith(langCode.split('-')[0]));
    if (voice) {
      utterance.voice = voice;
    }

    this.synthesis.speak(utterance);
  }

  // Start speech recognition
  startListening(onResult, onError) {
    if (!this.recognition) {
      console.warn('Speech recognition not supported');
      return;
    }

    this.isListening = true;
    this.recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
      this.isListening = false;
    };

    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      onError(event.error);
      this.isListening = false;
    };

    this.recognition.onend = () => {
      this.isListening = false;
    };

    this.recognition.start();
  }

  // Stop speech recognition
  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  // Check if speech synthesis is supported
  isSpeechSynthesisSupported() {
    return !!this.synthesis;
  }

  // Check if speech recognition is supported
  isSpeechRecognitionSupported() {
    return !!this.recognition;
  }

  // Get available voices
  getAvailableVoices() {
    return this.synthesis ? this.synthesis.getVoices() : [];
  }

  // Set recognition language
  setRecognitionLanguage(language) {
    if (this.recognition && LANGUAGE_CODES[language]) {
      this.recognition.lang = LANGUAGE_CODES[language].code;
    }
  }
}

// Create and export singleton instance
const speechService = new SpeechService();
export default speechService; 