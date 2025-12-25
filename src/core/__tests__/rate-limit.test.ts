import { describe, it, expect, beforeEach } from 'vitest';
import { rateLimiter, getClientIp } from '../security/rate-limit';

describe('RateLimiter', () => {
  beforeEach(() => {
    // Reset rate limiter state before each test
    rateLimiter['store'].clear();
  });

  describe('Basic Rate Limiting', () => {
    it('should allow first request', () => {
      const result = rateLimiter.check('192.168.1.1');
      expect(result).toBe(true);
    });

    it('should track request count', () => {
      const ip = '192.168.1.1';
      
      rateLimiter.check(ip);
      const remaining = rateLimiter.getRemaining(ip);
      
      expect(remaining).toBe(99); // 100 - 1
    });

    it('should allow multiple requests under limit', () => {
      const ip = '192.168.1.1';
      
      for (let i = 0; i < 50; i++) {
        const result = rateLimiter.check(ip);
        expect(result).toBe(true);
      }
      
      const remaining = rateLimiter.getRemaining(ip);
      expect(remaining).toBe(50);
    });

    it('should block requests after exceeding limit', () => {
      const ip = '192.168.1.1';
      
      // Make 100 requests (the limit)
      for (let i = 0; i < 100; i++) {
        rateLimiter.check(ip);
      }
      
      // 101st request should be blocked
      const result = rateLimiter.check(ip);
      expect(result).toBe(false);
    });

    it('should return correct remaining count', () => {
      const ip = '192.168.1.1';
      
      expect(rateLimiter.getRemaining(ip)).toBe(100);
      
      rateLimiter.check(ip);
      expect(rateLimiter.getRemaining(ip)).toBe(99);
      
      rateLimiter.check(ip);
      expect(rateLimiter.getRemaining(ip)).toBe(98);
    });
  });

  describe('IP Isolation', () => {
    it('should track different IPs separately', () => {
      const ip1 = '192.168.1.1';
      const ip2 = '192.168.1.2';
      
      rateLimiter.check(ip1);
      rateLimiter.check(ip2);
      
      expect(rateLimiter.getRemaining(ip1)).toBe(99);
      expect(rateLimiter.getRemaining(ip2)).toBe(99);
    });

    it('should not affect other IPs when one is rate limited', () => {
      const ip1 = '192.168.1.1';
      const ip2 = '192.168.1.2';
      
      // Exhaust IP1's limit
      for (let i = 0; i < 100; i++) {
        rateLimiter.check(ip1);
      }
      
      // IP2 should still be allowed
      expect(rateLimiter.check(ip2)).toBe(true);
      expect(rateLimiter.getRemaining(ip2)).toBe(99);
    });
  });

  describe('Time Window Reset', () => {
    it('should provide reset time for rate-limited IP', () => {
      const ip = '192.168.1.1';
      
      // Exhaust limit
      for (let i = 0; i < 100; i++) {
        rateLimiter.check(ip);
      }
      
      const resetTime = rateLimiter.getResetTime(ip);
      expect(resetTime).toBeGreaterThan(0);
      expect(resetTime).toBeLessThanOrEqual(60 * 60 * 1000); // Within 1 hour
    });

    it('should return 0 reset time for non-limited IP', () => {
      const ip = '192.168.1.1';
      const resetTime = rateLimiter.getResetTime(ip);
      
      expect(resetTime).toBe(0);
    });

    it('should reset count after time window expires', async () => {
      const ip = '192.168.1.1';
      
      // Make a request
      rateLimiter.check(ip);
      expect(rateLimiter.getRemaining(ip)).toBe(99);
      
      // Manually expire the entry by manipulating time
      const entry = rateLimiter['store'].get(ip);
      if (entry) {
        entry.resetTime = Date.now() - 1; // Set to past
        rateLimiter['store'].set(ip, entry);
      }
      
      // Next check should reset the count
      expect(rateLimiter.check(ip)).toBe(true);
      expect(rateLimiter.getRemaining(ip)).toBe(99);
    });
  });

  describe('Edge Cases', () => {
    it('should handle exactly 100 requests', () => {
      const ip = '192.168.1.1';
      
      for (let i = 0; i < 100; i++) {
        const result = rateLimiter.check(ip);
        expect(result).toBe(true);
      }
      
      expect(rateLimiter.getRemaining(ip)).toBe(0);
    });

    it('should handle rapid consecutive requests', () => {
      const ip = '192.168.1.1';
      
      const results = Array(10).fill(0).map(() => rateLimiter.check(ip));
      
      expect(results.every(r => r === true)).toBe(true);
      expect(rateLimiter.getRemaining(ip)).toBe(90);
    });

    it('should handle empty IP string', () => {
      const result = rateLimiter.check('');
      expect(result).toBe(true);
    });
  });

  describe('Cleanup', () => {
    it('should have cleanup interval set', () => {
      expect(rateLimiter['cleanupInterval']).not.toBeNull();
    });
  });
});

describe('getClientIp', () => {
  it('should extract IP from x-forwarded-for header', () => {
    const headers = new Headers({
      'x-forwarded-for': '192.168.1.1, 10.0.0.1',
    });
    
    const ip = getClientIp(headers);
    expect(ip).toBe('192.168.1.1');
  });

  it('should extract IP from x-real-ip header', () => {
    const headers = new Headers({
      'x-real-ip': '192.168.1.1',
    });
    
    const ip = getClientIp(headers);
    expect(ip).toBe('192.168.1.1');
  });

  it('should extract IP from cf-connecting-ip header', () => {
    const headers = new Headers({
      'cf-connecting-ip': '192.168.1.1',
    });
    
    const ip = getClientIp(headers);
    expect(ip).toBe('192.168.1.1');
  });

  it('should prioritize x-forwarded-for over x-real-ip', () => {
    const headers = new Headers({
      'x-forwarded-for': '192.168.1.1',
      'x-real-ip': '10.0.0.1',
    });
    
    const ip = getClientIp(headers);
    expect(ip).toBe('192.168.1.1');
  });

  it('should handle x-forwarded-for with multiple IPs', () => {
    const headers = new Headers({
      'x-forwarded-for': '192.168.1.1, 10.0.0.1, 172.16.0.1',
    });
    
    const ip = getClientIp(headers);
    expect(ip).toBe('192.168.1.1'); // First IP
  });

  it('should trim whitespace from IP', () => {
    const headers = new Headers({
      'x-forwarded-for': '  192.168.1.1  ',
    });
    
    const ip = getClientIp(headers);
    expect(ip).toBe('192.168.1.1');
  });

  it('should return "unknown" when no IP headers present', () => {
    const headers = new Headers({});
    
    const ip = getClientIp(headers);
    expect(ip).toBe('unknown');
  });

  it('should handle empty x-forwarded-for', () => {
    const headers = new Headers({
      'x-forwarded-for': '',
    });
    
    const ip = getClientIp(headers);
    expect(ip).toBe('unknown');
  });
});

