import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// ---------------------------------------------------------------------------
// Mock the speech service singleton so no real browser APIs are needed.
// ---------------------------------------------------------------------------
vi.mock('../services/speech', () => ({
  default: {
    speakPhrase: vi.fn(),
    startListening: vi.fn(),
    stopListening: vi.fn(),
    setRecognitionLanguage: vi.fn(),
    isSpeechSynthesisSupported: vi.fn().mockReturnValue(true),
    isSpeechRecognitionSupported: vi.fn().mockReturnValue(true),
  },
}));

import { useSpeech } from './useSpeech';
import speechService from '../services/speech';

describe('useSpeech', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // -------------------------------------------------------------------------
  // Initial state
  // -------------------------------------------------------------------------
  it('initialises with isListening=false, isSpeaking=false, error=null', () => {
    const { result } = renderHook(() => useSpeech());
    expect(result.current.isListening).toBe(false);
    expect(result.current.isSpeaking).toBe(false);
    expect(result.current.error).toBeNull();
  });

  // -------------------------------------------------------------------------
  // speakPhrase
  // -------------------------------------------------------------------------
  describe('speakPhrase', () => {
    it('calls speechService.speakPhrase with text and langCode', () => {
      const { result } = renderHook(() => useSpeech());
      act(() => result.current.speakPhrase('Hello', 'en-US'));
      expect(speechService.speakPhrase).toHaveBeenCalledWith('Hello', 'en-US');
    });

    it('sets isSpeaking to true immediately after calling', () => {
      const { result } = renderHook(() => useSpeech());
      act(() => result.current.speakPhrase('Hello', 'en-US'));
      expect(result.current.isSpeaking).toBe(true);
    });

    it('resets isSpeaking to false after the 1-second timeout', () => {
      const { result } = renderHook(() => useSpeech());
      act(() => result.current.speakPhrase('Hello', 'en-US'));
      act(() => vi.advanceTimersByTime(1000));
      expect(result.current.isSpeaking).toBe(false);
    });

    it('sets error state when speechService.speakPhrase throws', () => {
      speechService.speakPhrase.mockImplementationOnce(() => {
        throw new Error('synthesis failed');
      });
      const { result } = renderHook(() => useSpeech());
      act(() => result.current.speakPhrase('Hello', 'en-US'));
      expect(result.current.error).toBe('synthesis failed');
      expect(result.current.isSpeaking).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // startListening
  // -------------------------------------------------------------------------
  describe('startListening', () => {
    it('sets isListening to true after call', () => {
      const { result } = renderHook(() => useSpeech());
      act(() => result.current.startListening(vi.fn(), vi.fn()));
      expect(result.current.isListening).toBe(true);
    });

    it('invokes the onResult callback passed in and resets isListening', () => {
      const onResult = vi.fn();
      const { result } = renderHook(() => useSpeech());

      // Capture the callbacks passed to speechService.startListening
      let capturedOnResult;
      speechService.startListening.mockImplementationOnce((res) => {
        capturedOnResult = res;
      });

      act(() => result.current.startListening(onResult, vi.fn()));
      act(() => capturedOnResult('Where is the printer?'));

      expect(onResult).toHaveBeenCalledWith('Where is the printer?');
      expect(result.current.isListening).toBe(false);
    });

    it('calls onError callback and sets error state on recognition failure', () => {
      const onError = vi.fn();
      const { result } = renderHook(() => useSpeech());

      let capturedOnError;
      speechService.startListening.mockImplementationOnce((_res, err) => {
        capturedOnError = err;
      });

      act(() => result.current.startListening(vi.fn(), onError));
      act(() => capturedOnError('no-speech'));

      expect(onError).toHaveBeenCalledWith('no-speech');
      expect(result.current.error).toBe('no-speech');
      expect(result.current.isListening).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // stopListening
  // -------------------------------------------------------------------------
  describe('stopListening', () => {
    it('calls speechService.stopListening and sets isListening to false', () => {
      const { result } = renderHook(() => useSpeech());
      act(() => result.current.startListening(vi.fn(), vi.fn()));
      act(() => result.current.stopListening());
      expect(speechService.stopListening).toHaveBeenCalled();
      expect(result.current.isListening).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // setRecognitionLanguage
  // -------------------------------------------------------------------------
  describe('setRecognitionLanguage', () => {
    it('delegates to speechService.setRecognitionLanguage', () => {
      const { result } = renderHook(() => useSpeech());
      act(() => result.current.setRecognitionLanguage('Mandarin'));
      expect(speechService.setRecognitionLanguage).toHaveBeenCalledWith('Mandarin');
    });
  });

  // -------------------------------------------------------------------------
  // Support checks
  // -------------------------------------------------------------------------
  describe('isSpeechSynthesisSupported', () => {
    it('returns the value from speechService', () => {
      const { result } = renderHook(() => useSpeech());
      expect(result.current.isSpeechSynthesisSupported()).toBe(true);
    });

    it('returns false when service reports unsupported', () => {
      speechService.isSpeechSynthesisSupported.mockReturnValueOnce(false);
      const { result } = renderHook(() => useSpeech());
      expect(result.current.isSpeechSynthesisSupported()).toBe(false);
    });
  });

  describe('isSpeechRecognitionSupported', () => {
    it('returns the value from speechService', () => {
      const { result } = renderHook(() => useSpeech());
      expect(result.current.isSpeechRecognitionSupported()).toBe(true);
    });
  });
});
