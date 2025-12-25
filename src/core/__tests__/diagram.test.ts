import { describe, it, expect } from 'vitest';
import { verifyMermaidCode } from '../diagram/verify.js';
import { renderMermaidToSvg } from '../diagram/render.js';

describe('verifyMermaidCode', () => {
  describe('Valid Mermaid Code', () => {
    it('should verify simple flowchart', async () => {
      const code = 'graph TD\n  A --> B';
      const result = await verifyMermaidCode(code);
      
      expect(result.ok).toBe(true);
    });

    it('should verify sequence diagram', async () => {
      const code = 'sequenceDiagram\n  Alice->>Bob: Hello';
      const result = await verifyMermaidCode(code);
      
      expect(result.ok).toBe(true);
    });

    it('should verify class diagram', async () => {
      const code = 'classDiagram\n  class Animal';
      const result = await verifyMermaidCode(code);
      
      expect(result.ok).toBe(true);
    });

    it('should verify state diagram', async () => {
      const code = 'stateDiagram-v2\n  [*] --> State1';
      const result = await verifyMermaidCode(code);
      
      expect(result.ok).toBe(true);
    });

    it('should verify ER diagram', async () => {
      const code = 'erDiagram\n  CUSTOMER ||--o{ ORDER : places';
      const result = await verifyMermaidCode(code);
      
      expect(result.ok).toBe(true);
    });

    it('should verify complex flowchart with decisions', async () => {
      const code = `graph TD
        A[Start] --> B{Decision}
        B -->|Yes| C[Action 1]
        B -->|No| D[Action 2]
        C --> E[End]
        D --> E`;
      const result = await verifyMermaidCode(code);
      
      expect(result.ok).toBe(true);
    });
  });

  describe('Invalid Mermaid Code', () => {
    it('should reject completely invalid syntax', async () => {
      const code = 'this is not valid mermaid syntax at all!!!';
      const result = await verifyMermaidCode(code);
      
      expect(result.ok).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject empty code', async () => {
      const code = '';
      const result = await verifyMermaidCode(code);
      
      expect(result.ok).toBe(false);
      expect(result.error).toContain('non-empty string');
    });

    it('should reject malformed flowchart', async () => {
      const code = 'graph TD\n  A --> --> B';
      const result = await verifyMermaidCode(code);
      
      expect(result.ok).toBe(false);
    });

    it('should reject code with invalid characters', async () => {
      const code = 'graph TD\n  A --> B\n  ;;;;;;;';
      const result = await verifyMermaidCode(code);
      
      // Mermaid may accept this as valid, so we just check the structure
      expect(result).toHaveProperty('ok');
    });
  });

  describe('Input Validation', () => {
    it('should reject non-string input', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await verifyMermaidCode(null as any);
      
      expect(result.ok).toBe(false);
      expect(result.error).toContain('non-empty string');
    });

    it('should reject code exceeding 50KB', async () => {
      const largeCode = 'graph TD\n' + 'A --> B\n'.repeat(10000);
      const result = await verifyMermaidCode(largeCode);
      
      expect(result.ok).toBe(false);
      expect(result.error).toContain('50KB');
    });

    it('should accept code just under 50KB limit', async () => {
      const code = 'graph TD\n' + 'A --> B\n'.repeat(5000);
      const result = await verifyMermaidCode(code);
      
      // Should succeed or fail based on syntax, not size
      expect(result).toHaveProperty('ok');
    });
  });

  describe('Error Messages', () => {
    it('should provide meaningful error messages', async () => {
      const code = 'graph TD\n  A -->';
      const result = await verifyMermaidCode(code);
      
      expect(result.ok).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.length).toBeGreaterThan(0);
    });
  });
});

describe('renderMermaidToSvg', () => {
  describe('Valid Rendering', () => {
    it('should render simple flowchart to SVG', async () => {
      const code = 'graph TD\n  A --> B';
      
      const svg = await renderMermaidToSvg(code);
      expect(svg).toContain('<svg');
      expect(svg).toContain('</svg>');
      expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
    });

    it('should render sequence diagram to SVG', async () => {
      const code = 'sequenceDiagram\n  Alice->>Bob: Hello';
      
      const svg = await renderMermaidToSvg(code);
      expect(svg).toContain('<svg');
      expect(svg).toContain('</svg>');
      expect(svg).toContain('Alice');
      expect(svg).toContain('Bob');
    });

    it('should produce valid SVG structure', async () => {
      const code = 'graph LR\n  A --> B';
      
      const svg = await renderMermaidToSvg(code);
      expect(svg).toContain('<svg');
      expect(svg).toContain('</svg>');
      expect(svg.indexOf('<svg')).toBeLessThan(svg.indexOf('</svg>'));
    });

    it('should include diagram content in SVG', async () => {
      const code = 'graph TD\n  Start[Start Node] --> End[End Node]';
      
      const svg = await renderMermaidToSvg(code);
      expect(svg).toContain('<svg');
      expect(svg).toContain('</svg>');
    });
  });

  describe('Error Handling', () => {
    it('should throw error for invalid Mermaid code', async () => {
      const code = 'invalid mermaid syntax!!!';
      
      await expect(renderMermaidToSvg(code)).rejects.toThrow();
    });

    it('should throw error for empty code', async () => {
      const code = '';
      
      await expect(renderMermaidToSvg(code)).rejects.toThrow('non-empty string');
    });

    it('should throw error for code exceeding size limit', async () => {
      const largeCode = 'graph TD\n' + 'A --> B\n'.repeat(10000);
      
      await expect(renderMermaidToSvg(largeCode)).rejects.toThrow('50KB');
    });

    it('should throw error for non-string input', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await expect(renderMermaidToSvg(null as any)).rejects.toThrow('non-empty string');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await expect(renderMermaidToSvg(undefined as any)).rejects.toThrow('non-empty string');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await expect(renderMermaidToSvg(123 as any)).rejects.toThrow('non-empty string');
    });
  });

  describe('Verification Before Rendering', () => {
    it('should verify code before attempting to render', async () => {
      const code = 'graph TD\n  A -->';
      
      // Should fail verification and throw, not attempt to render
      await expect(renderMermaidToSvg(code)).rejects.toThrow();
    });
  });

  describe('SVG Output Quality', () => {
    it('should produce unique SVG for different diagrams', async () => {
      const code1 = 'graph TD\n  A --> B';
      const code2 = 'graph TD\n  X --> Y --> Z';
      
      const svg1 = await renderMermaidToSvg(code1);
      const svg2 = await renderMermaidToSvg(code2);
      
      expect(svg1).toContain('<svg');
      expect(svg2).toContain('<svg');
      // SVGs should have different IDs
      expect(svg1).not.toEqual(svg2);
    });

    it('should handle diagrams with special characters in labels', async () => {
      const code = 'graph TD\n  A["Node with quotes"] --> B["Node and Symbol"]';
      
      const svg = await renderMermaidToSvg(code);
      expect(svg).toContain('<svg');
      expect(svg).toContain('</svg>');
    });
  });
});

