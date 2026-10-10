import { Link } from "react-router-dom"
import CodeBlock from "../../components/docs/CodeBlock"
import DocsArticle from "../../components/docs/DocsArticle"
import {
  Callout,
  DocsTable,
  H2,
  InlineCode,
  P,
} from "../../components/docs/DocsPrimitives"
import { DOCS_BASE_URL } from "../../docs/nav"

const requestExample = `POST ${DOCS_BASE_URL}/v1/image/generate
Authorization: Bearer ain_YOUR_API_KEY
Content-Type: application/json

{
  "model": "openai/gpt-image-2.5-flare",
  "prompt": "A cute puppy eating carrots",
  "size": "1024x1024",
  "quality": "medium"
}`

const responseExample = `{
  "data": {
    "id": "…",
    "model": "openai/gpt-image-2.5-flare",
    "images": [
      {
        "base64": "iVBORw0KGgo…",
        "mimeType": "image/png"
      }
    ],
    "usage": {
      "inputTokens": 12,
      "outputTokens": 439,
      "totalTokens": 451
    }
  }
}`

const sdkExample = `import { writeFile } from "node:fs/promises"
import { AInvoker } from "ainvoker"

const ai = new AInvoker({ apiKey: process.env.AINVOKER_API_KEY! })

const result = await ai.image.generate({
  provider: "openai",
  model: "gpt-image-2.5-flare",
  prompt: "A cute puppy eating carrots",
})

// result.image is the first entry of result.images
await writeFile("puppy.png", Buffer.from(result.image.base64, "base64"))`

const ImageGenerate = () => (
  <DocsArticle
    slug="image-generate"
    title="Image Generation"
    description="Generate images from a text prompt."
  >
    <H2>Endpoint</H2>
    <P>
      <InlineCode>POST /v1/image/generate</InlineCode>
    </P>
    <P>
      Authenticate with a project API key. The response returns once every image is ready, which
      can take several seconds at higher quality settings.
    </P>
    <Callout title="Pro and Scale only">
      Image models are not available on the Free plan and return{" "}
      <InlineCode>403 MODEL_NOT_ALLOWED_ON_PLAN</InlineCode>. Upstream providers do not offer free
      image generation through their APIs.
    </Callout>

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
            Format: <InlineCode>provider/model</InlineCode>, for example{" "}
            <InlineCode>openai/gpt-image-2.5-flare</InlineCode>.
          </>,
        ],
        [<InlineCode>prompt</InlineCode>, "string", "Yes", "What to draw. Up to 32,000 characters."],
        [<InlineCode>n</InlineCode>, "integer", "No", "Number of images, 1 to 4. Defaults to 1."],
        [
          <InlineCode>size</InlineCode>,
          "string",
          "No",
          <>
            <InlineCode>1024x1024</InlineCode>, <InlineCode>1024x1536</InlineCode>,{" "}
            <InlineCode>1536x1024</InlineCode>, or <InlineCode>auto</InlineCode>.
          </>,
        ],
        [
          <InlineCode>quality</InlineCode>,
          "string",
          "No",
          <>
            <InlineCode>low</InlineCode>, <InlineCode>medium</InlineCode>,{" "}
            <InlineCode>high</InlineCode>, <InlineCode>xhigh</InlineCode>,{" "}
            <InlineCode>max</InlineCode>, or <InlineCode>auto</InlineCode>. Higher quality uses more
            output tokens.
          </>,
        ],
        [
          <InlineCode>outputFormat</InlineCode>,
          "string",
          "No",
          <>
            <InlineCode>png</InlineCode> (default), <InlineCode>jpeg</InlineCode>, or{" "}
            <InlineCode>webp</InlineCode>.
          </>,
        ],
      ]}
    />

    <H2>Response</H2>
    <CodeBlock code={responseExample} language="json" title="200 OK" />
    <DocsTable
      headers={["Field", "Description"]}
      rows={[
        [<InlineCode>id</InlineCode>, "Unique id for this request"],
        [<InlineCode>model</InlineCode>, "Model that was used"],
        [
          <InlineCode>images</InlineCode>,
          <>
            One entry per image: <InlineCode>base64</InlineCode> (no <InlineCode>data:</InlineCode>{" "}
            prefix), <InlineCode>mimeType</InlineCode>, and <InlineCode>revisedPrompt</InlineCode>{" "}
            when the provider rewrote your prompt.
          </>,
        ],
        [<InlineCode>usage</InlineCode>, "Token counts, or null when usage was not reported"],
      ]}
    />
    <P>
      AInvoker does not store image bytes. Save them on your side if you need them later. Request
      logs keep the prompt, token usage, and cost.
    </P>

    <H2>Usage and limits</H2>
    <P>
      Each call counts as one request. Image tokens count toward your monthly token limit like
      text tokens. While a request is in flight, each requested image reserves 8,000 output
      tokens; the reservation is replaced by the actual usage when the image is ready. See{" "}
      <Link to="/docs/limits" className="text-white underline underline-offset-2 hover:text-[#ddd]">
        Limits
      </Link>
      .
    </P>

    <H2>SDK</H2>
    <CodeBlock code={sdkExample} language="typescript" title="ai.image.generate" />
  </DocsArticle>
)

export default ImageGenerate
