#!/usr/bin/env node

/**
 * MCP Server Entry Point
 * Starts the Mermaid Diagram Renderer MCP server
 */

import { startMcpServer, startHealthCheckServer } from './server.js';

// Start health check server for deployment platforms
const healthPort = process.env.HEALTH_PORT ? parseInt(process.env.HEALTH_PORT) : 8080;
startHealthCheckServer(healthPort).catch((error) => {
  console.error('Warning: Failed to start health check server:', error);
});

// Start the MCP server
startMcpServer().catch((error) => {
  console.error('Fatal error starting MCP server:', error);
  process.exit(1);
});

