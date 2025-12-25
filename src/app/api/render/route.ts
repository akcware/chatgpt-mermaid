import { NextRequest, NextResponse } from 'next/server';
import { renderMermaidToSvg } from '@/core/diagram/render';
import { sanitizeSvg } from '@/core/security/sanitize';
import { rateLimiter, getClientIp } from '@/core/security/rate-limit';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const clientIp = getClientIp(request.headers);

    // Check rate limit
    if (!rateLimiter.check(clientIp)) {
      const resetTime = rateLimiter.getResetTime(clientIp);
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(Date.now() + resetTime).toISOString(),
            'Retry-After': Math.ceil(resetTime / 1000).toString(),
          },
        }
      );
    }

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // Validate input schema
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Request body must be an object' },
        { status: 400 }
      );
    }

    const { code } = body;

    if (!code) {
      return NextResponse.json(
        { error: 'Missing required field: code' },
        { status: 400 }
      );
    }

    if (typeof code !== 'string') {
      return NextResponse.json(
        { error: 'Field "code" must be a string' },
        { status: 400 }
      );
    }

    // Render Mermaid to SVG
    const rawSvg = await renderMermaidToSvg(code);

    // Sanitize SVG output
    const svg = sanitizeSvg(rawSvg);

    // Add rate limit headers
    const remaining = rateLimiter.getRemaining(clientIp);
    const headers = {
      'X-RateLimit-Remaining': remaining.toString(),
      'Content-Type': 'application/json',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
    };

    return NextResponse.json({ svg }, { headers });
  } catch (error) {
    // Return generic error without exposing internal details
    console.error('Render endpoint error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to render diagram';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

