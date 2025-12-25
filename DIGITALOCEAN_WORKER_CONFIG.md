# Digital Ocean Worker Configuration

## MCP Worker Settings

The MCP worker needs specific configuration to deploy successfully on Digital Ocean App Platform.

### Worker Configuration

**Build Command:**
```bash
pnpm install && pnpm mcp:build
```

**Run Command:**
```bash
pnpm mcp:start
```

### Health Check Configuration

The MCP server includes an HTTP health check endpoint for deployment platforms:

**Health Check Settings:**
- **Port**: `8080` (default, configurable via `HEALTH_PORT` env var)
- **Path**: `/health` or `/`
- **Expected Response**: 200 OK with JSON payload

**Example Health Check Response:**
```json
{
  "status": "healthy",
  "service": "mermaid-mcp-server",
  "timestamp": "2025-12-25T23:00:00.000Z"
}
```

### Environment Variables

**Optional:**
- `HEALTH_PORT`: Port for health check server (default: `8080`)
- `NODE_ENV`: Set to `production`

### Important Notes

1. **Dual Protocol**: The MCP server runs BOTH:
   - **stdio** for MCP protocol (primary functionality)
   - **HTTP** on port 8080 for health checks (deployment requirement)

2. **Dependencies**: `tsc-alias` and `typescript` are in `dependencies` (not `devDependencies`) because they're required for the production build process.

3. **Build Process**:
   - TypeScript compilation with path alias resolution
   - Post-build script adds `.js` extensions for ES modules
   - Critical for Node.js ES module compatibility

### Testing Locally

```bash
# Build
pnpm mcp:build

# Start server
pnpm mcp:start

# In another terminal, test health check
curl http://localhost:8080/health
```

### Troubleshooting

**If deployment fails:**

1. Check build logs for `tsc-alias` errors
2. Verify health check is accessible on port 8080
3. Ensure `NODE_ENV=production` is set
4. Verify all dependencies are in `dependencies` (not `devDependencies`)

**Common Issues:**

- **"Cannot find package '@/core'"**: Path aliases not resolved - ensure `tsc-alias` runs during build
- **Health check timeout**: Port 8080 not accessible - check firewall/network settings
- **Module not found errors**: Missing `.js` extensions - ensure `fix-imports.js` script runs

