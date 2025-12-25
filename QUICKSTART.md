# Quick Start Guide

Get the Mermaid Diagram Renderer running in under 5 minutes.

## Prerequisites

- Node.js 20+ installed
- pnpm installed (`npm install -g pnpm`)

## Installation

```bash
# 1. Clone and navigate to the project
cd chatgpt-mermaid

# 2. Install dependencies
pnpm install

# 3. Build both Next.js and MCP server
pnpm build
pnpm mcp:build
```

## Running in Development

### Option 1: Two Separate Terminals (Recommended)

**Terminal 1 - Next.js Server:**
```bash
pnpm dev
```
Server will start on `http://localhost:3000`

**Terminal 2 - MCP Server:**
```bash
pnpm mcp:dev
```

### Option 2: Production Mode

**Terminal 1 - Next.js Server:**
```bash
pnpm start
```

**Terminal 2 - MCP Server:**
```bash
pnpm mcp:start
```

## Testing

Once both servers are running, test the API:

```bash
# Make test script executable (first time only)
chmod +x test-api.sh

# Run tests
./test-api.sh
```

Or test manually:

```bash
# Test verification
curl -X POST http://localhost:3000/api/verify \
  -H "Content-Type: application/json" \
  -d '{"code":"graph TD\n  A --> B"}'

# Expected: {"ok":true}
```

## Connecting to ChatGPT

1. Configure your MCP client with the `mcp-config.json` file:
```json
{
  "mcpServers": {
    "mermaid-diagram-renderer": {
      "command": "node",
      "args": ["dist/mcp/index.js"],
      "env": {
        "API_BASE_URL": "http://localhost:3000"
      }
    }
  }
}
```

2. For production, update `API_BASE_URL` to your deployed URL

3. The MCP server exposes three tools to ChatGPT:
   - `verify` - Check Mermaid syntax
   - `render` - Generate inline SVG
   - `svg` - Export downloadable SVG

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Build Errors
```bash
# Clean build and reinstall
rm -rf node_modules dist .next
pnpm install
pnpm build
pnpm mcp:build
```

### MCP Server Not Connecting
- Ensure Next.js server is running first
- Check `API_BASE_URL` in your environment
- Verify both servers are accessible

## Next Steps

- Read the full [README.md](./README.md) for detailed documentation
- Review [APP_MANIFEST.md](./APP_MANIFEST.md) for submission guidelines
- Check API endpoint documentation in README

## Example Mermaid Diagrams

### Flowchart
```
graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Action 1]
    B -->|No| D[Action 2]
    C --> E[End]
    D --> E
```

### Sequence Diagram
```
sequenceDiagram
    Alice->>John: Hello John!
    John-->>Alice: Hi Alice!
```

### Class Diagram
```
classDiagram
    class Animal {
        +String name
        +int age
        +makeSound()
    }
```

For more examples, visit [Mermaid Documentation](https://mermaid.js.org/).

