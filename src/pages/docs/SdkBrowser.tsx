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
  <DocsArticle
    slug="sdk/browser"
    title="Browser Usage"
    description="Call AInvoker from a backend — do not ship API keys to the browser."
  >
    <Callout title="Do not put API keys in the browser" variant="warning">
      Anyone can extract secrets from client bundles. Use a backend or serverless function that
      holds the key and calls AInvoker for you. That is the supported pattern.
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

    <H2>Why not call the API directly from the client?</H2>
    <P>
      Exposing an <InlineCode>ain_</InlineCode> key in frontend code lets anyone use your quota.
      The API also restricts which browser origins can call it, so direct client calls are not
      intended for production apps.
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
