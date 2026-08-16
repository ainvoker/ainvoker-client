import { Link } from "react-router-dom"
import CodeBlock from "../../components/docs/CodeBlock"
import DocsArticle from "../../components/docs/DocsArticle"
import {
  Callout,
  DocsTable,
  H2,
  H3,
  InlineCode,
  P,
} from "../../components/docs/DocsPrimitives"
import { DOCS_BASE_URL } from "../../docs/nav"

const requestExample = `POST ${DOCS_BASE_URL}/v1/text/chat
Authorization: Bearer ain_YOUR_API_KEY
Content-Type: application/json

{
  "model": "openai/gpt-4o-mini",
  "messages": [
    { "role": "system", "content": "Be brief." },
    { "role": "user", "content": "Say hello" }
  ],
  "temperature": 0.7,
  "maxTokens": 256
}`

const responseExample = `{
  "data": {
    "id": "…",
    "model": "openai/gpt-4o-mini",
    "message": {
      "role": "assistant",
      "content": "Hello!"
    },
    "usage": {
      "inputTokens": 10,
      "outputTokens": 5,
      "totalTokens": 15
    }
  }
}`

const TextChat = () => (
  <DocsArticle
    slug="text-chat"
    title="Text Chat"
    description="Send a conversation and receive a complete assistant reply."
  >
    <H2>Endpoint</H2>
    <P>
      <InlineCode>POST /v1/text/chat</InlineCode>
    </P>
    <P>
      Authenticate with a project API key. Responses are returned in full (streaming is not
      available yet).
    </P>

    <H2>Request</H2>
    <CodeBlock code={requestExample} language="http" title="Request" />
    <DocsTable
      headers={["Field", "Type", "Required", "Notes"]}
      rows={[
        [
          <InlineCode>model</InlineCode>,
          "string",
          "Yes",
          <>
            Format: <InlineCode>provider/model</InlineCode> (for example{" "}
            <InlineCode>openai/gpt-4o-mini</InlineCode>)
          </>,
        ],
        [
          <InlineCode>messages</InlineCode>,
          "array",
          "Yes",
          <>
            At least one message. Roles: <InlineCode>system</InlineCode>,{" "}
            <InlineCode>user</InlineCode>, <InlineCode>assistant</InlineCode>. Content must be
            non-empty.
          </>,
        ],
        [
          <InlineCode>temperature</InlineCode>,
          "number",
          "No",
          "Sampling temperature from 0 to 2",
        ],
        [
          <InlineCode>maxTokens</InlineCode>,
          "integer",
          "No",
          "Maximum tokens to generate",
        ],
      ]}
    />
    <Callout title="Gemini messages">
      For Gemini models, include at least one <InlineCode>user</InlineCode> or{" "}
      <InlineCode>assistant</InlineCode> message. A system-only prompt is not enough.
    </Callout>

    <H2>Response</H2>
    <P>
      Successful responses wrap the result in <InlineCode>data</InlineCode>:
    </P>
    <CodeBlock code={responseExample} language="json" title="200 OK" />
    <DocsTable
      headers={["Field", "Description"]}
      rows={[
        [<InlineCode>id</InlineCode>, "Unique id for this request"],
        [<InlineCode>model</InlineCode>, "Model that was used"],
        [<InlineCode>message</InlineCode>, "Assistant message with role and content"],
        [
          <InlineCode>usage</InlineCode>,
          "Token counts, or null when usage was not reported",
        ],
      ]}
    />

    <H3>Usage headers</H3>
    <P>When your plan has monthly caps, successful responses may include:</P>
    <DocsTable
      headers={["Header", "Meaning"]}
      rows={[
        [<InlineCode>X-RateLimit-Limit-Requests</InlineCode>, "Monthly request limit"],
        [
          <InlineCode>X-RateLimit-Remaining-Requests</InlineCode>,
          "Requests remaining this month",
        ],
        [<InlineCode>X-RateLimit-Limit-Tokens</InlineCode>, "Monthly token limit"],
        [
          <InlineCode>X-RateLimit-Remaining-Tokens</InlineCode>,
          "Tokens remaining this month",
        ],
      ]}
    />
    <P>
      These headers report monthly plan usage, not per-second rate limits. See{" "}
      <Link to="/docs/limits" className="text-white underline underline-offset-2 hover:text-[#ddd]">
        Limits
      </Link>
      .
    </P>

    <H2>Related</H2>
    <P>
      Available models:{" "}
      <Link to="/docs/models" className="text-white underline underline-offset-2 hover:text-[#ddd]">
        Models
      </Link>
      . Error format:{" "}
      <Link to="/docs/errors" className="text-white underline underline-offset-2 hover:text-[#ddd]">
        Errors
      </Link>
      .
    </P>
  </DocsArticle>
)

export default TextChat
