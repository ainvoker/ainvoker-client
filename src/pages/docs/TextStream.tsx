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

const requestExample = `POST ${DOCS_BASE_URL}/v1/text/stream
Authorization: Bearer ain_YOUR_API_KEY
Content-Type: application/json
Accept: text/event-stream

{
  "model": "openai/gpt-4o-mini",
  "messages": [
    { "role": "system", "content": "Be brief." },
    { "role": "user", "content": "Say hello" }
  ],
  "temperature": 0.7,
  "maxTokens": 256
}`

const sseExample = `event: meta
data: {"id":"…","model":"openai/gpt-4o-mini"}

event: delta
data: {"content":"Hello"}

event: delta
data: {"content":"!"}

event: done
data: {"message":{"role":"assistant","content":"Hello!"},"usage":{"inputTokens":10,"outputTokens":5,"totalTokens":15}}
`

const toolRequestExample = `{
  "model": "openai/gpt-4o-mini",
  "messages": [
    { "role": "user", "content": "What's the weather in Manila?" }
  ],
  "tools": [
    {
      "name": "get_weather",
      "description": "Current weather for a city",
      "parameters": {
        "type": "object",
        "properties": { "city": { "type": "string" } },
        "required": ["city"]
      }
    }
  ]
}`

const toolSseExample = `event: meta
data: {"id":"…","model":"openai/gpt-4o-mini"}

event: tool_call
data: {"id":"call_abc123","name":"get_weather","arguments":{"city":"Manila"}}

event: done
data: {"message":{"role":"assistant","content":"","toolCalls":[{"id":"call_abc123","name":"get_weather","arguments":{"city":"Manila"}}]},"usage":{"inputTokens":52,"outputTokens":17,"totalTokens":69}}
`

const actionStreamExample = `for await (const event of ai.text.stream({
  model: "openai/gpt-4o-mini",
  messages: [{ role: "user", content: "Switch theme to dark" }],
  tools: [setThemeAction],
})) {
  if (event.type === "delta") render(event.content)
  if (event.type === "action_result") console.log(event.name, event.result.ok)
  if (event.type === "done") console.log(event.finishReason, event.usage)
}
// Event order: meta, tool_call, action_result, meta, delta..., done`

const sdkExample = `import { AInvoker, isAInvokerError } from "ainvoker"

const ai = new AInvoker({
  apiKey: process.env.AINVOKER_API_KEY!,
})

try {
  for await (const event of ai.text.stream({
    provider: "openai",
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: "Hello" }],
  })) {
    if (event.type === "delta") {
      process.stdout.write(event.content)
    } else if (event.type === "tool_call") {
      console.log("\\nrun tool", event.name, event.arguments)
    } else if (event.type === "done") {
      console.log("\\n", event.usage)
    }
  }
} catch (error) {
  if (isAInvokerError(error)) {
    console.error(error.status, error.code, error.message)
  } else {
    throw error
  }
}`

const TextStream = () => (
  <DocsArticle
    slug="text-stream"
    title="Text Stream"
    description="Stream an assistant reply over Server-Sent Events with the same models and gates as chat."
  >
    <H2>Endpoint</H2>
    <P>
      <InlineCode>POST /v1/text/stream</InlineCode>
    </P>
    <P>
      Authenticate with a project API key. Uses the same curated text catalog, plan rules, project
      allowlist, and quota reserve as{" "}
      <Link to="/docs/text-chat" className="text-white underline underline-offset-2 hover:text-[#ddd]">
        Text Chat
      </Link>
      . Successful responses are <InlineCode>text/event-stream</InlineCode> — not the usual{" "}
      <InlineCode>{`{ data }`}</InlineCode> JSON envelope.
    </P>

    <H2>Request</H2>
    <CodeBlock code={requestExample} language="http" title="Request" />
    <P>
      Body fields match chat: <InlineCode>model</InlineCode>, <InlineCode>messages</InlineCode>,
      optional <InlineCode>tools</InlineCode>, <InlineCode>temperature</InlineCode>,{" "}
      <InlineCode>maxTokens</InlineCode>, and <InlineCode>reasoning</InlineCode>. Messages accept
      the same <InlineCode>assistant</InlineCode> <InlineCode>toolCalls</InlineCode> and{" "}
      <InlineCode>tool</InlineCode> results as chat.
    </P>
    <Callout title="First-token latency">
      Thinking models such as Gemini finish thinking before the first event arrives. With the
      provider default this can take several seconds. Set <InlineCode>reasoning</InlineCode> to{" "}
      <InlineCode>minimal</InlineCode> or <InlineCode>low</InlineCode> for faster first tokens.
    </Callout>
    <Callout title="Pre-stream errors">
      Invalid bodies, unknown models, plan or allowlist denials, and quota failures return JSON{" "}
      <InlineCode>{`{ error }`}</InlineCode> before any SSE headers are sent.
    </Callout>

    <H2>SSE events</H2>
    <CodeBlock code={sseExample} language="text" title="Event stream" />
    <DocsTable
      headers={["Event", "Payload", "When"]}
      rows={[
        [
          <InlineCode>meta</InlineCode>,
          <>
            <InlineCode>{`{ id, model }`}</InlineCode>
          </>,
          "Once at the start. id is the AIRequest id; model is the canonical provider/model slug.",
        ],
        [
          <InlineCode>delta</InlineCode>,
          <>
            <InlineCode>{`{ content }`}</InlineCode>
          </>,
          "Zero or more assistant text chunks.",
        ],
        [
          <InlineCode>tool_call</InlineCode>,
          <>
            <InlineCode>{`{ id, name, arguments }`}</InlineCode>
          </>,
          "Once per complete tool call, before done. arguments is a full JSON object; partial fragments are never sent.",
        ],
        [
          <InlineCode>done</InlineCode>,
          <>
            <InlineCode>{`{ message, usage }`}</InlineCode>
          </>,
          "Once at the end on success. message has the full text and, when the model called tools, the same toolCalls. usage matches chat (or null).",
        ],
        [
          <InlineCode>error</InlineCode>,
          <>
            <InlineCode>{`{ code, message }`}</InlineCode>
          </>,
          "If the stream fails after headers are sent, then the connection closes.",
        ],
      ]}
    />

    <H3>Tool calls</H3>
    <P>
      Send <InlineCode>tools</InlineCode> the same way as in{" "}
      <Link to="/docs/text-chat#tool-calling" className="text-white underline underline-offset-2 hover:text-[#ddd]">
        Text Chat
      </Link>
      . A response may contain both <InlineCode>delta</InlineCode> and{" "}
      <InlineCode>tool_call</InlineCode> events.
    </P>
    <CodeBlock code={toolRequestExample} language="json" title="Request body with a tool" />
    <CodeBlock code={toolSseExample} language="text" title="Event stream with a tool call" />
    <Callout title="The gateway does not run tools">
      Your code runs each tool. Send the result on the next request as a{" "}
      <InlineCode>tool</InlineCode> message whose <InlineCode>toolCallId</InlineCode> matches the
      call&apos;s <InlineCode>id</InlineCode>, after the assistant message from{" "}
      <InlineCode>done.message</InlineCode>.
    </Callout>

    <H3>Actions (SDK)</H3>
    <P>
      Actions from{" "}
      <Link to="/docs/text-chat#actions" className="text-white underline underline-offset-2 hover:text-[#ddd]">
        ai.action.define
      </Link>{" "}
      also run automatically in <InlineCode>ai.text.stream</InlineCode>. Each step streams its own{" "}
      <InlineCode>meta</InlineCode>, <InlineCode>delta</InlineCode>, and{" "}
      <InlineCode>tool_call</InlineCode> events. The SDK yields an{" "}
      <InlineCode>action_result</InlineCode> event after each action runs, then starts the next
      step. Only one <InlineCode>done</InlineCode> is yielded, at the end, with usage summed across
      steps plus <InlineCode>actionRuns</InlineCode>, <InlineCode>messages</InlineCode>, and{" "}
      <InlineCode>finishReason</InlineCode>.
    </P>
    <CodeBlock code={actionStreamExample} language="typescript" title="Streaming with an action" />

    <H3>Usage headers</H3>
    <P>
      The same monthly <InlineCode>X-RateLimit-*</InlineCode> headers as chat are set before the first
      SSE event. See{" "}
      <Link to="/docs/limits" className="text-white underline underline-offset-2 hover:text-[#ddd]">
        Limits
      </Link>
      .
    </P>

    <H2>SDK</H2>
    <CodeBlock code={sdkExample} language="typescript" title="ai.text.stream" />
    <P>
      <InlineCode>ai.text.stream</InlineCode> takes the same params as{" "}
      <InlineCode>ai.text.chat</InlineCode>. It yields typed events (
      <InlineCode>meta</InlineCode>, <InlineCode>delta</InlineCode>,{" "}
      <InlineCode>tool_call</InlineCode>, <InlineCode>done</InlineCode>,{" "}
      <InlineCode>error</InlineCode>, plus the SDK-only <InlineCode>action_result</InlineCode> when
      actions are passed). After an <InlineCode>error</InlineCode> event is yielded, the
      SDK throws <InlineCode>AInvokerError</InlineCode> (HTTP status 200 because the SSE response
      already started; code and message come from the event).
    </P>

    <H2>Related</H2>
    <P>
      Non-streaming completion:{" "}
      <Link to="/docs/text-chat" className="text-white underline underline-offset-2 hover:text-[#ddd]">
        Text Chat
      </Link>
      . Models:{" "}
      <Link to="/docs/models" className="text-white underline underline-offset-2 hover:text-[#ddd]">
        Models
      </Link>
      . Errors:{" "}
      <Link to="/docs/errors" className="text-white underline underline-offset-2 hover:text-[#ddd]">
        Errors
      </Link>
      .
    </P>
  </DocsArticle>
)

export default TextStream
