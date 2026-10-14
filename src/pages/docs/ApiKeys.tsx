import { Link } from "react-router-dom"
import DocsArticle from "../../components/docs/DocsArticle"
import {
  Callout,
  H2,
  InlineCode,
  Ol,
  P,
  Ul,
} from "../../components/docs/DocsPrimitives"

const ApiKeysPage = () => (
  <DocsArticle
    slug="api-keys"
    title="API Keys"
    description="Project API keys unlock the API. Create them in the dashboard and treat the secret as a password."
  >
    <H2>Create a key</H2>
    <Ol>
      <li>Open a project in the dashboard.</li>
      <li>
        Go to <strong className="text-white">API Keys</strong> and create a key with a name
        (for example <InlineCode>Production</InlineCode>).
      </li>
      <li>
        Copy the secret immediately. It is shown <strong className="text-white">once</strong> on
        create and cannot be recovered later.
      </li>
    </Ol>
    <P>
      Keys start with <InlineCode>ain_</InlineCode>. After creation, the dashboard only shows a
      short prefix so you can tell keys apart.
    </P>

    <H2>Use the key</H2>
    <P>Send it on every API request:</P>
    <P>
      <InlineCode>Authorization: Bearer ain_…</InlineCode>
    </P>
    <P>
      See{" "}
      <Link
        to="/docs/authentication"
        className="text-white underline underline-offset-2 hover:text-[#ddd]"
      >
        Authentication
      </Link>{" "}
      for details.
    </P>

    <H2>Permissions and expiry</H2>
    <P>
      New keys start with no permissions. Grant a whole category (for example{" "}
      <InlineCode>text</InlineCode>, which covers chat and streaming) or single features such as{" "}
      <InlineCode>text.chat</InlineCode> or <InlineCode>image.generate</InlineCode>. A key calling
      an endpoint it isn't allowed to use gets <InlineCode>403 API_KEY_SCOPE_DENIED</InlineCode>.
      You can change an active key's permissions from the dashboard at any time; the change
      applies on its next request.
    </P>
    <P>
      An expiry date is optional and must be in the future. It is fixed at creation. To change
      it, create a new key and revoke the old one.
    </P>

    <H2>Revoke or delete</H2>
    <Ul>
      <li>
        <strong className="text-white">Revoke</strong> disables the key so it can no longer be
        used.
      </li>
      <li>
        <strong className="text-white">Delete</strong> removes the key from the project.
      </li>
    </Ul>
    <P>
      To rotate, create a new key, update your servers, then revoke the old one.
    </P>

    <Callout title="Security" variant="warning">
      Store keys in a secrets manager or environment variables. Never put{" "}
      <InlineCode>ain_</InlineCode> keys in browser apps, mobile apps, or public repos. Prefer a
      backend that holds the key — see{" "}
      <Link
        to="/docs/sdk/browser"
        className="text-white underline underline-offset-2 hover:text-[#ddd]"
      >
        Browser usage
      </Link>
      . Direct browser calls also require an allowed app URL under project settings.
    </Callout>
  </DocsArticle>
)

export default ApiKeysPage
