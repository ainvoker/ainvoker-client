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
import { DOCS_BASE_URL } from "../../docs/nav"

const installExample = `npm install ainvoker`

const quickStart = `import { Ainvoker, isAinvokerError } from "ainvoker"

const ai = new Ainvoker({
  apiKey: process.env.AINVOKER_API_KEY!,
  // optional — defaults to ${DOCS_BASE_URL}
})

try {
  const result = await ai.text.chat({
    model: "openai/gpt-4o-mini",
    messages: [{ role: "user", content: "Hello" }],
  })
  console.log(result.message.content)
} catch (error) {
  if (isAinvokerError(error)) {
    console.error(error.status, error.code, error.message)
  } else {
    throw error
  }
}`

const SdkOverview = () => (
  <DocsArticle
    slug="sdk"
    title="SDK Overview"
    description="The official TypeScript/JavaScript package for the AInvoker API."
  >
    <H2>Install</H2>
    <CodeBlock code={installExample} language="bash" title="npm" />
    <P>
      Package name: <InlineCode>ainvoker</InlineCode>. Requires Node.js 18 or newer.
    </P>

    <H2>Quick start</H2>
    <CodeBlock code={quickStart} language="typescript" title="TypeScript" />

    <H2>Client options</H2>
    <Ul>
      <li>
        <InlineCode>apiKey</InlineCode> (required) — your project key starting with{" "}
        <InlineCode>ain_</InlineCode>
      </li>
      <li>
        <InlineCode>baseUrl</InlineCode> (optional) — defaults to{" "}
        <InlineCode>{DOCS_BASE_URL}</InlineCode>
      </li>
    </Ul>

    <H2>What it covers</H2>
    <P>
      The SDK exposes <InlineCode>ai.text.chat(…)</InlineCode> for{" "}
      <InlineCode>POST /v1/text/chat</InlineCode>. It unwraps the response{" "}
      <InlineCode>data</InlineCode> for you.
    </P>
    <Callout title="Dashboard stays in the browser">
      Create projects, manage billing, and issue API keys in the AInvoker dashboard. The SDK is
      for calling models from your application.
    </Callout>

    <H2>Platform guides</H2>
    <Ul>
      <li>
        <Link
          to="/docs/sdk/nodejs"
          className="text-white underline underline-offset-2 hover:text-[#ddd]"
        >
          Node.js usage
        </Link>
      </li>
      <li>
        <Link
          to="/docs/sdk/browser"
          className="text-white underline underline-offset-2 hover:text-[#ddd]"
        >
          Browser usage
        </Link>
      </li>
    </Ul>
  </DocsArticle>
)

export default SdkOverview
