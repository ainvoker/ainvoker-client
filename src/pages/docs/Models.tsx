import { Link } from "react-router-dom"
import DocsArticle from "../../components/docs/DocsArticle"
import {
  Callout,
  DocsTable,
  H2,
  InlineCode,
  P,
  Ul,
} from "../../components/docs/DocsPrimitives"

const ModelsPage = () => (
  <DocsArticle
    slug="models"
    title="Models"
    description="Pass a provider/model slug on every chat request. Free plans can only use models available on Free."
  >
    <H2>Slug format</H2>
    <P>
      On the HTTP API, set <InlineCode>model</InlineCode> to{" "}
      <InlineCode>provider/model</InlineCode> — for example{" "}
      <InlineCode>openai/gpt-4o-mini</InlineCode>. A bare model name is accepted when exactly one
      ACTIVE catalog row has that name; if two providers share the name, pass the full slug. The
      SDK takes separate <InlineCode>provider</InlineCode> and <InlineCode>model</InlineCode>{" "}
      fields and joins them before calling the gateway.
    </P>

    <H2>Available models</H2>
    <DocsTable
      headers={["Slug", "Provider", "Context window", "Available on Free"]}
      rows={[
        [
          <InlineCode>openai/gpt-4o-mini</InlineCode>,
          "OpenAI",
          "128,000",
          "Yes",
        ],
        [
          <InlineCode>gemini/gemini-3.6-flash</InlineCode>,
          "Gemini",
          "1,048,576",
          "Yes",
        ],
        [
          <InlineCode>gemini/gemini-3.5-flash-lite</InlineCode>,
          "Gemini",
          "1,048,576",
          "Yes",
        ],
      ]}
    />
    <P>
      Image models for{" "}
      <Link to="/docs/image-generate" className="text-white underline underline-offset-2 hover:text-[#ddd]">
        Image Generation
      </Link>
      :
    </P>
    <DocsTable
      headers={["Slug", "Provider", "Available on Free"]}
      rows={[
        [<InlineCode>openai/gpt-image-2.5-flare</InlineCode>, "OpenAI", "No"],
      ]}
    />
    <P>
      Unknown models return <InlineCode>404 NOT_FOUND</InlineCode>.
    </P>

    <H2>Plans and models</H2>
    <Ul>
      <li>
        <strong className="text-white">Free</strong> — only models marked available on Free. Other
        models return <InlineCode>403 MODEL_NOT_ALLOWED_ON_PLAN</InlineCode>.
      </li>
      <li>
        <strong className="text-white">Pro</strong> and <strong className="text-white">Scale</strong>{" "}
        — all models in the catalog.
      </li>
      <li>
        Each project has an allowlist under <strong className="text-white">Models</strong>. A
        disabled model returns <InlineCode>403 MODEL_DISABLED</InlineCode> even when the plan
        allows it.
      </li>
    </Ul>
    <Callout title="More models over time">
      New models may be added. Use the <InlineCode>provider/model</InlineCode> slug from this
      page or your dashboard, and check{" "}
      <Link to="/docs/limits" className="text-white underline underline-offset-2 hover:text-[#ddd]">
        Limits
      </Link>{" "}
      for monthly caps.
    </Callout>
  </DocsArticle>
)

export default ModelsPage
