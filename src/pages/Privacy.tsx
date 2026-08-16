import { Link } from "react-router-dom"
import LegalArticle from "../components/legal/LegalArticle"
import { H2, P, Ul } from "../components/docs/DocsPrimitives"
import { routes } from "../utils/navigation"

const linkClass = "text-white underline underline-offset-2 hover:text-[#ddd]"

const Privacy = () => (
  <LegalArticle
    title="Privacy Policy"
    description="How AInvoker collects, uses, and shares information when you use the dashboard and API."
    updated="August 16, 2026"
  >
    <P>
      This Privacy Policy explains how AInvoker (“AInvoker,” “we,” “us”) handles
      personal data when you visit ainvoker.com, create an account, or call the
      API. It should be read with our{" "}
      <Link to={routes.terms} className={linkClass}>
        Terms of Service
      </Link>
      .
    </P>

    <H2>Who we are</H2>
    <P>
      AInvoker operates an AI gateway and control-plane dashboard. For privacy
      questions, email{" "}
      <a href="mailto:support-ainvoker@ainvoker.com" className={linkClass}>
        support-ainvoker@ainvoker.com
      </a>
      .
    </P>

    <H2>Information we collect</H2>
    <Ul>
      <li>
        <strong className="text-white">Account data.</strong> Name, email,
        password hash (if you sign up with email), profile picture, and theme
        preference. If you continue with Google or GitHub, we receive the
        identifier, name, email, and avatar those providers share with us.
      </li>
      <li>
        <strong className="text-white">Workspace data.</strong> Organization
        and project names, slugs, membership and roles, allowed origins, and
        API key metadata (name, prefix, status). We store a hash of each API
        key, not the full secret after it is shown once.
      </li>
      <li>
        <strong className="text-white">Usage and logs.</strong> API requests
        made through AInvoker, including timestamps, model, status, token
        counts, and request/response payloads needed to operate the gateway and
        show logs in the dashboard.
      </li>
      <li>
        <strong className="text-white">Billing data.</strong> Plan, subscription
        status, invoice and payment events, and a display snapshot of the saved
        payment method (type, brand, and last four digits when available). Full
        card and e-wallet numbers are collected and processed by Xendit; we do
        not store full payment-instrument numbers.
      </li>
      <li>
        <strong className="text-white">Technical data.</strong> IP address,
        browser or SDK user agent, and basic device information needed for
        security, rate limiting, and allowed-origin checks.
      </li>
    </Ul>

    <H2>How we use information</H2>
    <Ul>
      <li>Provide, maintain, and improve the Service.</li>
      <li>Authenticate you, enforce plan limits, and prevent abuse.</li>
      <li>Route inference requests to the model providers you select.</li>
      <li>Show usage, logs, invoices, and billing status in the dashboard.</li>
      <li>Send transactional email such as verification and password reset.</li>
      <li>Comply with law and respond to lawful requests.</li>
    </Ul>
    <P>
      We do not sell your personal information. We do not use your prompts to
      train AInvoker’s own foundation models.
    </P>

    <H2>AI requests and third-party providers</H2>
    <P>
      When you call the API, prompt content and related fields are sent to the
      upstream provider for that model (for example OpenAI or Google) so the
      request can be completed. Those providers process the data under their
      own privacy terms. Do not send secrets, regulated health data, or other
      sensitive information unless you have a lawful basis and the provider
      allows it.
    </P>

    <H2>When we share information</H2>
    <Ul>
      <li>
        <strong className="text-white">Model providers</strong> — to fulfill
        API requests you initiate.
      </li>
      <li>
        <strong className="text-white">Payment processor (Xendit)</strong> — to
        complete Pro checkout, save a payment method for recurring charges,
        confirm payment status, and provide invoice or receipt events.
      </li>
      <li>
        <strong className="text-white">Auth providers (Google, GitHub)</strong>{" "}
        — only if you choose to sign in with them.
      </li>
      <li>
        <strong className="text-white">Infrastructure vendors</strong> — hosting
        and operational services that process data on our instructions.
      </li>
      <li>
        <strong className="text-white">Legal and safety</strong> — if required
        by law, to protect the Service, or to prevent harm or fraud.
      </li>
    </Ul>
    <P>
      Workspace members you invite can see workspace resources according to
      their role (projects, keys metadata, logs, billing status).
    </P>

    <H2>Cookies and similar technology</H2>
    <P>
      We use cookies and local storage for authentication, remembering your
      active workspace, and storing your theme preference. These are needed to
      run the dashboard. We do not use third-party advertising cookies.
    </P>

    <H2>Retention</H2>
    <P>
      We keep account and workspace records while your account is active.
      Request logs and usage aggregates are kept as long as needed to operate
      the product, enforce limits, and debug issues, then deleted or
      anonymized. Deleted workspaces are removed from the app; residual records
      may remain in backups for a limited period. Payment and invoice records
      are retained as required for accounting and tax. The saved payment-method
      snapshot is kept until the method is removed or the workspace is deleted.
    </P>

    <H2>Security</H2>
    <P>
      We use encryption in transit, hashed API keys, and access controls on
      workspace data. No method of transmission or storage is perfectly secure.
      You are responsible for protecting API keys and for configuring allowed
      origins if you call the API from a browser.
    </P>

    <H2>Your choices</H2>
    <Ul>
      <li>Update profile and theme settings in the dashboard.</li>
      <li>Revoke or delete API keys at any time.</li>
      <li>Leave or, if you are an owner, delete a non-personal workspace.</li>
      <li>
        Request access, correction, or deletion of personal data by emailing{" "}
        <a href="mailto:support-ainvoker@ainvoker.com" className={linkClass}>
          support-ainvoker@ainvoker.com
        </a>
        . We may need to verify the request and may retain data when the law
        requires it.
      </li>
    </Ul>

    <H2>Children</H2>
    <P>
      The Service is not directed to children under 18. We do not knowingly
      collect personal information from children. If you believe we have, contact
      us and we will delete it.
    </P>

    <H2>International processing</H2>
    <P>
      We and our providers may process data in the Philippines and in other
      countries where our infrastructure or model vendors operate. Those
      countries may have different data-protection laws than your own.
    </P>

    <H2>Changes</H2>
    <P>
      We may update this policy. The “Last updated” date will change. Continued
      use after an update means you accept the revised policy. Material changes
      may also be announced in the product or by email.
    </P>

    <H2>Contact</H2>
    <P>
      Privacy requests:{" "}
      <a href="mailto:support-ainvoker@ainvoker.com" className={linkClass}>
        support-ainvoker@ainvoker.com
      </a>
      .
    </P>
  </LegalArticle>
)

export default Privacy
