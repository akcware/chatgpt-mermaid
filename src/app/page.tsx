import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Mermaid Diagram Renderer</h1>
        <p className={styles.description}>
          A ChatGPT App for rendering Mermaid diagrams with syntax verification and SVG export.
        </p>

        <div className={styles.features}>
          <h2>Features</h2>
          <ul>
            <li>
              <strong>Syntax Verification:</strong> Validate Mermaid code before rendering
            </li>
            <li>
              <strong>Inline Rendering:</strong> Display diagrams directly in ChatGPT
            </li>
            <li>
              <strong>SVG Export:</strong> Download diagrams as high-quality SVG files
            </li>
            <li>
              <strong>Server-side Processing:</strong> Secure rendering without client execution
            </li>
          </ul>
        </div>

        <div className={styles.example}>
          <h2>Example Mermaid Code</h2>
          <pre>
            <code>
{`graph TD
    A[Start] --> B{Is it valid?}
    B -->|Yes| C[Render]
    B -->|No| D[Show Error]
    C --> E[Display]
    D --> F[Retry]`}
            </code>
          </pre>
        </div>

        <div className={styles.info}>
          <h2>How to Use</h2>
          <p>
            This app is designed to be used with ChatGPT. Simply describe the diagram you want,
            and ChatGPT will generate Mermaid code, verify it, and render it for you.
          </p>
        </div>

        <footer className={styles.footer}>
          <p>Built with Next.js, Mermaid, and the OpenAI Apps SDK</p>
        </footer>
      </main>
    </div>
  );
}
