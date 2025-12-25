import { generateSvgExport } from '@/core/diagram/export';
import { sanitizeSvg } from '@/core/security/sanitize';

/**
 * MCP tool handler for svg export operation
 * Generates downloadable SVG with filename
 */
export async function handleSvgTool(code: string) {
  if (!code || typeof code !== 'string') {
    throw new Error('Missing or invalid required parameter: code');
  }

  // Generate SVG export with filename
  const { svg: rawSvg, filename } = await generateSvgExport(code);
  
  // Sanitize the output
  const svg = sanitizeSvg(rawSvg);
  
  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify({ svg, filename }, null, 2),
      },
    ],
  };
}

