import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// vi.hoisted runs BEFORE static imports, so the globals are in place when
// speech.js is first evaluated and the SpeechService singleton is created.
// ---------------------------------------------------------------------------
const {
  mockSpeechSynthesis,
  mockVoices,
  MockSpeechRecognition,
  MockSpeechSynthesisUtterance,
} = vi.hoisted(() => {
  const mockVoices = [
    { lang: 'zh-CN', name: 'Google Mandarin' },
    { lang: 'en-US', name: 'Google English' },
    { lang: 'es-ES', name: 'Google Spanish' },
  ];

  const mockSpeechSynthesis = {
    cancel: vi.fn(),
    speak: vi.fn(),
    getVoices: vi.fn().mockReturnValue(mockVoices),
  };

  // Must be a regular function / class so it works with `new`
  function MockSpeechSynthesisUtterance(text) {
    this.text = text;
    this.lang = '';
    this.rate = 1;
    this.pitch = 1;
    this.volume = 1;
    this.voice = null;
  }

  function MockSpeechRecognition() {
    this.continuous = false;
    this.interimResults = false;
    this.lang = '';
    this.start = vi.fn();
    this.stop = vi.fn();
    this.onresult = null;
    this.onerror = null;
    this.onend = null;
  }

  // Install globals before the module is evaluated
  global.speechSynthesis = mockSpeechSynthesis;
  global.SpeechSynthesisUtterance = MockSpeechSynthesisUtterance;
  global.SpeechRecognition = MockSpeechRecognition;

  return { mockSpeechSynthesis, mockVoices, MockSpeechRecognition, MockSpeechSynthesisUtterance };
});

// Static import — evaluated AFTER vi.hoisted, so globals are already set.
import speechService from './speech';

describe('SpeechService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Restore getVoices return value after clearAllMocks
    mockSpeechSynthesis.getVoices.mockReturnValue(mockVoices);
  });

  // -------------------------------------------------------------------------
  // Support detection
  // -------------------------------------------------------------------------
  describe('isSpeechSynthesisSupported', () => {
    it('returns true when window.speechSynthesis is available', () => {
      expect(speechService.isSpeechSynthesisSupported()).toBe(true);
    });
  });

  describe('isSpeechRecognitionSupported', () => {
    it('returns true when SpeechRecognition is available', () => {
      expect(speechService.isSpeechRecognitionSupported()).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // getAvailableVoices
  // -------------------------------------------------------------------------
  describe('getAvailableVoices', () => {
    it('returns the voices from speechSynthesis', () => {
      const voices = speechService.getAvailableVoices();
      expect(voices).toEqual(mockVoices);
    });
  });

  // -------------------------------------------------------------------------
  // speakPhrase
  // -------------------------------------------------------------------------
  describe('speakPhrase', () => {
    it('cancels any ongoing speech before speaking', () => {
      speechService.speakPhrase('Hello', 'en-US');
      expect(mockSpeechSynthesis.cancel).toHaveBeenCalled();
    });

    it('calls speechSynthesis.speak', () => {
      speechService.speakPhrase('Hello', 'en-US');
      expect(mockSpeechSynthesis.speak).toHaveBeenCalledTimes(1);
    });

    it('sets the utterance language correctly', () => {
      speechService.speakPhrase('Hola', 'es-ES');
      // The utterance passed to speak() should have lang = 'es-ES'
      const utterance = mockSpeechSynthesis.speak.mock.calls[0][0];
      expect(utterance.lang).toBe('es-ES');
    });

    it('selects a matching voice for en-US', () => {
      speechService.speakPhrase('Hello', 'en-US');
      const utterance = mockSpeechSynthesis.speak.mock.calls[0][0];
      expect(utterance.voice).toEqual({ lang: 'en-US', name: 'Google English' });
    });

    it('selects a matching voice for zh-CN', () => {
      speechService.speakPhrase('你好', 'zh-CN');
      const utterance = mockSpeechSynthesis.speak.mock.calls[0][0];
      expect(utterance.voice).toEqual({ lang: 'zh-CN', name: 'Google Mandarin' });
    });

    it('leaves voice as null when no matching voice is found', () => {
      speechService.speakPhrase('مرحباً', 'ar-SA'); // No Arabic mock voice
      const utterance = mockSpeechSynthesis.speak.mock.calls[0][0];
      expect(utterance.voice).toBeNull();
    });
  });

  // -------------------------------------------------------------------------
  // startListening / stopListening
  // -------------------------------------------------------------------------
  describe('startListening', () => {
    it('sets isListening to true', () => {
      speechService.startListening(vi.fn(), vi.fn());
      expect(speechService.isListening).toBe(true);
    });

    it('calls recognition.start()', () => {
      speechService.startListening(vi.fn(), vi.fn());
      expect(speechService.recognition.start).toHaveBeenCalled();
    });

    it('invokes the onResult callback with the transcript', () => {
      const onResult = vi.fn();
      speechService.startListening(onResult, vi.fn());

      const event = { results: [[{ transcript: 'Where is the library?' }]] };
      speechService.recognition.onresult(event);

      expect(onResult).toHaveBeenCalledWith('Where is the library?');
      expect(speechService.isListening).toBe(false);
    });

    it('invokes onError callback on recognition error and clears isListening', () => {
      const onError = vi.fn();
      speechService.startListening(vi.fn(), onError);

      speechService.recognition.onerror({ error: 'network' });

      expect(onError).toHaveBeenCalledWith('network');
      expect(speechService.isListening).toBe(false);
    });

    it('sets isListening to false on recognition end', () => {
      speechService.startListening(vi.fn(), vi.fn());
      speechService.recognition.onend();
      expect(speechService.isListening).toBe(false);
    });
  });

  describe('stopListening', () => {
    it('calls recognition.stop() and sets isListening to false', () => {
      speechService.startListening(vi.fn(), vi.fn());
      speechService.stopListening();
      expect(speechService.recognition.stop).toHaveBeenCalled();
      expect(speechService.isListening).toBe(false);
    });

    it('does not throw if called when not listening', () => {
      expect(() => speechService.stopListening()).not.toThrow();
    });
  });

  // -------------------------------------------------------------------------
  // setRecognitionLanguage
  // -------------------------------------------------------------------------
  describe('setRecognitionLanguage', () => {
    it('sets recognition.lang to the BCP-47 code for a valid language name', () => {
      speechService.setRecognitionLanguage('Mandarin');
      expect(speechService.recognition.lang).toBe('zh-CN');
    });

    it('does not throw for an unknown language name', () => {
      expect(() => speechService.setRecognitionLanguage('Klingon')).not.toThrow();
    });
  });
});
