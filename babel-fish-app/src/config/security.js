// Security configuration for Babel Fish App

export const SECURITY_CONFIG = {
  // Rate limiting settings
  RATE_LIMITING: {
    ENABLED: process.env.REACT_APP_ENABLE_RATE_LIMITING === 'true',
    MAX_REQUESTS_PER_MINUTE: parseInt(process.env.REACT_APP_MAX_REQUESTS_PER_MINUTE) || 60,
    WINDOW_MS: 60000, // 1 minute
  },

  // HTTPS enforcement
  HTTPS: {
    ENABLED: process.env.REACT_APP_ENABLE_HTTPS_ENFORCEMENT === 'true',
    REDIRECT_TO_HTTPS: true,
  },

  // Input validation settings
  INPUT_VALIDATION: {
    MAX_QUERY_LENGTH: 500,
    MAX_TRANSLATION_LENGTH: 5000,
    ALLOWED_HTML_TAGS: [], // No HTML allowed
    BLOCKED_PATTERNS: [
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
    ]
  },

  // API security settings
  API_SECURITY: {
    TIMEOUT_MS: 10000, // 10 seconds
    MAX_RETRIES: 3,
    VALIDATE_RESPONSES: true,
    SANITIZE_PAYLOADS: true,
  },

  // Content Security Policy
  CSP: {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'", "https://www.gstatic.com", "https://www.googleapis.com"],
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", "data:", "https:", "https://api.qrserver.com"],
    'connect-src': ["'self'", "https://generativelanguage.googleapis.com", "https://translation.googleapis.com", "https://maps.googleapis.com"],
    'frame-src': ["'self'", "https://www.google.com"],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
  },

  // Error handling
  ERROR_HANDLING: {
    SHOW_DETAILED_ERRORS: process.env.REACT_APP_ENVIRONMENT === 'development',
    LOG_ERRORS: true,
    SANITIZE_ERROR_MESSAGES: true,
  },

  // Authentication settings
  AUTH: {
    ANONYMOUS_AUTH_ENABLED: true,
    SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
    MAX_LOGIN_ATTEMPTS: 5,
  },

  // Data protection
  DATA_PROTECTION: {
    ENCRYPT_SENSITIVE_DATA: true,
    AUTO_DELETE_LOGS: true,
    LOG_RETENTION_DAYS: 30,
  }
};

// Security headers configuration
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
};

// Environment-specific security settings
export const getSecurityConfig = () => {
  const isDevelopment = process.env.REACT_APP_ENVIRONMENT === 'development';
  const isProduction = process.env.REACT_APP_ENVIRONMENT === 'production';

  return {
    ...SECURITY_CONFIG,
    HTTPS: {
      ...SECURITY_CONFIG.HTTPS,
      ENABLED: isProduction, // Only enforce HTTPS in production
    },
    ERROR_HANDLING: {
      ...SECURITY_CONFIG.ERROR_HANDLING,
      SHOW_DETAILED_ERRORS: isDevelopment,
    },
    RATE_LIMITING: {
      ...SECURITY_CONFIG.RATE_LIMITING,
      ENABLED: isProduction, // Only enable rate limiting in production
    }
  };
}; 