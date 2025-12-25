import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { NextRequest } from 'next/server';

// Mock the rate limiter
vi.mock('@/core/security/rate-limit', () => ({
  rateLimiter: {
    check: vi.fn(() => true),
    getRemaining: vi.fn(() => 99),
    getResetTime: vi.fn(() => 0),
  },
  getClientIp: vi.fn(() => '192.168.1.1'),
}));

// Mock mermaid verification
vi.mock('@/core/diagram/verify', () => ({
  verifyMermaidCode: vi.fn((code: string) => {
    if (code === 'graph TD\n  A --> B') {
      return Promise.resolve({ ok: true });
    }
    return Promise.resolve({ ok: false, error: 'Invalid Mermaid syntax' });
  }),
}));

describe('POST /api/verify', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Valid Requests', () => {
    it('should verify valid Mermaid code', async () => {
      const request = new NextRequest('http://localhost:3000/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: 'graph TD\n  A --> B' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.ok).toBe(true);
    });

    it('should return error for invalid Mermaid code', async () => {
      const request = new NextRequest('http://localhost:3000/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: 'invalid code' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.ok).toBe(false);
      expect(data.error).toBeDefined();
    });

    it('should include rate limit headers', async () => {
      const request = new NextRequest('http://localhost:3000/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: 'graph TD\n  A --> B' }),
      });

      const response = await POST(request);

      expect(response.headers.get('X-RateLimit-Remaining')).toBeDefined();
    });

    it('should include security headers', async () => {
      const request = new NextRequest('http://localhost:3000/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: 'graph TD\n  A --> B' }),
      });

      const response = await POST(request);

      expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
      expect(response.headers.get('X-Frame-Options')).toBe('DENY');
      expect(response.headers.get('X-XSS-Protection')).toBe('1; mode=block');
    });
  });

  describe('Input Validation', () => {
    it('should reject missing code field', async () => {
      const request = new NextRequest('http://localhost:3000/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.ok).toBe(false);
      expect(data.error).toContain('code');
    });

    it('should reject non-string code', async () => {
      const request = new NextRequest('http://localhost:3000/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: 123 }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.ok).toBe(false);
      expect(data.error).toContain('string');
    });

    it('should reject invalid JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'not valid json',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.ok).toBe(false);
      expect(data.error).toContain('JSON');
    });

    it('should reject non-object body', async () => {
      const request = new NextRequest('http://localhost:3000/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify('string'),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.ok).toBe(false);
    });
  });

  describe('Rate Limiting', () => {
    it('should reject when rate limit exceeded', async () => {
      const { rateLimiter } = await import('@/core/security/rate-limit');
      vi.mocked(rateLimiter.check).mockReturnValueOnce(false);
      vi.mocked(rateLimiter.getResetTime).mockReturnValueOnce(3600000);

      const request = new NextRequest('http://localhost:3000/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: 'graph TD\n  A --> B' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.ok).toBe(false);
      expect(data.error).toContain('Rate limit');
      expect(response.headers.get('Retry-After')).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should return generic error for unexpected failures', async () => {
      const { verifyMermaidCode } = await import('@/core/diagram/verify');
      vi.mocked(verifyMermaidCode).mockRejectedValueOnce(new Error('Unexpected error'));

      const request = new NextRequest('http://localhost:3000/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: 'graph TD\n  A --> B' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.ok).toBe(false);
      expect(data.error).toBe('An unexpected error occurred');
    });
  });
});

