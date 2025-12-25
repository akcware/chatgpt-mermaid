import { describe, it, expect } from 'vitest';
import { sanitizeSvg } from '../security/sanitize.js';

describe('sanitizeSvg', () => {
  describe('Security - XSS Prevention', () => {
    it('should remove script tags from SVG', () => {
      const maliciousSvg = '<svg><script>alert("XSS")</script><rect/></svg>';
      const result = sanitizeSvg(maliciousSvg);
      
      expect(result).not.toContain('<script>');
      expect(result).not.toContain('alert');
    });

    it('should remove event handlers from SVG elements', () => {
      const maliciousSvg = '<svg><rect onclick="alert(\'XSS\')" /></svg>';
      const result = sanitizeSvg(maliciousSvg);
      
      expect(result).not.toContain('onclick');
      expect(result).not.toContain('alert');
    });

    it('should remove onerror handlers', () => {
      const maliciousSvg = '<svg><image href="x" onerror="alert(\'XSS\')" /></svg>';
      const result = sanitizeSvg(maliciousSvg);
      
      expect(result).not.toContain('onerror');
      expect(result).not.toContain('alert');
    });

    it('should remove onload handlers', () => {
      const maliciousSvg = '<svg onload="alert(\'XSS\')"><rect/></svg>';
      const result = sanitizeSvg(maliciousSvg);
      
      expect(result).not.toContain('onload');
      expect(result).not.toContain('alert');
    });

    it('should remove iframe tags', () => {
      const maliciousSvg = '<svg><foreignObject><iframe src="http://evil.com"></iframe></foreignObject></svg>';
      const result = sanitizeSvg(maliciousSvg);
      
      expect(result).not.toContain('<iframe');
      expect(result).not.toContain('evil.com');
    });

    it('should remove object tags', () => {
      const maliciousSvg = '<svg><object data="http://evil.com"></object></svg>';
      const result = sanitizeSvg(maliciousSvg);
      
      expect(result).not.toContain('<object');
    });

    it('should remove embed tags', () => {
      const maliciousSvg = '<svg><embed src="http://evil.com"></embed></svg>';
      const result = sanitizeSvg(maliciousSvg);
      
      expect(result).not.toContain('<embed');
    });

    it('should handle multiple XSS attempts', () => {
      const maliciousSvg = `
        <svg>
          <script>alert(1)</script>
          <rect onclick="alert(2)" />
          <image onerror="alert(3)" />
          <iframe src="evil.com"></iframe>
        </svg>
      `;
      const result = sanitizeSvg(maliciousSvg);
      
      expect(result).not.toContain('alert');
      expect(result).not.toContain('onclick');
      expect(result).not.toContain('onerror');
      expect(result).not.toContain('iframe');
    });
  });

  describe('Valid SVG Preservation', () => {
    it('should preserve valid SVG elements', () => {
      const validSvg = '<svg><rect width="100" height="100" fill="red"/></svg>';
      const result = sanitizeSvg(validSvg);
      
      expect(result).toContain('<rect');
      expect(result).toContain('width');
      expect(result).toContain('height');
      expect(result).toContain('fill');
    });

    it('should preserve path elements', () => {
      const validSvg = '<svg><path d="M10 10 L20 20" stroke="black"/></svg>';
      const result = sanitizeSvg(validSvg);
      
      expect(result).toContain('<path');
      expect(result).toContain('d=');
      expect(result).toContain('stroke');
    });

    it('should preserve text elements', () => {
      const validSvg = '<svg><text x="10" y="20">Hello</text></svg>';
      const result = sanitizeSvg(validSvg);
      
      expect(result).toContain('<text');
      expect(result).toContain('Hello');
    });

    it('should preserve gradients', () => {
      const validSvg = `
        <svg>
          <defs>
            <linearGradient id="grad1">
              <stop offset="0%" stop-color="red"/>
              <stop offset="100%" stop-color="blue"/>
            </linearGradient>
          </defs>
          <rect fill="url(#grad1)"/>
        </svg>
      `;
      const result = sanitizeSvg(validSvg);
      
      expect(result).toContain('linearGradient');
      expect(result).toContain('stop');
    });

    it('should preserve groups and transforms', () => {
      const validSvg = '<svg><g transform="translate(10,10)"><rect/></g></svg>';
      const result = sanitizeSvg(validSvg);
      
      expect(result).toContain('<g');
      expect(result).toContain('transform');
    });
  });

  describe('Error Handling', () => {
    it('should throw error for empty input', () => {
      expect(() => sanitizeSvg('')).toThrow('Invalid input');
    });

    it('should throw error for non-string input', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(() => sanitizeSvg(null as any)).toThrow('Invalid input');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(() => sanitizeSvg(undefined as any)).toThrow('Invalid input');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(() => sanitizeSvg(123 as any)).toThrow('Invalid input');
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long SVG strings', () => {
      const longPath = 'M' + Array(1000).fill('10 10').join(' L');
      const longSvg = `<svg><path d="${longPath}"/></svg>`;
      
      expect(() => sanitizeSvg(longSvg)).not.toThrow();
    });

    it('should handle SVG with nested elements', () => {
      const nestedSvg = `
        <svg>
          <g>
            <g>
              <g>
                <rect/>
              </g>
            </g>
          </g>
        </svg>
      `;
      
      const result = sanitizeSvg(nestedSvg);
      expect(result).toContain('<g');
      expect(result).toContain('<rect');
    });

    it('should handle SVG with special characters in text', () => {
      const svgWithSpecialChars = '<svg><text>&lt;script&gt;alert(1)&lt;/script&gt;</text></svg>';
      const result = sanitizeSvg(svgWithSpecialChars);
      
      // Text content should be preserved but scripts should not execute
      expect(result).toContain('<text');
      expect(result).not.toContain('<script>alert');
    });
  });
});

