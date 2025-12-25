# Mermaid Diagram Renderer for ChatGPT

A production-ready ChatGPT App built with the OpenAI Apps SDK (MCP) for validating, rendering, and exporting Mermaid diagrams.

## Features

- **Syntax Verification**: Validate Mermaid code before rendering to ensure correctness
- **Inline Rendering**: Display diagrams directly in ChatGPT with server-side SVG generation
- **SVG Export**: Download rendered diagrams as high-quality SVG files
- **Security First**: Server-side processing, SVG sanitization, and rate limiting
- **No Data Storage**: Fully stateless, no user data stored or logged

## Architecture

This application uses a clean layered architecture that separates business logic from transport concerns:

1. **Core Domain Layer**: Framework-agnostic business logic for diagram operations and security
2. **MCP Transport Layer**: Implements Model Context Protocol tools that directly use core logic
3. **HTTP Transport Layer**: Next.js API routes that directly use core logic (optional)

### Component Overview

```
ChatGPT → MCP Server → Core Domain Logic → SVG Output
                            ↑                    ↓
HTTP Client → API Routes ───┘           Sanitization & Security
```

**Key Benefit**: MCP tools directly import core logic instead of making HTTP calls, eliminating network overhead and simplifying deployment.

See [docs/architecture.md](docs/architecture.md) for detailed architecture documentation.

## Installation

### Prerequisites

- Node.js 20 or higher
- pnpm (recommended) or npm

### Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd chatgpt-mermaid
```

2. Install dependencies:
```bash
pnpm install
```

## Development

### Running Locally

You need to run both the Next.js server and the MCP server:

1. Start the Next.js development server:
```bash
pnpm dev
```

The Next.js server will run on `http://localhost:3000` by default.

2. In a separate terminal, start the MCP server:
```bash
pnpm mcp:dev
```

### Testing API Endpoints

Test the API endpoints using curl or your favorite HTTP client:

#### Verify Endpoint
```bash
curl -X POST http://localhost:3000/api/verify \
  -H "Content-Type: application/json" \
  -d '{"code":"graph TD\nA-->B"}'
```

Expected response:
```json
{
  "ok": true
}
```

#### Render Endpoint
```bash
curl -X POST http://localhost:3000/api/render \
  -H "Content-Type: application/json" \
  -d '{"code":"graph TD\nA-->B"}' 
```

Expected response:
```json
{
  "svg": "<svg>...</svg>"
}
```

#### SVG Export Endpoint
```bash
curl -X POST http://localhost:3000/api/svg \
  -H "Content-Type: application/json" \
  -d '{"code":"graph TD\nA-->B"}'
```

Expected response:
```json
{
  "svg": "<svg>...</svg>",
  "filename": "diagram-2024-12-25T10-30-00.svg"
}
```

## Production Build

### Building

1. Build the Next.js application:
```bash
pnpm build
```

2. Build the MCP server:
```bash
pnpm mcp:build
```

### Running in Production

1. Start the Next.js server:
```bash
pnpm start
```

2. Start the MCP server:
```bash
pnpm mcp:start
```

### Environment Variables

- `API_BASE_URL`: Base URL for the API server (default: `http://localhost:3000`)

Example for production:
```bash
export API_BASE_URL=https://your-domain.com
pnpm mcp:start
```

## MCP Tools

The MCP server provides three tools that ChatGPT can use:

### 1. `verify`

Validates Mermaid diagram syntax without rendering.

**Input Schema:**
```json
{
  "code": "string"
}
```

**Output:**
```json
{
  "ok": true
}
```
or
```json
{
  "ok": false,
  "error": "Error message"
}
```

### 2. `render`

Renders a Mermaid diagram to SVG for inline display.

**Input Schema:**
```json
{
  "code": "string"
}
```

**Output:**
```json
{
  "svg": "<svg>...</svg>"
}
```

### 3. `svg`

Generates a downloadable SVG export.

**Input Schema:**
```json
{
  "code": "string"
}
```

**Output:**
```json
{
  "svg": "<svg>...</svg>",
  "filename": "diagram-2024-12-25T10-30-00.svg"
}
```

## Security Features

### Server-Side Rendering
- All Mermaid rendering happens server-side using JSDOM
- No client-side code execution
- Prevents XSS and code injection attacks

### SVG Sanitization
- All SVG output is sanitized using DOMPurify
- Removes scripts, event handlers, and dangerous elements
- Whitelist-based approach for allowed tags and attributes

### Rate Limiting
- IP-based rate limiting: 100 requests per hour per IP
- Configurable limits in `src/lib/rate-limit.ts`
- Automatic cleanup of expired entries

### Security Headers
- Content Security Policy (CSP)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- X-XSS-Protection
- Strict Referrer-Policy

### Input Validation
- Maximum code size: 50KB
- Strict schema validation
- Type checking on all inputs
- Generic error messages (no internal details exposed)

## Project Structure

```
chatgpt-mermaid/
├── src/
│   ├── core/                      # Domain layer (business logic)
│   │   ├── diagram/               # Diagram operations
│   │   │   ├── init.ts           # Mermaid initialization
│   │   │   ├── verify.ts         # Syntax verification
│   │   │   ├── render.ts         # SVG rendering
│   │   │   └── export.ts         # Export with filename
│   │   ├── security/              # Security utilities
│   │   │   ├── sanitize.ts       # SVG sanitization
│   │   │   └── rate-limit.ts     # Rate limiting
│   │   └── __tests__/             # Core domain tests
│   │       ├── diagram.test.ts
│   │       ├── sanitize.test.ts
│   │       └── rate-limit.test.ts
│   ├── mcp/                       # MCP transport layer
│   │   ├── index.ts              # Entry point
│   │   ├── server.ts             # MCP server setup
│   │   └── tools/                # Tool implementations
│   │       ├── verify-tool.ts    # Verify tool handler
│   │       ├── render-tool.ts    # Render tool handler
│   │       └── svg-tool.ts       # SVG export tool handler
│   └── app/                       # Next.js (HTTP transport)
│       ├── api/
│       │   ├── verify/route.ts   # Verification endpoint
│       │   ├── render/route.ts   # Rendering endpoint
│       │   ├── svg/route.ts      # Export endpoint
│       │   └── health/route.ts   # Health check
│       ├── page.tsx              # Landing page
│       └── layout.tsx            # App layout
├── docs/                          # Documentation
│   ├── architecture.md           # Architecture deep-dive
│   └── mcp-tools.md             # MCP tool specifications
├── next.config.ts                # Next.js configuration
├── tsconfig.json                 # TypeScript config (Next.js)
├── tsconfig.mcp.json            # TypeScript config (MCP)
├── package.json
└── README.md
```

## Deployment

### Requirements

- HTTPS endpoint (required for OpenAI Apps)
- Public accessibility
- Node.js runtime support

### Recommended Platforms

- **Vercel**: Automatic Next.js deployment
- **Railway**: Supports both Next.js and MCP server
- **Render**: Good for full-stack deployments
- **AWS/GCP/Azure**: For enterprise deployments

### Deployment Steps

1. Deploy the Next.js application to your platform of choice
2. Set the `API_BASE_URL` environment variable to your deployed URL
3. Deploy the MCP server
4. Configure the MCP server endpoint in your OpenAI Apps configuration
5. Submit to the OpenAI Apps directory

## Limitations

- Maximum diagram code size: 50KB
- Rate limit: 100 requests per hour per IP
- Server-side rendering only (no client-side execution)
- No authentication or user sessions
- No data persistence or storage

## Troubleshooting

### MCP Server Connection Issues

If ChatGPT cannot connect to the MCP server:
- Ensure the MCP server is running and accessible
- Check that `API_BASE_URL` is set correctly
- Verify network connectivity between MCP server and API server

### Rendering Errors

If diagrams fail to render:
- Use the `verify` tool first to check syntax
- Ensure Mermaid code is valid
- Check server logs for detailed error messages
- Verify JSDOM and Mermaid dependencies are installed

### Rate Limiting

If you hit rate limits:
- Wait for the rate limit window to reset (shown in `X-RateLimit-Reset` header)
- Increase limits in `src/lib/rate-limit.ts` if needed
- Consider implementing Redis-based rate limiting for distributed deployments

## Contributing

This is a production application. Any contributions should:
- Maintain security standards
- Include proper error handling
- Follow TypeScript best practices
- Not introduce external dependencies without justification

## License

MIT

## Support

For issues and questions:
- Check this README first
- Review the code comments
- Check the OpenAI Apps SDK documentation
- Open an issue in the repository

## Changelog

### Version 1.0.0
- Initial release
- Three MCP tools: verify, render, svg
- Server-side Mermaid rendering
- SVG sanitization
- Rate limiting
- Security headers
- Production-ready deployment
