import { Link } from "react-router-dom"
import CodeBlock from "../../components/docs/CodeBlock"
import DocsArticle from "../../components/docs/DocsArticle"
import {
  Callout,
  H2,
  InlineCode,
  P,
  Ul,
} from "../../components/docs/DocsPrimitives"

const proxyExample = `// Browser → your backend (holds the API key) → AInvoker
const res = await fetch("/api/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    messages: [{ role: "user", content: "Hello" }],
  }),
})
const { reply } = await res.json()`

const SdkBrowser = () => (
  <DocsArticle slug="sdk/browser" title="Browser Usage">
    <Callout title="Do not put API keys in the browser" variant="warning">
      Anyone can extract secrets from client bundles. Use a backend or serverless function that
      holds the key and calls AInvoker for you. That is the supported production pattern.
    </Callout>

    <H2>Recommended pattern</H2>
    <Ul>
      <li>
        The browser talks to <strong className="text-white">your</strong> API with your own auth.
      </li>
      <li>
        Your server uses the <InlineCode>ainvoker</InlineCode> SDK (or{" "}
        <InlineCode>POST /v1/text/chat</InlineCode>) with{" "}
        <InlineCode>AINVOKER_API_KEY</InlineCode>.
      </li>
      <li>Return only what the client needs (for example the assistant message).</li>
    </Ul>
    <CodeBlock code={proxyExample} language="typescript" title="Browser → your backend" />

    <H2>Direct browser calls (optional)</H2>
    <P>
      If you still call the gateway from the browser, add your app origin under{" "}
      <strong className="text-white">Project → Settings → Allowed app URLs</strong> (exact scheme +
      host + port, for example <InlineCode>http://localhost:5173</InlineCode> or{" "}
      <InlineCode>https://app.example.com</InlineCode>), then create a key with{" "}
      <strong className="text-white">Browser</strong> selected. Until the list includes your
      origin, browser requests are blocked by CORS. Server keys are rejected whenever an{" "}
      <InlineCode>Origin</InlineCode> header is present, and browser keys are rejected without
      one.
    </P>
    <P>
      Origin allowlisting only stops other websites from using a browser key. It does not hide
      the key, and a script outside a browser can fake the <InlineCode>Origin</InlineCode>{" "}
      header, so keep browser key permissions minimal.
    </P>

    <H2>Why prefer a backend?</H2>
    <P>
      Exposing an <InlineCode>ain_</InlineCode> key in frontend code lets anyone use your quota.
      Proxying through your own API keeps the secret on the server.
    </P>
    <P>
      For server-side usage, see{" "}
      <Link
        to="/docs/sdk/nodejs"
        className="text-white underline underline-offset-2 hover:text-[#ddd]"
      >
        Node.js
      </Link>
      .
    </P>
  </DocsArticle>
)

export default SdkBrowser
