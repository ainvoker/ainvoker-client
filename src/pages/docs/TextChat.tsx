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

const toolRequestExample = `POST ${DOCS_BASE_URL}/v1/text/chat
Authorization: Bearer ain_YOUR_API_KEY
Content-Type: application/json

{
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

const toolResponseExample = `{
  "data": {
    "id": "…",
    "model": "openai/gpt-4o-mini",
    "message": {
      "role": "assistant",
      "content": "",
      "toolCalls": [
        {
          "id": "call_abc123",
          "name": "get_weather",
          "arguments": { "city": "Manila" }
        }
      ]
    },
    "usage": {
      "inputTokens": 52,
      "outputTokens": 17,
      "totalTokens": 69
    }
  }
}`

const toolFollowUpExample = `{
  "model": "openai/gpt-4o-mini",
  "messages": [
    { "role": "user", "content": "What's the weather in Manila?" },
    {
      "role": "assistant",
      "content": "",
      "toolCalls": [
        { "id": "call_abc123", "name": "get_weather", "arguments": { "city": "Manila" } }
      ]
    },
    {
      "role": "tool",
      "toolCallId": "call_abc123",
      "name": "get_weather",
      "content": "{\\"tempC\\":31,\\"sky\\":\\"sunny\\"}"
    }
  ]
}`

const actionsExample = `import { AInvoker } from "ainvoker"
import { z } from "zod"

const ai = new AInvoker({ apiKey: process.env.AINVOKER_API_KEY! })

// Browser action: touches the page, so it only runs in a browser.
const setThemeAction = ai.action.define({
  name: "set_theme",
  description: "Switch the UI theme",
  runtime: "browser",
  inputSchema: z.object({ theme: z.enum(["light", "dark", "system"]) }),
  method: ({ theme }) => setTheme(theme),
})

// Server action: touches the database, so it only runs on a server.
const findOrderAction = ai.action.define({
  name: "find_order",
  runtime: "server",
  inputSchema: z.object({ orderId: z.string() }),
  method: ({ orderId }) => db.order.findUnique({ where: { id: orderId } }),
})

// Universal action (runtime omitted): an HTTP call works anywhere.
const getOrderAction = ai.action.define({
  name: "get_order",
  inputSchema: z.object({ orderId: z.string() }),
  method: ({ orderId }) => fetch(\`/api/orders/\${orderId}\`).then((r) => r.json()),
})

const res = await ai.text.chat({
  model: "openai/gpt-4o-mini",
  messages: [{ role: "user", content: "Switch theme to dark" }],
  tools: [setThemeAction],
})

console.log(res.message.content) // "Dark mode is on."
console.log(res.actionRuns)      // [{ call, result: { ok: true, output, message } }]`

const actionInvokeExample = `// Same as ai.text.chat with messages: [{ role: "user", content: prompt }]
const res = await ai.action.invoke({
  model: "openai/gpt-4o-mini",
  prompt: "Switch theme to dark",
  tools: [setThemeAction],
})

console.log(res.message.content)`

const actionsParametersExample = `// Schema libraries without built-in JSON Schema output: pass parameters yourself.
const setThemeAction = ai.action.define({
  name: "set_theme",
  inputSchema: themeSchema,                // still used to validate arguments
  parameters: toJsonSchema(themeSchema),   // e.g. @valibot/to-json-schema
  method: ({ theme }) => setTheme(theme),
})`

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
      Authenticate with a project API key. Responses are returned in full. For token-by-token
      replies, see{" "}
      <Link to="/docs/text-stream" className="text-white underline underline-offset-2 hover:text-[#ddd]">
        Text Stream
      </Link>
      .
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
            <InlineCode>openai/gpt-4o-mini</InlineCode>), or a bare model name when it uniquely
            matches one catalog row. The SDK accepts separate{" "}
            <InlineCode>provider</InlineCode> and <InlineCode>model</InlineCode> fields and joins
            them.
          </>,
        ],
        [
          <InlineCode>messages</InlineCode>,
          "array",
          "Yes",
          <>
            At least one message. Roles: <InlineCode>system</InlineCode>,{" "}
            <InlineCode>user</InlineCode>, <InlineCode>assistant</InlineCode>,{" "}
            <InlineCode>tool</InlineCode>. Content must be non-empty, except an{" "}
            <InlineCode>assistant</InlineCode> message may have empty content when it includes{" "}
            <InlineCode>toolCalls</InlineCode>. A <InlineCode>tool</InlineCode> message carries{" "}
            <InlineCode>toolCallId</InlineCode>, <InlineCode>name</InlineCode>, and the tool
            result as text in <InlineCode>content</InlineCode>. See{" "}
            <a href="#tool-calling" className="text-white underline underline-offset-2 hover:text-[#ddd]">
              Tool calling
            </a>
            .
          </>,
        ],
        [
          <InlineCode>tools</InlineCode>,
          "array",
          "No",
          <>
            Up to 32 tools, each <InlineCode>{`{ name, description?, parameters }`}</InlineCode>.{" "}
            <InlineCode>parameters</InlineCode> is a JSON Schema object. Names must be unique and
            match <InlineCode>{"^[a-zA-Z_][a-zA-Z0-9_-]{0,63}$"}</InlineCode>.
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
          "Maximum tokens to generate. When omitted, output is reserved and capped at 8192 so in-flight chats count against the monthly token limit.",
        ],
        [
          <InlineCode>reasoning</InlineCode>,
          "string",
          "No",
          <>
            <InlineCode>minimal</InlineCode>, <InlineCode>low</InlineCode>,{" "}
            <InlineCode>medium</InlineCode>, or <InlineCode>high</InlineCode>. Thinking depth for
            models that support it (Gemini); lower reaches the first token faster. Ignored by
            models without thinking, such as <InlineCode>gpt-4o-mini</InlineCode>. Thinking tokens
            count toward <InlineCode>outputTokens</InlineCode>.
          </>,
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
        [
          <InlineCode>message</InlineCode>,
          <>
            Assistant message with <InlineCode>role</InlineCode> and{" "}
            <InlineCode>content</InlineCode>. Includes <InlineCode>toolCalls</InlineCode> when the
            model calls a tool; text-only replies omit it.
          </>,
        ],
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

    <H2 id="tool-calling">Tool calling</H2>
    <P>
      Pass <InlineCode>tools</InlineCode> to let the model request a function call. The gateway
      forwards the tool definitions to the provider and returns the model&apos;s calls in{" "}
      <InlineCode>message.toolCalls</InlineCode>.
    </P>
    <Callout title="The gateway does not run tools">
      Your code runs each tool. Send the result back on the next request as a{" "}
      <InlineCode>tool</InlineCode> message whose <InlineCode>toolCallId</InlineCode> matches the
      call&apos;s <InlineCode>id</InlineCode>, after the assistant message that contains the call.
    </Callout>
    <CodeBlock code={toolRequestExample} language="http" title="Request with a tool" />
    <P>
      A tool-only reply has <InlineCode>content</InlineCode> set to <InlineCode>""</InlineCode>{" "}
      and a non-empty <InlineCode>toolCalls</InlineCode> array. Each call has an{" "}
      <InlineCode>id</InlineCode>, a <InlineCode>name</InlineCode>, and{" "}
      <InlineCode>arguments</InlineCode> as a JSON object.
    </P>
    <CodeBlock code={toolResponseExample} language="json" title="200 OK with toolCalls" />
    <P>
      Then send the call and its result back. Include the same <InlineCode>tools</InlineCode>{" "}
      again if the model may call another tool.
    </P>
    <CodeBlock code={toolFollowUpExample} language="json" title="Next request body" />
    <P>
      Gemini does not always return a call id. When it is missing, the gateway assigns{" "}
      <InlineCode>call_0</InlineCode>, <InlineCode>call_1</InlineCode>, and so on within that
      response. Send that id back unchanged.
    </P>
    <P>
      A call may also carry <InlineCode>providerMetadata</InlineCode>, an opaque object such as
      Gemini&apos;s thought signature. Keep it on the call when you send the assistant message
      back; Gemini rejects the next request without it. The SDK does this for you.
    </P>

    <H2 id="actions">Actions (SDK)</H2>
    <P>
      With the SDK, <InlineCode>ai.action.define</InlineCode> pairs a tool with the method that
      runs it. Pass actions in <InlineCode>tools</InlineCode> and the SDK runs each one when the
      model calls it, sends the result back, and repeats until the model replies with text. If the
      prompt does not need an action, you get a normal reply. Plain tool definitions still come
      back as <InlineCode>toolCalls</InlineCode> for you to run.
    </P>
    <CodeBlock code={actionsExample} language="typescript" title="ai.action.define" />
    <DocsTable
      headers={["Field", "Notes"]}
      rows={[
        [<InlineCode>name</InlineCode>, "Same rules as a tool name."],
        [
          <InlineCode>inputSchema</InlineCode>,
          <>
            Any <a href="https://standardschema.dev" className="text-white underline underline-offset-2 hover:text-[#ddd]">Standard Schema</a>{" "}
            validator (Zod 4, Valibot, ArkType). Arguments are validated before{" "}
            <InlineCode>method</InlineCode> runs, and <InlineCode>method</InlineCode> is typed from
            it. Recent Zod 4 versions also produce the JSON Schema sent to the model.
          </>,
        ],
        [
          <InlineCode>parameters</InlineCode>,
          "JSON Schema for the arguments. Needed when the schema library cannot produce JSON Schema itself.",
        ],
        [
          <InlineCode>runtime</InlineCode>,
          <>
            <InlineCode>browser</InlineCode>, <InlineCode>server</InlineCode>, or{" "}
            <InlineCode>universal</InlineCode> (default). Using an action in the wrong environment
            throws <InlineCode>ACTION_RUNTIME_MISMATCH</InlineCode> before any request is sent.
          </>,
        ],
        [<InlineCode>method</InlineCode>, "Runs in your app with the validated arguments. Its return value is sent back to the model."],
      ]}
    />
    <CodeBlock code={actionsParametersExample} language="typescript" title="Explicit parameters" />
    <DocsTable
      headers={["Chat option", "Notes"]}
      rows={[
        [<InlineCode>maxSteps</InlineCode>, "Maximum model requests while actions run (default 5). Each step is a separate request against your quota."],
        [
          <InlineCode>approve</InlineCode>,
          <>
            <InlineCode>(call, action) =&gt; boolean</InlineCode>, called before each action. Return{" "}
            <InlineCode>false</InlineCode> to decline; the model receives a{" "}
            <InlineCode>DECLINED</InlineCode> result. Recommended for actions that write data.
          </>,
        ],
      ]}
    />
    <P>
      With actions, the result also includes <InlineCode>actionRuns</InlineCode>,{" "}
      <InlineCode>messages</InlineCode> (the full conversation, ready for the next request),{" "}
      <InlineCode>finishReason</InlineCode> (<InlineCode>stop</InlineCode>,{" "}
      <InlineCode>tool_calls</InlineCode> when a plain tool also needs your result, or{" "}
      <InlineCode>max_steps</InlineCode>), and <InlineCode>requestIds</InlineCode>.{" "}
      <InlineCode>usage</InlineCode> is summed across steps. Invalid arguments and methods that
      throw are sent to the model as errors so it can recover; they do not throw in your code.
    </P>
    <P>
      For a single prompt, <InlineCode>ai.action.invoke</InlineCode> takes the same options with{" "}
      <InlineCode>prompt</InlineCode> in place of <InlineCode>messages</InlineCode> and returns the
      same result.
    </P>
    <CodeBlock code={actionInvokeExample} language="typescript" title="ai.action.invoke" />
    <Callout title="Actions run in your app" variant="warning">
      The gateway never runs actions, and actions do not create records in AInvoker.{" "}
      <InlineCode>runtime</InlineCode> catches mistakes but does not keep server code out of
      browser bundles; use your framework for that (for example Next.js{" "}
      <InlineCode>server-only</InlineCode>). Browser actions mean calling the gateway from the
      browser, which exposes your project key. See{" "}
      <Link to="/docs/sdk/browser" className="text-white underline underline-offset-2 hover:text-[#ddd]">
        Browser usage
      </Link>
      .
    </Callout>

    <H2>Related</H2>
    <P>
      Streaming:{" "}
      <Link to="/docs/text-stream" className="text-white underline underline-offset-2 hover:text-[#ddd]">
        Text Stream
      </Link>
      . Available models:{" "}
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
