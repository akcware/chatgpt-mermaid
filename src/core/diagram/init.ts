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
  
  mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'strict',
    theme: 'default',
    fontFamily: 'Arial, sans-serif',
  });

  initialized = true;
}

