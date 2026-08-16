import { Link } from "react-router-dom"
import CodeBlock from "../../components/docs/CodeBlock"
import DocsArticle from "../../components/docs/DocsArticle"
import {
  H2,
  InlineCode,
  Ol,
  P,
  Ul,
} from "../../components/docs/DocsPrimitives"
import { DOCS_BASE_URL } from "../../docs/nav"

const envExample = `AINVOKER_API_KEY=ain_your_key_here`

const nodeExample = `import { Ainvoker, isAinvokerError } from "ainvoker"

const ai = new Ainvoker({
  apiKey: process.env.AINVOKER_API_KEY!,
})

const result = await ai.text.chat({
  model: "openai/gpt-4o-mini",
  messages: [{ role: "user", content: "Summarize AInvoker in one sentence." }],
  temperature: 0.5,
  maxTokens: 128,
})

console.log(result.message.content)
console.log(result.usage)`

const SdkNodejs = () => (
  <DocsArticle
    slug="sdk/nodejs"
    title="Node.js Usage"
    description="Use the official SDK from Node.js 18+ with an environment-backed API key."
  >
    <H2>Requirements</H2>
    <Ul>
      <li>Node.js 18 or newer</li>
      <li>
        <InlineCode>npm install ainvoker</InlineCode>
      </li>
      <li>
        A project API key in <InlineCode>AINVOKER_API_KEY</InlineCode>
      </li>
    </Ul>

    <H2>Environment</H2>
    <CodeBlock code={envExample} language="bash" title=".env" />
    <P>
      The SDK defaults to <InlineCode>{DOCS_BASE_URL}</InlineCode>.
    </P>

    <H2>Example</H2>
    <CodeBlock code={nodeExample} language="typescript" title="server.ts" />

    <H2>Error handling</H2>
    <P>
      Catch with <InlineCode>isAinvokerError</InlineCode> to read{" "}
      <InlineCode>status</InlineCode>, <InlineCode>code</InlineCode>, and{" "}
      <InlineCode>message</InlineCode>. See{" "}
      <Link to="/docs/errors" className="text-white underline underline-offset-2 hover:text-[#ddd]">
        Errors
      </Link>
      .
    </P>

    <H2>Checklist</H2>
    <Ol>
      <li>Create a project and API key in the dashboard.</li>
      <li>Store the key in your environment — never hard-code it.</li>
      <li>
        Call <InlineCode>ai.text.chat</InlineCode> from your backend.
      </li>
      <li>
        Monitor monthly usage in the dashboard or via response headers. See{" "}
        <Link
          to="/docs/limits"
          className="text-white underline underline-offset-2 hover:text-[#ddd]"
        >
          Limits
        </Link>
        .
      </li>
    </Ol>
  </DocsArticle>
)

export default SdkNodejs
