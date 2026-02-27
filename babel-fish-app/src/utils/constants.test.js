import { describe, it, expect } from 'vitest';
import {
  LANGUAGE_CODES,
  STAFF_CATEGORY_ORDER,
  CUSTOMER_CATEGORY_ORDER,
  QR_PROMPT_TRANSLATIONS,
  CLICK_FOR_OPTIONS_PROMPT_TRANSLATIONS,
  brandColors,
} from './constants';

// ---------------------------------------------------------------------------
// LANGUAGE_CODES
// ---------------------------------------------------------------------------
describe('LANGUAGE_CODES', () => {
  const expectedLanguages = [
    'Mandarin',
    'Cantonese',
    'Nepali',
    'Greek',
    'Arabic',
    'Macedonian',
    'Spanish',
    'Italian',
    'Indonesian',
    'English',
  ];

  it('contains all 10 supported languages', () => {
    expectedLanguages.forEach((lang) => {
      expect(LANGUAGE_CODES).toHaveProperty(lang);
    });
    expect(Object.keys(LANGUAGE_CODES)).toHaveLength(10);
  });

  it('every language entry has a BCP-47 code and a nativeName', () => {
    Object.entries(LANGUAGE_CODES).forEach(([name, entry]) => {
      expect(entry.code, `${name} should have a code`).toBeTruthy();
      expect(entry.nativeName, `${name} should have a nativeName`).toBeTruthy();
      // BCP-47 codes follow the pattern xx-XX
      expect(entry.code, `${name} code should be a valid BCP-47 tag`).toMatch(/^[a-z]{2}-[A-Z]{2}$/);
    });
  });

  it('has correct BCP-47 codes for key languages', () => {
    expect(LANGUAGE_CODES.Mandarin.code).toBe('zh-CN');
    expect(LANGUAGE_CODES.Cantonese.code).toBe('zh-HK');
    expect(LANGUAGE_CODES.Arabic.code).toBe('ar-SA');
    expect(LANGUAGE_CODES.English.code).toBe('en-US');
    expect(LANGUAGE_CODES.Nepali.code).toBe('ne-NP');
    expect(LANGUAGE_CODES.Greek.code).toBe('el-GR');
    expect(LANGUAGE_CODES.Spanish.code).toBe('es-ES');
    expect(LANGUAGE_CODES.Italian.code).toBe('it-IT');
    expect(LANGUAGE_CODES.Indonesian.code).toBe('id-ID');
    expect(LANGUAGE_CODES.Macedonian.code).toBe('mk-MK');
  });
});

// ---------------------------------------------------------------------------
// Category orders
// ---------------------------------------------------------------------------
describe('STAFF_CATEGORY_ORDER', () => {
  it('contains the three expected staff categories', () => {
    expect(STAFF_CATEGORY_ORDER).toContain('General Enquiries');
    expect(STAFF_CATEGORY_ORDER).toContain('Transactional');
    expect(STAFF_CATEGORY_ORDER).toContain('Digital Services');
  });

  it('has exactly 3 entries', () => {
    expect(STAFF_CATEGORY_ORDER).toHaveLength(3);
  });
});

describe('CUSTOMER_CATEGORY_ORDER', () => {
  it('contains the five expected customer categories', () => {
    expect(CUSTOMER_CATEGORY_ORDER).toContain('General Assistance');
    expect(CUSTOMER_CATEGORY_ORDER).toContain('Transactional');
    expect(CUSTOMER_CATEGORY_ORDER).toContain('Library Layout');
    expect(CUSTOMER_CATEGORY_ORDER).toContain('Language & Community Resources');
    expect(CUSTOMER_CATEGORY_ORDER).toContain('Digital Services');
  });

  it('has exactly 5 entries', () => {
    expect(CUSTOMER_CATEGORY_ORDER).toHaveLength(5);
  });
});

// ---------------------------------------------------------------------------
// QR_PROMPT_TRANSLATIONS
// ---------------------------------------------------------------------------
describe('QR_PROMPT_TRANSLATIONS', () => {
  it('has a translation for every language code in LANGUAGE_CODES', () => {
    const allCodes = Object.values(LANGUAGE_CODES).map((l) => l.code);
    allCodes.forEach((code) => {
      expect(QR_PROMPT_TRANSLATIONS, `Missing QR prompt for ${code}`).toHaveProperty(code);
      expect(QR_PROMPT_TRANSLATIONS[code]).toBeTruthy();
    });
  });

  it('provides an English fallback', () => {
    expect(QR_PROMPT_TRANSLATIONS['en-US']).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// CLICK_FOR_OPTIONS_PROMPT_TRANSLATIONS
// ---------------------------------------------------------------------------
describe('CLICK_FOR_OPTIONS_PROMPT_TRANSLATIONS', () => {
  it('has a translation for every display-name language in LANGUAGE_CODES', () => {
    const allNames = Object.keys(LANGUAGE_CODES);
    allNames.forEach((name) => {
      expect(
        CLICK_FOR_OPTIONS_PROMPT_TRANSLATIONS,
        `Missing "click for options" translation for ${name}`
      ).toHaveProperty(name);
      expect(CLICK_FOR_OPTIONS_PROMPT_TRANSLATIONS[name]).toBeTruthy();
    });
  });

  it('provides an English value', () => {
    expect(CLICK_FOR_OPTIONS_PROMPT_TRANSLATIONS['English']).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// brandColors
// ---------------------------------------------------------------------------
describe('brandColors', () => {
  it('defines the primary teal colour', () => {
    expect(brandColors.primaryTeal).toBe('#00A99D');
  });

  it('all colour values are valid hex strings', () => {
    Object.entries(brandColors).forEach(([name, value]) => {
      expect(value, `${name} should be a hex colour`).toMatch(/^#[0-9A-Fa-f]{3,6}$/);
    });
  });
});
