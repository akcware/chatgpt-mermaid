import mermaid from 'mermaid';
import { JSDOM } from 'jsdom';

let initialized = false;

/**
 * Initialize Mermaid with JSDOM for server-side rendering
 * This should be called once before any Mermaid operations
 */
export function initializeMermaid(): void {
  if (initialized) {
    return;
  }

  const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
  const document = dom.window.document;

  // Set up global document for Mermaid
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  global.document = document as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  global.window = dom.window as any;

  // Mock SVG methods that JSDOM doesn't implement
  // These are required by Mermaid for diagram rendering
  if (!Element.prototype.getBBox) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (Element.prototype as any).getBBox = function() {
      return {
        x: 0,
        y: 0,
        width: 100,
        height: 100,
      };
    };
  }

  if (!Element.prototype.getComputedTextLength) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (Element.prototype as any).getComputedTextLength = function() {
      return 100;
    };
  }

  // Mock createElementNS for SVG elements
  if (!document.createElementNS) {
    const originalCreateElement = document.createElement.bind(document);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (document as any).createElementNS = function(namespaceURI: string, qualifiedName: string) {
      return originalCreateElement(qualifiedName);
    };
  }

  // Mock MutationObserver if not available
  if (typeof global.MutationObserver === 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).MutationObserver = class {
      constructor() {}
      disconnect() {}
      observe() {}
      takeRecords() { return []; }
    };
  }

  mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'strict',
    theme: 'default',
    fontFamily: 'Arial, sans-serif',
  });

  initialized = true;
}

