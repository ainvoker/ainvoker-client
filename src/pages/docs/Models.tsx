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
  <DocsArticle slug="models">
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
      headers={["Slug", "Provider", "Context window", "Tier", "Plans"]}
      rows={[
        [<InlineCode>openai/gpt-4o-mini</InlineCode>, "OpenAI", "128,000", "Economy", "All"],
        [<InlineCode>openai/gpt-6-luna</InlineCode>, "OpenAI", "1,050,000", "Economy", "Pro, Scale"],
        [<InlineCode>openai/gpt-6.1-sol</InlineCode>, "OpenAI", "1,050,000", "Premium", "Pro, Scale"],
        [<InlineCode>openai/gpt-6-astra</InlineCode>, "OpenAI", "1,050,000", "Premium", "Pro, Scale"],
        [<InlineCode>gemini/gemini-3.5-flash-lite</InlineCode>, "Gemini", "1,048,576", "Economy", "All"],
        [<InlineCode>gemini/gemini-3.6-flash</InlineCode>, "Gemini", "1,048,576", "Economy", "All"],
        [<InlineCode>gemini/gemini-3.8-flash</InlineCode>, "Gemini", "1,048,576", "Economy", "All"],
        [<InlineCode>gemini/gemini-3.1-pro-preview</InlineCode>, "Gemini", "1,048,576", "Premium", "Pro, Scale"],
        [<InlineCode>gemini/gemini-4-argon</InlineCode>, "Gemini", "1,048,576", "Premium", "Pro, Scale"],
      ]}
    />
    <P>
      Image models for{" "}
      <Link to="/docs/image-generate" className="text-white underline underline-offset-2 hover:text-[#ddd]">
        Image Generation
      </Link>
. Image models are available on Pro and Scale.
    </P>
    <DocsTable
      headers={["Slug", "Provider", "Tier", "Plans"]}
      rows={[
        [<InlineCode>openai/gpt-image-2.5-flare</InlineCode>, "OpenAI", "Premium", "Pro, Scale"],
        [<InlineCode>openai/gpt-image-2.5-sunburst</InlineCode>, "OpenAI", "Premium", "Pro, Scale"],
        [<InlineCode>gemini/gemini-3.1-flash-lite-image</InlineCode>, "Gemini", "Premium", "Pro, Scale"],
        [<InlineCode>gemini/gemini-nano-banana-2.1</InlineCode>, "Gemini", "Premium", "Pro, Scale"],
        [<InlineCode>gemini/gemini-3-pro-image</InlineCode>, "Gemini", "Premium", "Pro, Scale"],
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
        — every model in the catalog, including premium text models and all image models.
      </li>
      <li>
        Premium models cost more per token, so on Pro they use up your monthly token allowance
        faster than economy models.
      </li>
      <li>
        Each project has an allowlist under <strong className="text-white">Models</strong>. A
        disabled model returns <InlineCode>403 MODEL_DISABLED</InlineCode> even when the plan
        allows it. Premium models start disabled; an owner or admin turns them on per project.
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
