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

const headerExample = `Authorization: Bearer ain_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

const Authentication = () => (
  <DocsArticle
    slug="authentication"
    title="Authentication"
    description="API requests authenticate with a project API key."
  >
    <H2>API keys</H2>
    <P>
      Every request to the AInvoker API requires a project API key in the Authorization header:
    </P>
    <CodeBlock code={headerExample} language="http" title="Header" />
    <Ul>
      <li>
        Keys always start with <InlineCode>ain_</InlineCode>.
      </li>
      <li>Send the full key as a Bearer token on every request.</li>
      <li>
        Create and manage keys in the dashboard under your project&apos;s{" "}
        <strong className="text-white">API Keys</strong> page.
      </li>
    </Ul>

    <Callout title="Use your API key with the SDK">
      Pass your project API key via the <InlineCode>apiKey</InlineCode> option when creating an{" "}
      <InlineCode>AInvoker</InlineCode> client. Your dashboard login is only for the website —
      it is not used for API calls.
    </Callout>

    <H2>Common failures</H2>
    <Ul>
      <li>
        Missing or invalid <InlineCode>Authorization</InlineCode> header →{" "}
        <InlineCode>401 UNAUTHORIZED</InlineCode>
      </li>
      <li>
        Key revoked or expired → <InlineCode>401 UNAUTHORIZED</InlineCode>
      </li>
    </Ul>
    <P>
      See{" "}
      <Link
        to="/docs/api-keys"
        className="text-white underline underline-offset-2 hover:text-[#ddd]"
      >
        API Keys
      </Link>{" "}
      for creating and rotating credentials, and{" "}
      <Link to="/docs/errors" className="text-white underline underline-offset-2 hover:text-[#ddd]">
        Errors
      </Link>{" "}
      for the error response format.
    </P>
  </DocsArticle>
)

export default Authentication
