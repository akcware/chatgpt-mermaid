import { renderMermaidToSvg } from './render';

/**
 * Generate SVG export with filename for download
 * @param code - Mermaid diagram code
 * @returns Object containing SVG string and suggested filename
 * @throws Error if rendering fails
 */
export async function generateSvgExport(code: string): Promise<{ svg: string; filename: string }> {
  // Render the diagram
  const svg = await renderMermaidToSvg(code);

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const filename = `diagram-${timestamp}.svg`;

  return { svg, filename };
}

