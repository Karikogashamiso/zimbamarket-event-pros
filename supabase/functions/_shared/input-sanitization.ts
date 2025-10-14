/**
 * Comprehensive input sanitization utilities for preventing XSS and injection attacks
 */

interface SanitizationOptions {
  allowHtml?: boolean;
  allowUrls?: boolean;
  maxLength?: number;
  stripWhitespace?: boolean;
  allowedTags?: string[];
}

const DEFAULT_OPTIONS: SanitizationOptions = {
  allowHtml: false,
  allowUrls: true,
  maxLength: 10000,
  stripWhitespace: true,
  allowedTags: []
};

/**
 * Sanitizes text input by removing potentially dangerous content
 */
export function sanitizeText(input: string, options: SanitizationOptions = {}): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  const opts = { ...DEFAULT_OPTIONS, ...options };
  let sanitized = input;

  // Remove null bytes and control characters
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // Apply length limit
  if (opts.maxLength && sanitized.length > opts.maxLength) {
    sanitized = sanitized.substring(0, opts.maxLength);
  }

  // Handle HTML content
  if (!opts.allowHtml) {
    // Remove all HTML tags
    sanitized = sanitized.replace(/<[^>]*>/g, '');
    
    // Decode HTML entities to prevent double encoding
    sanitized = sanitized
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#x27;/g, "'")
      .replace(/&#x2F;/g, '/');
    
    // Re-escape dangerous characters
    sanitized = sanitized
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  } else if (opts.allowedTags && opts.allowedTags.length > 0) {
    // Allow only specific tags
    const allowedTagsRegex = new RegExp(`<(?!\/?(?:${opts.allowedTags.join('|')})\s*\/?>)[^>]+>`, 'gi');
    sanitized = sanitized.replace(allowedTagsRegex, '');
  }

  // Remove potentially dangerous JavaScript
  sanitized = sanitized
    .replace(/javascript:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/data:/gi, '')
    .replace(/on\w+\s*=/gi, '');

  // Handle URLs if not allowed
  if (!opts.allowUrls) {
    sanitized = sanitized
      .replace(/https?:\/\/[^\s]+/gi, '[URL_REMOVED]')
      .replace(/ftp:\/\/[^\s]+/gi, '[URL_REMOVED]');
  }

  // Strip excessive whitespace if requested
  if (opts.stripWhitespace) {
    sanitized = sanitized
      .replace(/\s+/g, ' ')
      .trim();
  }

  return sanitized;
}

/**
 * Sanitizes email addresses
 */
export function sanitizeEmail(email: string): string {
  if (!email || typeof email !== 'string') {
    return '';
  }

  // Basic email format validation first
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  // Normalize and trim
  let sanitized = email.toLowerCase().trim();
  
  // Validate format
  if (!emailRegex.test(sanitized)) {
    return '';
  }

  return sanitized;
}

/**
 * Sanitizes phone numbers
 */
export function sanitizePhone(phone: string): string {
  if (!phone || typeof phone !== 'string') {
    return '';
  }

  // Keep only digits, spaces, hyphens, parentheses, and plus signs
  return phone
    .replace(/[^\d\s\-()+ ]/g, '')
    .trim()
    .substring(0, 20); // Reasonable phone number length limit
}

/**
 * Sanitizes URLs
 */
export function sanitizeUrl(url: string): string {
  if (!url || typeof url !== 'string') {
    return '';
  }

  // Remove dangerous protocols
  let sanitized = url.trim();
  
  const dangerousProtocols = /^(javascript|vbscript|data|file|ftp):/i;
  if (dangerousProtocols.test(sanitized)) {
    return '';
  }

  // Ensure URL starts with http:// or https:// if it has a protocol
  if (sanitized.includes('://') && !sanitized.match(/^https?:\/\//i)) {
    return '';
  }

  return sanitized.substring(0, 500); // Reasonable URL length limit
}

/**
 * Sanitizes a complete object with nested properties
 */
export function sanitizeObject(obj: any, schema?: Record<string, SanitizationOptions>): any {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  const sanitized: any = {};

  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) {
      sanitized[key] = value;
      continue;
    }

    const options = schema?.[key] || {};

    if (typeof value === 'string') {
      if (key.toLowerCase().includes('email')) {
        sanitized[key] = sanitizeEmail(value);
      } else if (key.toLowerCase().includes('phone')) {
        sanitized[key] = sanitizePhone(value);
      } else if (key.toLowerCase().includes('url') || key.toLowerCase().includes('website')) {
        sanitized[key] = sanitizeUrl(value);
      } else {
        sanitized[key] = sanitizeText(value, options);
      }
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === 'string' ? sanitizeText(item, options) : item
      );
    } else if (typeof value === 'object') {
      sanitized[key] = sanitizeObject(value, schema);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Validates and sanitizes common form fields
 */
export function sanitizeFormData(formData: any): any {
  const schema: Record<string, SanitizationOptions> = {
    firstName: { maxLength: 100, stripWhitespace: true },
    lastName: { maxLength: 100, stripWhitespace: true },
    email: { maxLength: 255 },
    phone: { maxLength: 20 },
    subject: { maxLength: 200, stripWhitespace: true },
    message: { maxLength: 5000, stripWhitespace: true },
    content: { maxLength: 10000, stripWhitespace: true },
    description: { maxLength: 2000, stripWhitespace: true },
    title: { maxLength: 200, stripWhitespace: true },
    name: { maxLength: 200, stripWhitespace: true },
    businessName: { maxLength: 200, stripWhitespace: true },
    address: { maxLength: 500, stripWhitespace: true },
    website: { maxLength: 500 },
    comment: { maxLength: 1000, stripWhitespace: true }
  };

  return sanitizeObject(formData, schema);
}

/**
 * Additional security validation for sensitive operations
 */
export function validateSecureInput(input: string): { isValid: boolean; reason?: string } {
  if (!input || typeof input !== 'string') {
    return { isValid: false, reason: 'Invalid input type' };
  }

  // Check for common injection patterns
  const injectionPatterns = [
    /(\bUNION\b|\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b)/i,
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/i,
    /vbscript:/i,
    /on\w+\s*=/i,
    /expression\s*\(/i
  ];

  for (const pattern of injectionPatterns) {
    if (pattern.test(input)) {
      return { isValid: false, reason: 'Potentially malicious content detected' };
    }
  }

  return { isValid: true };
}
