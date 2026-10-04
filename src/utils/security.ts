/**
 * KisanSetu Application Security & Sanitization Suite
 * 
 * Provides defense-in-depth protection against:
 * - Cross-Site Scripting (XSS)
 * - Malicious URL / Script Injection (javascript:, data:text/html, vbscript:)
 * - JSON Parsing / Prototype Pollution exploits
 * - LocalStorage Quota & Corrupt Storage crashes
 * - Input validation & Data integrity verification
 */

/**
 * Strips dangerous HTML tags and script elements from user-provided text.
 */
export function sanitizeText(input: unknown): string {
  if (typeof input !== 'string') {
    if (input === null || input === undefined) return '';
    return String(input);
  }

  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/onload\s*=\s*["'][^"']*["']/gi, '')
    .replace(/onerror\s*=\s*["'][^"']*["']/gi, '')
    .replace(/onclick\s*=\s*["'][^"']*["']/gi, '')
    .replace(/[<>]/g, (char) => (char === '<' ? '&lt;' : '&gt;'))
    .trim();
}

/**
 * Validates and sanitizes URLs (images, avatars, links).
 * Rejects javascript:, vbscript:, and malicious data: URIs.
 * Allows safe http:, https:, blob:, and valid image data: (data:image/*).
 */
export function sanitizeUrl(url: unknown, fallbackUrl = ''): string {
  if (!url || typeof url !== 'string') return fallbackUrl;

  const trimmed = url.trim();
  if (!trimmed) return fallbackUrl;

  // Reject malicious URI schemes
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('vbscript:') ||
    lower.startsWith('data:text/html') ||
    lower.startsWith('data:application/') ||
    lower.startsWith('data:text/javascript')
  ) {
    console.warn('[Security] Blocked potentially unsafe URL:', trimmed.slice(0, 30));
    return fallbackUrl;
  }

  // Allow safe web URLs and safe image data URIs
  if (
    lower.startsWith('http://') ||
    lower.startsWith('https://') ||
    lower.startsWith('blob:') ||
    lower.startsWith('data:image/') ||
    lower.startsWith('/')
  ) {
    return trimmed;
  }

  return fallbackUrl;
}

/**
 * Safe JSON parser that never throws and prevents prototype pollution.
 */
export function safeJsonParse<T>(jsonString: unknown, fallback: T): T {
  if (!jsonString || typeof jsonString !== 'string') {
    return fallback;
  }

  try {
    const parsed = JSON.parse(jsonString, (key, value) => {
      // Prevent prototype pollution
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        return undefined;
      }
      return value;
    });

    return (parsed !== null && parsed !== undefined ? parsed : fallback) as T;
  } catch (error) {
    console.warn('[Security] JSON parse failed safely, using fallback:', error);
    return fallback;
  }
}

/**
 * Safe LocalStorage wrapper with quota protection and fallback in-memory cache
 */
class SafeStorage {
  private memoryFallback = new Map<string, string>();

  public getItem<T = string>(key: string, fallback: T | null = null): T | null {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        const mem = this.memoryFallback.get(key);
        return mem !== undefined ? (mem as unknown as T) : fallback;
      }

      const item = window.localStorage.getItem(key);
      if (item === null) return fallback;

      // If expecting parsed object
      if (typeof fallback === 'object' && fallback !== null) {
        return safeJsonParse<T>(item, fallback);
      }

      return item as unknown as T;
    } catch (e) {
      console.warn(`[SafeStorage] Error reading key "${key}":`, e);
      const mem = this.memoryFallback.get(key);
      return mem !== undefined ? (mem as unknown as T) : fallback;
    }
  }

  public setItem(key: string, value: unknown): boolean {
    try {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);

      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, stringValue);
      }
      this.memoryFallback.set(key, stringValue);
      return true;
    } catch (e) {
      console.warn(`[SafeStorage] QuotaExceeded or write error for key "${key}", using memory fallback:`, e);
      try {
        const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
        this.memoryFallback.set(key, stringValue);
      } catch {
        // Ignore serialization errors
      }
      return false;
    }
  }

  public removeItem(key: string): boolean {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
      this.memoryFallback.delete(key);
      return true;
    } catch (e) {
      console.warn(`[SafeStorage] Error removing key "${key}":`, e);
      this.memoryFallback.delete(key);
      return false;
    }
  }

  public clearAll(): boolean {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.clear();
      }
      this.memoryFallback.clear();
      return true;
    } catch (e) {
      console.warn('[SafeStorage] Error clearing storage:', e);
      this.memoryFallback.clear();
      return false;
    }
  }
}

export const safeStorage = new SafeStorage();

/**
 * Validates number bounds strictly to prevent NaN, Infinity, or negative overflows.
 */
export function sanitizeNumber(
  value: unknown,
  min = 0,
  max = Number.MAX_SAFE_INTEGER,
  defaultValue = 0
): number {
  if (typeof value === 'number') {
    if (isNaN(value) || !isFinite(value)) return defaultValue;
    return Math.min(Math.max(value, min), max);
  }

  if (typeof value === 'string') {
    const parsed = parseFloat(value.replace(/[^0-9.-]/g, ''));
    if (isNaN(parsed) || !isFinite(parsed)) return defaultValue;
    return Math.min(Math.max(parsed, min), max);
  }

  return defaultValue;
}

/**
 * Validates Indian 10-digit mobile number format safely.
 */
export function isValidPhoneNumber(phone: string): boolean {
  if (!phone || typeof phone !== 'string') return false;
  const digitsOnly = phone.replace(/\D/g, '');
  return digitsOnly.length === 10 && /^[6-9]\d{9}$/.test(digitsOnly);
}

/**
 * Validates standard email address format safely without vulnerable ReDoS regex.
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string' || email.length > 254) return false;
  // Safe RFC 5322 subset without catastrophic backtracking risk
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return emailRegex.test(email.trim());
}
