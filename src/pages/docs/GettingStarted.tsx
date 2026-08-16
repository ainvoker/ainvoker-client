import { Link } from "react-router-dom"
import CodeBlock from "../../components/docs/CodeBlock"
import DocsArticle from "../../components/docs/DocsArticle"
import {
  Callout,
  H2,
  InlineCode,
  Ol,
  P,
  Ul,
} from "../../components/docs/DocsPrimitives"
import { DOCS_BASE_URL } from "../../docs/nav"

const curlExample = `curl ${DOCS_BASE_URL}/v1/text/chat \\
  -H "Authorization: Bearer ain_YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "openai/gpt-4o-mini",
    "messages": [{ "role": "user", "content": "Hello" }]
  }'`

const sdkExample = `import { Ainvoker } from "ainvoker"

const ai = new Ainvoker({
  apiKey: process.env.AINVOKER_API_KEY!,
})

const result = await ai.text.chat({
  model: "openai/gpt-4o-mini",
  messages: [{ role: "user", content: "Hello" }],
})

console.log(result.message.content)`

const GettingStarted = () => (
  <DocsArticle
    slug="getting-started"
    title="Getting Started"
    description="Create an account, grab a project API key, and make your first text chat request."
  >
    <P>
      AInvoker is an AI gateway. You call one HTTP API (or the official{" "}
      <InlineCode>ainvoker</InlineCode> SDK) and get a unified interface across providers like
      OpenAI and Gemini.
    </P>

    <H2>1. Create an account</H2>
    <Ol>
      <li>
        <Link to="/signup" className="text-white underline underline-offset-2 hover:text-[#ddd]">
          Sign up
        </Link>{" "}
        for AInvoker.
      </li>
      <li>
        After verification, open the dashboard. A <strong className="text-white">Personal</strong>{" "}
        workspace is created for you on the Free plan.
      </li>
      <li>
        Open or create a <strong className="text-white">project</strong> in that workspace.
      </li>
    </Ol>

    <H2>2. Create an API key</H2>
    <P>
      In the project, go to <strong className="text-white">API Keys</strong> and create a key.
      Copy the secret immediately — it is shown only once and starts with{" "}
      <InlineCode>ain_</InlineCode>.
    </P>
    <Callout title="Keep keys server-side">
      Never embed API keys in public frontend code or commit them to git. Prefer environment
      variables such as <InlineCode>AINVOKER_API_KEY</InlineCode>.
    </Callout>

    <H2>3. Send a chat request</H2>
    <P>
      API base URL: <InlineCode>{DOCS_BASE_URL}</InlineCode>
    </P>
    <P>
      Authenticate with <InlineCode>Authorization: Bearer ain_…</InlineCode> and call{" "}
      <InlineCode>POST /v1/text/chat</InlineCode>:
    </P>
    <CodeBlock code={curlExample} language="bash" title="curl" />
    <P>Or with the official SDK:</P>
    <CodeBlock code={sdkExample} language="typescript" title="TypeScript" />

    <H2>What next</H2>
    <Ul>
      <li>
        <Link
          to="/docs/authentication"
          className="text-white underline underline-offset-2 hover:text-[#ddd]"
        >
          Authentication
        </Link>{" "}
        — how API keys work
      </li>
      <li>
        <Link
          to="/docs/text-chat"
          className="text-white underline underline-offset-2 hover:text-[#ddd]"
        >
          Text Chat
        </Link>{" "}
        — full request and response shape
      </li>
      <li>
        <Link to="/docs/sdk" className="text-white underline underline-offset-2 hover:text-[#ddd]">
          SDK
        </Link>{" "}
        — Node.js and browser guidance
      </li>
    </Ul>
  </DocsArticle>
)

export default GettingStarted
