# Architecture

## Overview

This application implements a clean layered architecture that separates business logic from transport concerns.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    Transport Layer                       │
├──────────────────────────┬──────────────────────────────┤
│      MCP Server          │      HTTP API Routes         │
│   (src/mcp/server.ts)    │   (src/app/api/*/route.ts)   │
│                          │                              │
│   ┌──────────────┐       │   ┌──────────────┐          │
│   │ MCP Tools    │       │   │ Next.js API  │          │
│   │              │       │   │ Routes       │          │
│   │ verify-tool  │       │   │              │          │
│   │ render-tool  │       │   │ /api/verify  │          │
│   │ svg-tool     │       │   │ /api/render  │          │
│   └──────┬───────┘       │   │ /api/svg     │          │
│          │               │   └──────┬───────┘          │
└──────────┼───────────────┴──────────┼──────────────────┘
           │                          │
           │   Direct Import          │   Direct Import
           │                          │
           └───────────┬──────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│                    Domain Layer                          │
├──────────────────────────┬──────────────────────────────┤
│      Core Diagram        │      Core Security           │
│                          │                              │
│  verify.ts               │  sanitize.ts                 │
│  render.ts               │  rate-limit.ts               │
│  export.ts               │                              │
└─────────────────────────────────────────────────────────┘
```

## Key Principles

### 1. Domain Layer is Framework-Agnostic

The core business logic (`src/core/`) has zero dependencies on:
- Next.js
- MCP SDK
- HTTP concepts

This means the same logic can be reused in:
- MCP tools
- HTTP API endpoints
- CLI applications
- AWS Lambda functions
- Any other runtime

### 2. Direct Imports (No HTTP Proxy Pattern)

**Before:** MCP server → HTTP fetch → Next.js API → Core logic

**After:** MCP server → Direct import → Core logic

Benefits:
- Eliminates network overhead
- No need to run Next.js for MCP to work
- Simpler deployment
- Easier testing
- Better error handling

### 3. Thin Transport Adapters

Both MCP tools and API routes are thin wrappers that:
- Handle protocol-specific concerns (MCP response format, HTTP headers)
- Validate inputs
- Call core domain logic
- Format responses

Example MCP tool structure:
```typescript
// src/mcp/tools/verify-tool.ts
import { verifyMermaidCode } from '@/core/diagram/verify';

export async function handleVerifyTool(code: string) {
  // Protocol-specific validation
  if (!code || typeof code !== 'string') {
    throw new Error('Missing or invalid required parameter: code');
  }

  // Call pure business logic
  const result = await verifyMermaidCode(code);
  
  // Format as MCP response
  return {
    content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
  };
}
```

## Directory Structure

```
src/
├── core/                      # Domain layer (business logic)
│   ├── diagram/               # Diagram operations
│   │   ├── init.ts           # Mermaid initialization
│   │   ├── verify.ts         # Syntax verification
│   │   ├── render.ts         # SVG rendering
│   │   └── export.ts         # Export with filename
│   ├── security/              # Security utilities
│   │   ├── sanitize.ts       # SVG sanitization
│   │   └── rate-limit.ts     # Rate limiting
│   └── __tests__/             # Domain tests
│       ├── diagram.test.ts
│       ├── sanitize.test.ts
│       └── rate-limit.test.ts
│
├── mcp/                       # MCP transport layer
│   ├── index.ts              # Entry point
│   ├── server.ts             # MCP server setup
│   ├── tools/                # Tool implementations
│   │   ├── verify-tool.ts
│   │   ├── render-tool.ts
│   │   └── svg-tool.ts
│   └── __tests__/            # MCP integration tests
│
└── app/                       # Next.js (HTTP transport layer)
    ├── api/
    │   ├── verify/route.ts   # HTTP endpoint
    │   ├── render/route.ts   # HTTP endpoint
    │   ├── svg/route.ts      # HTTP endpoint
    │   └── health/route.ts   # Health check
    ├── layout.tsx
    └── page.tsx              # Landing page
```

## Data Flow

### MCP Tool Execution

```
1. ChatGPT sends MCP request
   ↓
2. MCP server receives request (server.ts)
   ↓
3. Route to appropriate tool handler (e.g., verify-tool.ts)
   ↓
4. Tool handler validates MCP-specific inputs
   ↓
5. Call core domain function (e.g., verifyMermaidCode)
   ↓
6. Format result as MCP response
   ↓
7. Return to ChatGPT
```

### HTTP API Request

```
1. HTTP client sends POST request
   ↓
2. Next.js route handler receives request (route.ts)
   ↓
3. Check rate limiting
   ↓
4. Parse and validate JSON body
   ↓
5. Call core domain function (same as MCP)
   ↓
6. Add HTTP security headers
   ↓
7. Return JSON response
```

## Testing Strategy

### Unit Tests (Core Domain)
- Test business logic in isolation
- No mocking required for core functions
- Located in `src/core/__tests__/`

### Integration Tests (Transport Layer)
- Test MCP tool contracts
- Test HTTP API endpoints
- Mock core domain if needed
- Verify protocol-specific behavior

## Benefits of This Architecture

1. **Testability**: Core logic tested without HTTP/MCP concerns
2. **Reusability**: Same logic serves both MCP and HTTP
3. **Maintainability**: Changes to one transport don't affect others
4. **Performance**: No unnecessary network calls
5. **Clarity**: Clear separation of concerns
6. **Scalability**: Easy to add new transports (CLI, gRPC, etc.)

## Security Architecture

Security is implemented in layers:

1. **Input Validation**: Both transport layers validate inputs
2. **Rate Limiting**: HTTP layer enforces rate limits per IP
3. **SVG Sanitization**: Core security layer sanitizes all SVG output
4. **Size Limits**: Core diagram layer enforces 50KB limit
5. **Server-Side Only**: All rendering happens server-side (JSDOM)
6. **No Data Persistence**: Fully stateless architecture

## Future Extensions

This architecture supports future enhancements without refactoring:

- **CLI Tool**: Create `src/cli/` that imports core directly
- **gRPC API**: Add `src/grpc/` alongside MCP and HTTP
- **Batch Processing**: Core functions already support it
- **Caching Layer**: Add between transport and core
- **Multiple Themes**: Extend core diagram logic
- **PNG/PDF Export**: Add new core export functions

