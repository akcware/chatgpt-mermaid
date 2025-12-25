import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { handleVerifyTool } from './tools/verify-tool.js';
import { handleRenderTool } from './tools/render-tool.js';
import { handleSvgTool } from './tools/svg-tool.js';

/**
 * MCP Server for Mermaid Diagram Renderer
 * Provides three tools: verify, render, and svg
 */

// Tool definitions
const TOOLS: Tool[] = [
  {
    name: 'verify',
    description: 'Verify Mermaid diagram syntax without rendering. Returns {ok: true} if valid, {ok: false, error: string} if invalid.',
    inputSchema: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          description: 'Mermaid diagram code to verify',
        },
      },
      required: ['code'],
    },
  },
  {
    name: 'render',
    description: 'Render Mermaid diagram to SVG for inline display. Returns {svg: string} with sanitized SVG content.',
    inputSchema: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          description: 'Mermaid diagram code to render',
        },
      },
      required: ['code'],
    },
  },
  {
    name: 'svg',
    description: 'Generate downloadable SVG export of Mermaid diagram. Returns {svg: string, filename: string}.',
    inputSchema: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          description: 'Mermaid diagram code to export',
        },
      },
      required: ['code'],
    },
  },
];

/**
 * Create and configure MCP server
 */
export function createMcpServer(): Server {
  const server = new Server(
    {
      name: 'mermaid-diagram-renderer',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Handle list_tools request
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: TOOLS,
    };
  });

  // Handle call_tool request
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    if (!args || typeof args !== 'object') {
      throw new Error('Invalid arguments');
    }

    const { code } = args as { code?: string };

    if (!code || typeof code !== 'string') {
      throw new Error('Missing or invalid required parameter: code');
    }

    try {
      switch (name) {
        case 'verify':
          return await handleVerifyTool(code);

        case 'render':
          return await handleRenderTool(code);

        case 'svg':
          return await handleSvgTool(code);

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ error: message }, null, 2),
          },
        ],
        isError: true,
      };
    }
  });

  return server;
}

/**
 * Start MCP server with stdio transport
 */
export async function startMcpServer(): Promise<void> {
  const server = createMcpServer();
  const transport = new StdioServerTransport();

  await server.connect(transport);

  // Log to stderr to avoid interfering with stdio protocol
  console.error('Mermaid MCP Server running on stdio');
}

/**
 * Start HTTP health check server (for deployment platforms)
 */
export async function startHealthCheckServer(port: number = 8080): Promise<void> {
  const http = await import('http');
  
  const server = http.createServer((req, res) => {
    if (req.url === '/health' || req.url === '/') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'healthy',
        service: 'mermaid-mcp-server',
        timestamp: new Date().toISOString(),
      }));
    } else {
      res.writeHead(404);
      res.end('Not Found');
    }
  });

  server.listen(port, () => {
    console.error(`Health check server listening on port ${port}`);
  });
}

