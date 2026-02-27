import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  sanitizeInput,
  validateUserQuery,
  validateLanguage,
  RateLimiter,
  enforceHTTPS,
  validateAPIResponse,
  sanitizeAPIPayload,
} from './security';

// ---------------------------------------------------------------------------
// sanitizeInput
// ---------------------------------------------------------------------------
describe('sanitizeInput', () => {
  it('returns empty string for non-string input', () => {
    expect(sanitizeInput(null)).toBe('');
    expect(sanitizeInput(undefined)).toBe('');
    expect(sanitizeInput(123)).toBe('');
    expect(sanitizeInput({})).toBe('');
  });

  it('returns the original string for clean input', () => {
    expect(sanitizeInput('Hello, how can I help you?')).toBe('Hello, how can I help you?');
  });

  it('strips <script> tags', () => {
    const result = sanitizeInput('<script>alert("xss")</script>');
    expect(result).not.toContain('<script>');
    expect(result).not.toContain('</script>');
  });

  it('strips <iframe> tags', () => {
    const result = sanitizeInput('<iframe src="evil.com"></iframe>');
    expect(result).not.toContain('<iframe');
    expect(result).not.toContain('</iframe>');
  });

  it('strips <object> tags', () => {
    expect(sanitizeInput('<object data="evil"></object>')).not.toContain('<object');
  });

  it('strips <embed> tags (with closing tag)', () => {
    // The regex requires a matching </embed> closing tag.
    expect(sanitizeInput('<embed src="evil"></embed>')).not.toContain('<embed');
  });

  it('removes javascript: protocol', () => {
    const result = sanitizeInput('javascript:alert(1)');
    expect(result).not.toContain('javascript:');
  });

  it('removes inline event handlers (on* attributes)', () => {
    const result = sanitizeInput('onclick=alert(1)');
    expect(result).not.toContain('onclick=');
  });

  it('removes data: URIs', () => {
    const result = sanitizeInput('data:text/html,<h1>evil</h1>');
    expect(result).not.toContain('data:');
  });

  it('trims leading and trailing whitespace', () => {
    expect(sanitizeInput('  hello  ')).toBe('hello');
  });
});

// ---------------------------------------------------------------------------
// validateUserQuery
// ---------------------------------------------------------------------------
describe('validateUserQuery', () => {
  it('rejects null and non-string values', () => {
    expect(validateUserQuery(null).isValid).toBe(false);
    expect(validateUserQuery(42).isValid).toBe(false);
    expect(validateUserQuery(undefined).isValid).toBe(false);
  });

  it('rejects an empty string', () => {
    const result = validateUserQuery('');
    expect(result.isValid).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it('accepts a normal query', () => {
    const result = validateUserQuery('Where is the bathroom?');
    expect(result.isValid).toBe(true);
    expect(result.sanitizedQuery).toBe('Where is the bathroom?');
    expect(result.error).toBeNull();
  });

  it('rejects queries longer than 500 characters', () => {
    const longQuery = 'a'.repeat(501);
    const result = validateUserQuery(longQuery);
    expect(result.isValid).toBe(false);
    expect(result.error).toMatch(/too long/i);
  });

  it('accepts a query exactly at the 500-character limit', () => {
    const query = 'a'.repeat(500);
    const result = validateUserQuery(query);
    expect(result.isValid).toBe(true);
  });

  it('rejects queries containing <script', () => {
    const result = validateUserQuery('<script>alert(1)</script>');
    expect(result.isValid).toBe(false);
  });

  it('rejects queries containing eval(', () => {
    const result = validateUserQuery('eval(malicious())');
    expect(result.isValid).toBe(false);
  });

  it('rejects queries referencing document.', () => {
    const result = validateUserQuery('document.cookie');
    expect(result.isValid).toBe(false);
  });

  it('rejects queries referencing window.', () => {
    const result = validateUserQuery('window.location');
    expect(result.isValid).toBe(false);
  });

  it('rejects queries referencing localStorage', () => {
    const result = validateUserQuery('localStorage.getItem("token")');
    expect(result.isValid).toBe(false);
  });

  it('rejects queries referencing sessionStorage', () => {
    const result = validateUserQuery('sessionStorage.clear()');
    expect(result.isValid).toBe(false);
  });

  it('rejects queries containing the bare word onload', () => {
    // Note: "onload=" (with equals sign) is stripped by sanitizeInput before
    // the pattern check, so only bare "onload" text triggers the rejection.
    const result = validateUserQuery('onload');
    expect(result.isValid).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// validateLanguage
// ---------------------------------------------------------------------------
describe('validateLanguage', () => {
  const allowedLanguages = {
    Mandarin: { code: 'zh-CN' },
    English: { code: 'en-US' },
    Arabic: { code: 'ar-SA' },
  };

  it('returns true for a valid language key', () => {
    expect(validateLanguage('Mandarin', allowedLanguages)).toBe(true);
    expect(validateLanguage('English', allowedLanguages)).toBe(true);
  });

  it('returns false for an unknown language', () => {
    expect(validateLanguage('Klingon', allowedLanguages)).toBe(false);
  });

  it('returns false for null or non-string input', () => {
    expect(validateLanguage(null, allowedLanguages)).toBe(false);
    expect(validateLanguage(undefined, allowedLanguages)).toBe(false);
    expect(validateLanguage(42, allowedLanguages)).toBe(false);
  });

  it('returns false for an empty string', () => {
    expect(validateLanguage('', allowedLanguages)).toBe(false);
  });

  it('is case-sensitive', () => {
    expect(validateLanguage('mandarin', allowedLanguages)).toBe(false);
    expect(validateLanguage('ENGLISH', allowedLanguages)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// RateLimiter
// ---------------------------------------------------------------------------
describe('RateLimiter', () => {
  it('allows requests up to the max limit', () => {
    const limiter = new RateLimiter(3, 60000);
    expect(limiter.isAllowed('user1')).toBe(true);
    expect(limiter.isAllowed('user1')).toBe(true);
    expect(limiter.isAllowed('user1')).toBe(true);
  });

  it('blocks requests once the limit is exceeded', () => {
    const limiter = new RateLimiter(3, 60000);
    limiter.isAllowed('user1');
    limiter.isAllowed('user1');
    limiter.isAllowed('user1');
    expect(limiter.isAllowed('user1')).toBe(false);
  });

  it('tracks different identifiers independently', () => {
    const limiter = new RateLimiter(1, 60000);
    expect(limiter.isAllowed('user1')).toBe(true);
    expect(limiter.isAllowed('user2')).toBe(true); // separate window
    expect(limiter.isAllowed('user1')).toBe(false);
  });

  it('getRemainingRequests decreases after each allowed request', () => {
    const limiter = new RateLimiter(5, 60000);
    expect(limiter.getRemainingRequests('user1')).toBe(5);
    limiter.isAllowed('user1');
    expect(limiter.getRemainingRequests('user1')).toBe(4);
    limiter.isAllowed('user1');
    expect(limiter.getRemainingRequests('user1')).toBe(3);
  });

  it('getRemainingRequests never returns negative', () => {
    const limiter = new RateLimiter(1, 60000);
    limiter.isAllowed('user1');
    limiter.isAllowed('user1'); // should be blocked but tracked
    expect(limiter.getRemainingRequests('user1')).toBe(0);
  });

  it('resets after the window expires', async () => {
    // Use a very short window (50ms) so we can observe expiry
    const limiter = new RateLimiter(1, 50);
    limiter.isAllowed('user1'); // consume the slot
    expect(limiter.isAllowed('user1')).toBe(false);

    await new Promise((resolve) => setTimeout(resolve, 60));

    expect(limiter.isAllowed('user1')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// enforceHTTPS
// ---------------------------------------------------------------------------
describe('enforceHTTPS', () => {
  it('redirects to HTTPS when on HTTP and not localhost', () => {
    const originalLocation = window.location;
    // jsdom doesn't allow direct assignment to window.location, so we replace it
    delete window.location;
    window.location = { protocol: 'http:', hostname: 'example.com', href: 'http://example.com/path' };

    enforceHTTPS();

    expect(window.location.href).toBe('https://example.com/path');

    window.location = originalLocation;
  });

  it('does NOT redirect when already on HTTPS', () => {
    const originalLocation = window.location;
    delete window.location;
    window.location = { protocol: 'https:', hostname: 'example.com', href: 'https://example.com/path' };

    enforceHTTPS();

    expect(window.location.href).toBe('https://example.com/path');

    window.location = originalLocation;
  });

  it('does NOT redirect on localhost even if HTTP', () => {
    const originalLocation = window.location;
    delete window.location;
    window.location = { protocol: 'http:', hostname: 'localhost', href: 'http://localhost:3000/' };

    enforceHTTPS();

    expect(window.location.href).toBe('http://localhost:3000/');

    window.location = originalLocation;
  });
});

// ---------------------------------------------------------------------------
// validateAPIResponse
// ---------------------------------------------------------------------------
describe('validateAPIResponse', () => {
  it('returns false for null or non-object input', () => {
    expect(validateAPIResponse(null)).toBe(false);
    expect(validateAPIResponse('string')).toBe(false);
    expect(validateAPIResponse(123)).toBe(false);
  });

  it('returns true for a clean response object', () => {
    expect(validateAPIResponse({ phrases: ['Hello', 'How can I help?'] })).toBe(true);
  });

  it('returns false when response contains <script', () => {
    expect(validateAPIResponse({ text: '<script>alert(1)</script>' })).toBe(false);
  });

  it('returns false when response contains javascript:', () => {
    expect(validateAPIResponse({ url: 'javascript:void(0)' })).toBe(false);
  });

  it('returns false when response contains eval(', () => {
    expect(validateAPIResponse({ code: 'eval(something)' })).toBe(false);
  });

  it('returns false when response contains document.', () => {
    expect(validateAPIResponse({ payload: 'document.cookie' })).toBe(false);
  });

  it('returns true for nested clean objects', () => {
    expect(validateAPIResponse({ data: { nested: { value: 'safe text' } } })).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// sanitizeAPIPayload
// ---------------------------------------------------------------------------
describe('sanitizeAPIPayload', () => {
  it('returns empty object for null or non-object input', () => {
    expect(sanitizeAPIPayload(null)).toEqual({});
    expect(sanitizeAPIPayload('string')).toEqual({});
    expect(sanitizeAPIPayload(42)).toEqual({});
  });

  it('sanitizes string values within the payload', () => {
    const payload = { query: '<script>alert(1)</script>Hello' };
    const result = sanitizeAPIPayload(payload);
    expect(result.query).not.toContain('<script>');
    expect(result.query).toContain('Hello');
  });

  it('passes through non-string, non-object values unchanged', () => {
    const payload = { count: 5, active: true };
    const result = sanitizeAPIPayload(payload);
    expect(result.count).toBe(5);
    expect(result.active).toBe(true);
  });

  it('recursively sanitizes nested objects', () => {
    const payload = { outer: { inner: '<iframe src="evil"></iframe>content' } };
    const result = sanitizeAPIPayload(payload);
    expect(result.outer.inner).not.toContain('<iframe');
    expect(result.outer.inner).toContain('content');
  });

  it('preserves null values in nested objects', () => {
    const payload = { key: null };
    const result = sanitizeAPIPayload(payload);
    expect(result.key).toBeNull();
  });
});
