# OpenAI App Manifest: Mermaid Diagram Renderer

## App Information

**App Name**: Mermaid Diagram Renderer

**Category**: Productivity / Visualization

**Version**: 1.0.0

**Short Description**: Validate, render, and export Mermaid diagrams with server-side processing and security controls.

**Full Description**:
Mermaid Diagram Renderer is a ChatGPT App that enables users to create, verify, and export Mermaid diagrams through natural language conversations. The app provides three core capabilities: syntax verification to catch errors before rendering, inline SVG rendering for immediate visualization, and downloadable SVG export for offline use. All processing is done server-side with strict security controls, including SVG sanitization and rate limiting, ensuring safe and reliable diagram generation.

## Tools

### Tool 1: verify

**Name**: `verify`

**Description**: Validates Mermaid diagram syntax without rendering. Returns a structured response indicating whether the code is valid and renderable.

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "code": {
      "type": "string",
      "description": "Mermaid diagram code to verify"
    }
  },
  "required": ["code"]
}
```

**Output Schema**:
```json
{
  "type": "object",
  "properties": {
    "ok": {
      "type": "boolean",
      "description": "True if valid, false if invalid"
    },
    "error": {
      "type": "string",
      "description": "Error message if ok is false"
    }
  }
}
```

**Example Usage**:
```
User: "Can you verify this Mermaid code: graph TD\nA-->B"
ChatGPT: *calls verify tool*
Result: { "ok": true }
ChatGPT: "The Mermaid code is valid and can be rendered."
```

---

### Tool 2: render

**Name**: `render`

**Description**: Renders a Mermaid diagram to SVG for inline display in ChatGPT. The SVG is sanitized to remove any potentially dangerous content before being returned.

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "code": {
      "type": "string",
      "description": "Mermaid diagram code to render"
    }
  },
  "required": ["code"]
}
```

**Output Schema**:
```json
{
  "type": "object",
  "properties": {
    "svg": {
      "type": "string",
      "description": "Sanitized SVG content"
    }
  }
}
```

**Example Usage**:
```
User: "Create a flowchart showing a login process"
ChatGPT: *generates Mermaid code, verifies it, then calls render*
Result: { "svg": "<svg>...</svg>" }
ChatGPT: *displays the rendered diagram inline*
```

---

### Tool 3: svg

**Name**: `svg`

**Description**: Generates a downloadable SVG export of a Mermaid diagram. Returns the SVG content along with a timestamped filename.

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "code": {
      "type": "string",
      "description": "Mermaid diagram code to export"
    }
  },
  "required": ["code"]
}
```

**Output Schema**:
```json
{
  "type": "object",
  "properties": {
    "svg": {
      "type": "string",
      "description": "Sanitized SVG content"
    },
    "filename": {
      "type": "string",
      "description": "Suggested filename for download"
    }
  }
}
```

**Example Usage**:
```
User: "I'd like to download this diagram as an SVG"
ChatGPT: *calls svg tool with the diagram code*
Result: { "svg": "<svg>...</svg>", "filename": "diagram-2024-12-25T10-30-00.svg" }
ChatGPT: "Here's your downloadable SVG file: [filename]"
```

## Expected User Flow

1. **User Request**: User describes the diagram they want in natural language
2. **Code Generation**: ChatGPT generates Mermaid code based on the description
3. **Verification**: ChatGPT calls the `verify` tool to check syntax
4. **Error Handling**: If verification fails, ChatGPT revises the code and retries
5. **Rendering**: Once verified, ChatGPT calls the `render` tool to display the diagram
6. **Export (Optional)**: If requested, ChatGPT calls the `svg` tool for download

## Security Measures

### Data Privacy
- **No Data Storage**: All requests are stateless; no user data is stored or logged
- **No Authentication Required**: Open access without user credentials
- **No Tracking**: No analytics, cookies, or user tracking

### Security Controls
- **Server-Side Only**: All Mermaid rendering occurs server-side using Node.js + JSDOM
- **SVG Sanitization**: DOMPurify removes scripts, event handlers, and dangerous elements
- **Rate Limiting**: IP-based throttling (100 requests/hour) to prevent abuse
- **Input Validation**: Maximum code size of 50KB, strict schema validation
- **Security Headers**: CSP, X-Frame-Options, X-Content-Type-Options, etc.
- **Error Masking**: Generic error messages prevent information disclosure

### Compliance
- GDPR compliant (no personal data collected)
- No third-party data sharing
- Open source dependencies with security audits
- Regular dependency updates

## Technical Stack

- **Framework**: Next.js 15 (App Router)
- **Runtime**: Node.js (server-side only)
- **Rendering**: Mermaid.js + JSDOM
- **Sanitization**: DOMPurify (isomorphic)
- **Protocol**: Model Context Protocol (MCP)
- **Language**: TypeScript

## API Endpoints

### Base URL
Production: `https://your-domain.com`
Development: `http://localhost:3000`

### Endpoints
- `POST /api/verify` - Syntax verification
- `POST /api/render` - Inline rendering
- `POST /api/svg` - SVG export

All endpoints:
- Accept JSON request bodies
- Return JSON responses
- Include rate limit headers
- Enforce security headers
- Validate input schemas

## Deployment Information

**Hosting**: Vercel / Railway / Render (or custom HTTPS endpoint)

**Requirements**:
- HTTPS enabled
- Public accessibility
- Node.js runtime support
- Environment variable: `API_BASE_URL`

**Monitoring**: Server logs only (no user data logging)

## Privacy Policy

### Data Collection
This application does NOT collect, store, or log:
- User identities
- Diagram content
- Usage analytics
- Personal information
- IP addresses (except for temporary rate limiting in memory)

### Data Processing
- All diagram rendering is ephemeral (processed in memory only)
- No databases or persistent storage
- Rate limit data expires after 1 hour
- No third-party services receive user data

### User Rights
Since no personal data is collected or stored, there is no user data to access, modify, or delete.

## Support & Contact

**Documentation**: See README.md in the repository

**Issues**: Report via GitHub issues

**Updates**: Version updates posted to OpenAI Apps directory

## Submission Checklist

- [x] Three MCP tools implemented and functional
- [x] All tools follow strict input/output schemas
- [x] Server-side rendering only (no client execution)
- [x] SVG sanitization implemented
- [x] Rate limiting active
- [x] Security headers configured
- [x] No data storage or logging
- [x] HTTPS deployment ready
- [x] Error handling for all edge cases
- [x] Documentation complete
- [x] Production-ready code

## Version History

**1.0.0** (Initial Release)
- Verify tool for syntax checking
- Render tool for inline display
- SVG tool for downloadable export
- Server-side rendering with JSDOM
- SVG sanitization with DOMPurify
- IP-based rate limiting
- Security headers and CSP
- Production deployment ready

