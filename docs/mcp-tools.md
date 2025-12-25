# MCP Tools Specification

This document provides detailed specifications for the three MCP tools provided by the Mermaid Diagram Renderer.

## Tool: `verify`

### Purpose
Validates Mermaid diagram syntax without rendering. Use this before attempting to render to ensure the code is valid.

### Input Schema

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

### Output Format

**Success:**
```json
{
  "ok": true
}
```

**Failure:**
```json
{
  "ok": false,
  "error": "Error message describing what's wrong"
}
```

### Validation Rules

- `code` must be a non-empty string
- `code` must not exceed 50KB (50,000 characters)
- `code` must be valid Mermaid syntax

### Common Error Messages

| Error | Meaning |
|-------|---------|
| `Invalid input: code must be a non-empty string` | Missing or invalid code parameter |
| `Code exceeds maximum length of 50KB` | Input too large |
| `Invalid Mermaid syntax` | Mermaid parser rejected the code |
| `Syntax error in graph definition` | Specific syntax error from Mermaid |

### Example Usage

```json
// Request
{
  "code": "graph TD\n  A[Start] --> B[End]"
}

// Response
{
  "ok": true
}
```

### Implementation

- Location: `src/mcp/tools/verify-tool.ts`
- Core Logic: `src/core/diagram/verify.ts`
- Uses Mermaid's `parse()` function to validate syntax

---

## Tool: `render`

### Purpose
Renders a Mermaid diagram to SVG for inline display in ChatGPT.

### Input Schema

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

### Output Format

```json
{
  "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" ...>...</svg>"
}
```

The SVG string is:
- Fully self-contained
- Sanitized (all scripts and dangerous elements removed)
- Ready for inline display

### Validation Rules

- Same as `verify` tool
- Additionally performs syntax verification before rendering
- SVG output is sanitized using DOMPurify

### Error Handling

If the code is invalid, an error is returned instead of attempting to render:

```json
{
  "error": "Error message"
}
```

### Security Features

1. **Server-Side Rendering**: Uses JSDOM, no client-side execution
2. **SVG Sanitization**: DOMPurify removes:
   - `<script>` tags
   - Event handlers (`onclick`, `onload`, etc.)
   - `<iframe>`, `<object>`, `<embed>` tags
   - `<link>` and `<style>` tags
   - Data URIs (except safe SVG patterns)

3. **Input Validation**: 50KB size limit enforced

### Example Usage

```json
// Request
{
  "code": "sequenceDiagram\n  Alice->>Bob: Hello\n  Bob->>Alice: Hi!"
}

// Response
{
  "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 450 220\">...</svg>"
}
```

### Implementation

- Location: `src/mcp/tools/render-tool.ts`
- Core Logic: 
  - `src/core/diagram/render.ts` - Rendering
  - `src/core/security/sanitize.ts` - Sanitization

---

## Tool: `svg`

### Purpose
Generates a downloadable SVG export with a suggested filename.

### Input Schema

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

### Output Format

```json
{
  "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" ...>...</svg>",
  "filename": "diagram-2024-12-25T10-30-00.svg"
}
```

### Filename Format

- Pattern: `diagram-YYYY-MM-DDTHH-MM-SS.svg`
- Example: `diagram-2024-12-25T14-23-45.svg`
- Uses ISO 8601 timestamp format (safe for all filesystems)

### Differences from `render`

| Aspect | render | svg |
|--------|--------|-----|
| Purpose | Inline display | Download |
| Filename | Not provided | Included |
| Use Case | Show in chat | Save to file |

Both tools produce identical SVG content; only the response structure differs.

### Example Usage

```json
// Request
{
  "code": "graph LR\n  A --> B --> C"
}

// Response
{
  "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" ...>...</svg>",
  "filename": "diagram-2024-12-25T14-30-22.svg"
}
```

### Implementation

- Location: `src/mcp/tools/svg-tool.ts`
- Core Logic:
  - `src/core/diagram/export.ts` - Export with filename
  - `src/core/security/sanitize.ts` - Sanitization

---

## Common Features

### All Tools Support

1. **All Mermaid Diagram Types**:
   - Flowcharts (`graph`, `flowchart`)
   - Sequence diagrams (`sequenceDiagram`)
   - Class diagrams (`classDiagram`)
   - State diagrams (`stateDiagram-v2`)
   - ER diagrams (`erDiagram`)
   - Gantt charts (`gantt`)
   - Pie charts (`pie`)
   - Git graphs (`gitGraph`)
   - And more...

2. **Error Recovery**:
   - Meaningful error messages
   - No internal implementation details exposed
   - Consistent error format

3. **Performance**:
   - Verification: < 300ms typical
   - Rendering: < 1s typical
   - Server-side caching via Mermaid

### Recommended Workflow

1. **Always verify first**:
   ```
   verify → (if ok) → render or svg
   ```

2. **Handle errors gracefully**:
   - If verify fails, show error and don't attempt to render
   - Let ChatGPT regenerate the code if needed

3. **Use render for display, svg for download**:
   - `render`: Show diagram in conversation
   - `svg`: Provide download when user asks for file

### Rate Limiting

Note: Rate limiting is enforced at the HTTP API layer (100 requests/hour per IP) but not at the MCP layer. MCP tools assume they're being called by ChatGPT, which has its own rate limiting.

### Testing Tools

You can test the MCP tools by calling the HTTP API endpoints directly:

```bash
# Verify
curl -X POST http://localhost:3000/api/verify \
  -H "Content-Type: application/json" \
  -d '{"code":"graph TD\nA-->B"}'

# Render
curl -X POST http://localhost:3000/api/render \
  -H "Content-Type: application/json" \
  -d '{"code":"graph TD\nA-->B"}'

# SVG Export
curl -X POST http://localhost:3000/api/svg \
  -H "Content-Type: application/json" \
  -d '{"code":"graph TD\nA-->B"}'
```

Both MCP tools and HTTP endpoints use the same core business logic, so HTTP testing validates the MCP implementation.

