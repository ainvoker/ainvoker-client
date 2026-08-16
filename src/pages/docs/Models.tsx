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
      Set <InlineCode>model</InlineCode> to <InlineCode>provider/model</InlineCode> — for
      example <InlineCode>openai/gpt-4o-mini</InlineCode>. A model name without a provider is
      rejected.
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
