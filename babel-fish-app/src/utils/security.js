// Security utilities for input validation and sanitization

/**
 * Sanitize user input to prevent XSS attacks
 * @param {string} input - User input to sanitize
 * @returns {string} - Sanitized input
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') {
    return '';
  }
  
  // Remove potentially dangerous characters and scripts
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/data:/gi, '')
    .trim();
}

/**
 * Validate user query for AI suggestions
 * @param {string} query - User query to validate
 * @returns {object} - Validation result with isValid and sanitizedQuery
 */
export function validateUserQuery(query) {
  if (!query || typeof query !== 'string') {
    return { isValid: false, sanitizedQuery: '', error: 'Invalid input type' };
  }

  const sanitizedQuery = sanitizeInput(query);
  
  // Check length limits
  if (sanitizedQuery.length === 0) {
    return { isValid: false, sanitizedQuery: '', error: 'Query cannot be empty' };
  }
  
  if (sanitizedQuery.length > 500) {
    return { isValid: false, sanitizedQuery: '', error: 'Query too long (max 500 characters)' };
  }

  // Check for potentially malicious patterns
  const maliciousPatterns = [
    /<script/i,
    /javascript:/i,
    /data:text\/html/i,
    /vbscript:/i,
    /onload/i,
    /onerror/i,
    /onclick/i,
    /eval\(/i,
    /document\./i,
    /window\./i,
    /localStorage/i,
    /sessionStorage/i
  ];

  for (const pattern of maliciousPatterns) {
    if (pattern.test(sanitizedQuery)) {
      return { isValid: false, sanitizedQuery: '', error: 'Query contains invalid content' };
    }
  }

  return { isValid: true, sanitizedQuery, error: null };
}

/**
 * Validate language selection
 * @param {string} language - Language to validate
 * @param {object} allowedLanguages - Object of allowed languages
 * @returns {boolean} - Whether language is valid
 */
export function validateLanguage(language, allowedLanguages) {
  if (!language || typeof language !== 'string') {
    return false;
  }
  
  return Object.keys(allowedLanguages).includes(language);
}

/**
 * Rate limiting utility
 */
export class RateLimiter {
  constructor(maxRequests = 60, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = new Map();
  }

  /**
   * Check if request is allowed
   * @param {string} identifier - User identifier (IP, user ID, etc.)
   * @returns {boolean} - Whether request is allowed
   */
  isAllowed(identifier) {
    const now = Date.now();
    const userRequests = this.requests.get(identifier) || [];
    
    // Remove old requests outside the window
    const validRequests = userRequests.filter(timestamp => now - timestamp < this.windowMs);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    // Add current request
    validRequests.push(now);
    this.requests.set(identifier, validRequests);
    
    return true;
  }

  /**
   * Get remaining requests for user
   * @param {string} identifier - User identifier
   * @returns {number} - Remaining requests
   */
  getRemainingRequests(identifier) {
    const now = Date.now();
    const userRequests = this.requests.get(identifier) || [];
    const validRequests = userRequests.filter(timestamp => now - timestamp < this.windowMs);
    
    return Math.max(0, this.maxRequests - validRequests.length);
  }
}

/**
 * HTTPS enforcement utility
 */
export function enforceHTTPS() {
  if (typeof window !== 'undefined' && window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
    window.location.href = window.location.href.replace('http:', 'https:');
  }
}

/**
 * Validate API response
 * @param {object} response - API response to validate
 * @returns {boolean} - Whether response is valid
 */
export function validateAPIResponse(response) {
  if (!response || typeof response !== 'object') {
    return false;
  }

  // Check for common malicious patterns in response
  const responseString = JSON.stringify(response).toLowerCase();
  const maliciousPatterns = [
    /<script/i,
    /javascript:/i,
    /data:text\/html/i,
    /eval\(/i,
    /document\./i,
    /window\./i
  ];

  for (const pattern of maliciousPatterns) {
    if (pattern.test(responseString)) {
      return false;
    }
  }

  return true;
}

/**
 * Sanitize API payload
 * @param {object} payload - API payload to sanitize
 * @returns {object} - Sanitized payload
 */
export function sanitizeAPIPayload(payload) {
  if (!payload || typeof payload !== 'object') {
    return {};
  }

  const sanitized = {};
  
  for (const [key, value] of Object.entries(payload)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeAPIPayload(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
} 