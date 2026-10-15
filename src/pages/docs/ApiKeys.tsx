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

    <H2>Server and browser keys</H2>
    <P>
      Every key is created for one kind of client. You pick it when creating the key, and it
      cannot be changed later.
    </P>
    <Ul>
      <li>
        <strong className="text-white">Server</strong> (default): for your backend or the Node
        SDK. Any request that carries an <InlineCode>Origin</InlineCode> header, which browsers
        always send, is rejected with <InlineCode>403 ORIGIN_NOT_ALLOWED</InlineCode>.
      </li>
      <li>
        <strong className="text-white">Browser</strong>: for direct calls from a web app. The
        request must come from one of the project's allowed app URLs. A missing{" "}
        <InlineCode>Origin</InlineCode> returns <InlineCode>403 ORIGIN_REQUIRED</InlineCode>; an
        unlisted one returns <InlineCode>403 ORIGIN_NOT_ALLOWED</InlineCode>. Add at least one
        allowed app URL before creating a browser key.
      </li>
    </Ul>
    <Callout title="Browser keys are public" variant="warning">
      A browser key ships in your frontend, so anyone can read it. The origin check stops other
      websites from using it, but a script outside a browser can fake the{" "}
      <InlineCode>Origin</InlineCode> header. Give browser keys only the permissions they need,
      set an expiry, and keep anything sensitive behind a server key.
    </Callout>

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
      Store server keys in a secrets manager or environment variables. Never put server keys
      in browser apps, mobile apps, or public repos. Prefer a backend that holds the key — see{" "}
      <Link
        to="/docs/sdk/browser"
        className="text-white underline underline-offset-2 hover:text-[#ddd]"
      >
        Browser usage
      </Link>
      . If you must call the API directly from a browser, use a browser key.
    </Callout>
  </DocsArticle>
)

export default ApiKeysPage
