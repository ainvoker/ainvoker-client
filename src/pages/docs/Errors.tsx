import CodeBlock from "../../components/docs/CodeBlock"
import DocsArticle from "../../components/docs/DocsArticle"
import {
  DocsTable,
  H2,
  InlineCode,
  P,
} from "../../components/docs/DocsPrimitives"

const errorExample = `{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Missing or invalid Authorization header"
  }
}`

const Errors = () => (
  <DocsArticle
    slug="errors"
    title="Errors"
    description="API failures use a consistent JSON format. Success responses wrap the result in data."
  >
    <H2>Error format</H2>
    <CodeBlock code={errorExample} language="json" title="Error" />
    <P>
      Successful responses use <InlineCode>{"{ \"data\": … }"}</InlineCode>. Invalid requests
      return <InlineCode>400 VALIDATION_ERROR</InlineCode> with a human-readable{" "}
      <InlineCode>message</InlineCode>.
    </P>

    <H2>Error codes</H2>
    <DocsTable
      headers={["HTTP", "Code", "Typical cause"]}
      rows={[
        ["400", <InlineCode>VALIDATION_ERROR</InlineCode>, "Invalid request body"],
        ["401", <InlineCode>UNAUTHORIZED</InlineCode>, "Missing, invalid, or expired API key"],
        ["402", <InlineCode>SUBSCRIPTION_REQUIRED</InlineCode>, "No active plan on the workspace"],
        ["403", <InlineCode>FORBIDDEN</InlineCode>, "Access denied for this project"],
        [
          "403",
          <InlineCode>MODEL_NOT_ALLOWED_ON_PLAN</InlineCode>,
          "Model not available on your plan",
        ],
        ["404", <InlineCode>NOT_FOUND</InlineCode>, "Unknown model"],
        ["429", <InlineCode>RATE_LIMIT_EXCEEDED</InlineCode>, "Monthly request or token quota"],
        ["500", <InlineCode>INTERNAL_ERROR</InlineCode>, "Unexpected server error"],
        ["502", <InlineCode>UPSTREAM_ERROR</InlineCode>, "Upstream provider failed"],
      ]}
    />

    <H2>SDK errors</H2>
    <P>
      The <InlineCode>ainvoker</InlineCode> SDK throws <InlineCode>AinvokerError</InlineCode> with{" "}
      <InlineCode>status</InlineCode>, <InlineCode>code</InlineCode>, and{" "}
      <InlineCode>message</InlineCode>. Additional client-side codes:
    </P>
    <DocsTable
      headers={["Code", "Meaning"]}
      rows={[
        [<InlineCode>NETWORK_ERROR</InlineCode>, "Request failed before a response"],
        [<InlineCode>INVALID_RESPONSE</InlineCode>, "Response could not be parsed"],
        [<InlineCode>HTTP_ERROR</InlineCode>, "Non-success response without a standard error body"],
      ]}
    />
  </DocsArticle>
)

export default Errors
