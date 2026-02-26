import { useState, useCallback } from 'react';
import speechService from '../services/speech';

export const useSpeech = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState(null);

  const speakPhrase = useCallback((text, langCode) => {
    try {
      setIsSpeaking(true);
      setError(null);
      speechService.speakPhrase(text, langCode);
      
      // Reset speaking state after a delay
      setTimeout(() => {
        setIsSpeaking(false);
      }, 1000);
    } catch (err) {
      setError(err.message);
      setIsSpeaking(false);
    }
  }, []);

  const startListening = useCallback((onResult, onError) => {
    try {
      setIsListening(true);
      setError(null);
      speechService.startListening(
        (transcript) => {
          setIsListening(false);
          onResult(transcript);
        },
        (error) => {
          setIsListening(false);
          setError(error);
          onError(error);
        }
      );
    } catch (err) {
      setError(err.message);
      setIsListening(false);
    }
  }, []);

  const stopListening = useCallback(() => {
    speechService.stopListening();
    setIsListening(false);
  }, []);

  const setRecognitionLanguage = useCallback((language) => {
    speechService.setRecognitionLanguage(language);
  }, []);

  const isSpeechSynthesisSupported = useCallback(() => {
    return speechService.isSpeechSynthesisSupported();
  }, []);

  const isSpeechRecognitionSupported = useCallback(() => {
    return speechService.isSpeechRecognitionSupported();
  }, []);

  return {
    isListening,
    isSpeaking,
    error,
    speakPhrase,
    startListening,
    stopListening,
    setRecognitionLanguage,
    isSpeechSynthesisSupported,
    isSpeechRecognitionSupported,
  };
}; 