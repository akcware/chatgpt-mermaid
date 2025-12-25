#!/usr/bin/env node

/**
 * MCP Server Entry Point
 * Starts the Mermaid Diagram Renderer MCP server
 */

import { startMcpServer } from './server.js';

// Start the server
startMcpServer().catch((error) => {
  console.error('Fatal error starting MCP server:', error);
  process.exit(1);
});

