import { verifyMermaidCode } from '../../core/diagram/verify';

/**
 * MCP tool handler for verify operation
 * Validates Mermaid diagram syntax without rendering
 */
export async function handleVerifyTool(code: string) {
  if (!code || typeof code !== 'string') {
    throw new Error('Missing or invalid required parameter: code');
  }

  const result = await verifyMermaidCode(code);
  
  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(result, null, 2),
      },
    ],
  };
}

