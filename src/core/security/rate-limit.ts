/**
 * Simple in-memory rate limiter for IP-based throttling
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private store: Map<string, RateLimitEntry> = new Map();
  private readonly maxRequests: number;
  private readonly windowMs: number;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(maxRequests: number = 100, windowMs: number = 60 * 60 * 1000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  /**
   * Check if request is allowed for given identifier (e.g., IP address)
   * @param identifier - Unique identifier (IP address)
   * @returns true if allowed, false if rate limit exceeded
   */
  check(identifier: string): boolean {
    const now = Date.now();
    const entry = this.store.get(identifier);

    if (!entry || now > entry.resetTime) {
      // No entry or expired - create new entry
      this.store.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs,
      });
      return true;
    }

    // Entry exists and is valid
    if (entry.count >= this.maxRequests) {
      return false; // Rate limit exceeded
    }

    // Increment count
    entry.count++;
    this.store.set(identifier, entry);
    return true;
  }

  /**
   * Get remaining requests for identifier
   * @param identifier - Unique identifier (IP address)
   * @returns Number of remaining requests
   */
  getRemaining(identifier: string): number {
    const now = Date.now();
    const entry = this.store.get(identifier);

    if (!entry || now > entry.resetTime) {
      return this.maxRequests;
    }

    return Math.max(0, this.maxRequests - entry.count);
  }

  /**
   * Get time until reset in milliseconds
   * @param identifier - Unique identifier (IP address)
   * @returns Milliseconds until reset, or 0 if no limit active
   */
  getResetTime(identifier: string): number {
    const now = Date.now();
    const entry = this.store.get(identifier);

    if (!entry || now > entry.resetTime) {
      return 0;
    }

    return entry.resetTime - now;
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Destroy the rate limiter and cleanup interval
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.store.clear();
  }
}

// Export singleton instance
export const rateLimiter = new RateLimiter(100, 60 * 60 * 1000); // 100 requests per hour

/**
 * Get client IP from Next.js request headers
 * @param headers - Request headers
 * @returns Client IP address
 */
export function getClientIp(headers: Headers): string {
  // Try various headers in order of preference
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwarded.split(',')[0].trim();
  }

  const realIp = headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }

  const cfConnectingIp = headers.get('cf-connecting-ip');
  if (cfConnectingIp) {
    return cfConnectingIp.trim();
  }

  // Fallback to a default if no IP found
  return 'unknown';
}

