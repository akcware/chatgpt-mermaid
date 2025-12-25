# Product Requirements Document (PRD)

## Product Name

**Mermaid Diagram Renderer for ChatGPT**

## Version

v1.0 (Apps SDK / MCP)

## Author

Internal / OpenAI Apps SDK Developer

## Status

Draft – Submission‑ready

---

## 1. Problem Statement

ChatGPT currently supports Mermaid **code generation**, but not **native rendering, verification, or export** of diagrams. Users who want diagrams must:

* Copy Mermaid code manually
* Paste it into third‑party editors
* Debug syntax errors outside ChatGPT
* Export SVG/PNG separately

This breaks conversational flow and creates unnecessary friction.

---

## 2. Product Vision

Enable users to **request, verify, render, and export Mermaid diagrams directly inside ChatGPT** with a native, deterministic, and self‑healing experience.

The product should feel like a **built‑in capability**, not an external tool.

---

## 3. Goals & Non‑Goals

### 3.1 Goals

* Render Mermaid diagrams **inside ChatGPT**
* Automatically **verify Mermaid syntax** before rendering
* Enable **SVG download** via native UI
* Support automatic **retry on syntax/render failure**
* Maintain strict **security & privacy compliance**
* Be App Store submission‑ready

### 3.2 Non‑Goals

* Editing Mermaid diagrams visually (Phase 2+)
* PNG/PDF export (future scope)
* User authentication or persistence (v1)
* Multi‑diagram dashboards

---

## 4. Target Users

* Software engineers
* System architects
* Students & educators
* Technical writers
* Product managers

Primary use cases:

* Flowcharts
* Architecture diagrams
* Sequence diagrams
* State diagrams

---

## 5. User Experience Flow

### 5.1 Happy Path

1. User asks for a diagram in natural language
2. ChatGPT generates Mermaid code
3. ChatGPT calls `verify` tool
4. If verification passes:

   * ChatGPT calls `render` tool
   * Diagram is rendered inline
   * "Download SVG" button is shown
5. User downloads SVG if desired

### 5.2 Failure & Retry Path

1. Verification or render fails
2. Tool returns structured error
3. ChatGPT rewrites Mermaid code
4. Verification is retried automatically
5. User never sees invalid output

---

## 6. Functional Requirements

### 6.1 Tools

#### 6.1.1 `verify`

**Purpose:** Validate Mermaid syntax and renderability without producing UI output.

**Input:**

```json
{ "code": "string" }
```

**Output:**

```json
{ "ok": true }
```

OR

```json
{ "ok": false, "error": "string" }
```

---

#### 6.1.2 `render`

**Purpose:** Render Mermaid code into SVG for inline display.

**Input:**

```json
{ "code": "string" }
```

**Output:**

```json
{ "svg": "string" }
```

---

#### 6.1.3 `svg`

**Purpose:** Provide downloadable SVG output.

**Input:**

```json
{ "code": "string" }
```

**Output:**

```json
{ "svg": "string", "filename": "diagram.svg" }
```

---

## 7. UI Requirements

### 7.1 Diagram Card

* Title: "Mermaid Diagram"
* Inline SVG rendering
* Download button

### 7.2 Download Button

* MIME type: `image/svg+xml`
* Filename: `diagram.svg`
* Native ChatGPT card action

---

## 8. System Architecture

### 8.1 High‑Level Architecture

```
ChatGPT
 └─ Apps SDK
     └─ MCP Server (Next.js)
         ├─ /api/verify
         ├─ /api/render
         ├─ /api/svg
         └─ Mermaid Renderer (Node.js + JSDOM)
```

### 8.2 Runtime

* Node.js runtime only
* No Edge execution

---

## 9. Security & Privacy

* No user authentication
* No PII collection
* No data persistence
* Server‑side rendering only
* SVG sanitization enforced
* Rate limiting enabled

---

## 10. Error Handling

* All tool failures return structured JSON errors
* ChatGPT retries internally
* User never sees stack traces

---

## 11. Metadata & Discoverability

* Clear app description
* Tool descriptions optimized for correct model selection
* Example prompts included in metadata

---

## 12. Performance Requirements

* Verification: < 300ms
* Rendering: < 1s
* SVG export: < 1s

---

## 13. Compliance Checklist

* MCP‑compatible server
* HTTPS public endpoint
* UI follows ChatGPT UI guidelines
* UX follows conversational principles
* Security & privacy compliant
* No disallowed content

---

## 14. Future Enhancements

### Phase 2

* Theme selection (dark/light)
* Zoom & pan
* Error highlighting

### Phase 3

* Explain diagram
* Modify diagram
* PNG/PDF export

---

## 15. Success Metrics

* % of diagrams rendered without retry
* Average retries per request
* SVG downloads per session
* App approval rate

---

## 16. Risks & Mitigations

| Risk                    | Mitigation            |
| ----------------------- | --------------------- |
| Invalid Mermaid output  | Automated retry loop  |
| SVG injection           | Sanitization          |
| Performance bottlenecks | Rate limits + caching |

---

## 17. Open Questions

* Should diagram themes be auto‑detected?
* Should multiple diagrams per message be supported?
* Should versioning be exposed to users?

---

**End of PRD**
