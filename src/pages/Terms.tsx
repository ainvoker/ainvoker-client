import { Link } from "react-router-dom"
import LegalArticle from "../components/legal/LegalArticle"
import { H2, P, Ul } from "../components/docs/DocsPrimitives"
import { routes } from "../utils/navigation"

const linkClass = "text-white underline underline-offset-2 hover:text-[#ddd]"

const Terms = () => (
  <LegalArticle
    title="Terms of Service"
    description="The rules for using AInvoker’s dashboard, API, and related services."
    updated="August 16, 2026"
  >
    <P>
      These Terms of Service (“Terms”) are an agreement between you and AInvoker
      (“AInvoker,” “we,” “us”) for use of ainvoker.com, the dashboard, the HTTP
      API, SDKs, and related services (the “Service”). By creating an account,
      clicking accept, or using the Service, you agree to these Terms and to our{" "}
      <Link to={routes.privacy} className={linkClass}>
        Privacy Policy
      </Link>
      .
    </P>
    <P>
      If you use AInvoker on behalf of an organization, you represent that you
      have authority to bind that organization, and “you” includes that
      organization.
    </P>

    <H2>The Service</H2>
    <P>
      AInvoker is an AI gateway. You send requests through one API (or the
      official SDK) and we route them to third-party model providers such as
      OpenAI and Google. The dashboard lets you manage workspaces, projects, API
      keys, usage, and billing.
    </P>
    <P>
      We may add, change, or discontinue features. Plan quotas, available
      models, and pricing can change; current details are in the dashboard and{" "}
      <Link to={routes.docs} className={linkClass}>
        documentation
      </Link>
      .
    </P>

    <H2>Accounts</H2>
    <Ul>
      <li>
        You must provide accurate information and keep your login credentials
        confidential.
      </li>
      <li>
        You may sign up with email and password, or through Google or GitHub.
      </li>
      <li>
        You are responsible for activity under your account, including API keys
        created in your workspaces.
      </li>
      <li>
        You must be at least 18 years old, or the age of majority in your
        jurisdiction, to create an account.
      </li>
    </Ul>

    <H2>Workspaces, projects, and API keys</H2>
    <Ul>
      <li>
        A Personal workspace is created for you on signup. Extra workspaces
        require a paid plan (Pro or Scale).
      </li>
      <li>
        API keys start with <code className="rounded bg-[#222] px-1.5 py-0.5 text-[0.85em] text-[#e8e8e8]">ain_</code>{" "}
        and are shown in full only once. Treat them as secrets. Do not embed
        them in public client apps or commit them to source control.
      </li>
      <li>
        You are responsible for allowed origins, key rotation, and who you
        invite to a workspace.
      </li>
      <li>
        Workspace owners may delete a non-personal workspace. Deletion cancels
        its subscriptions and removes it from the app. We may retain records as
        described in the Privacy Policy.
      </li>
    </Ul>

    <H2>Acceptable use</H2>
    <P>You may not:</P>
    <Ul>
      <li>
        Use the Service to violate law, infringe others’ rights, or generate
        illegal, exploitative, or harmful content.
      </li>
      <li>
        Probe, disrupt, or overload the Service, or attempt unauthorized access.
      </li>
      <li>
        Resell raw access to the Service except as an application you build on
        top of it.
      </li>
      <li>
        Circumvent plan limits, abuse free-tier quotas, or share a single
        Personal Free workspace as a substitute for paid seats.
      </li>
      <li>
        Submit prompts or data you do not have the right to process, or that
        you are not allowed to send to third-party AI providers.
      </li>
    </Ul>
    <P>
      You must also follow the acceptable-use and content policies of the
      upstream providers whose models you call.
    </P>

    <H2>Third-party AI providers</H2>
    <P>
      When you send a request, AInvoker forwards prompts and related payload
      data to the selected provider so the model can run. Those providers
      process that data under their own terms. We do not control their models,
      uptime, or output quality. You are responsible for reviewing outputs
      before relying on them.
    </P>

    <H2>Plans and billing</H2>
    <Ul>
      <li>
        <strong className="text-white">Free</strong> applies to your Personal
        workspace only: 300 requests and 50,000 tokens per calendar month (UTC),
        limited to free-eligible models. Extra organizations cannot run on Free.
      </li>
      <li>
        <strong className="text-white">Pro</strong> is ₱1,099 per month per
        workspace, billed through Xendit. It auto-renews each month until you
        cancel. When you cancel, future charges stop and you keep Pro until the
        end of the paid period.
      </li>
      <li>
        <strong className="text-white">Scale</strong> is usage-based and
        arranged with us separately.
      </li>
      <li>
        Billing and usage are tracked per organization. Hitting a monthly cap
        returns a rate-limit error until the next period or an upgrade.
      </li>
      <li>
        The current billing period is generally non-refundable once started,
        except where required by law or where we agree otherwise in writing.
      </li>
    </Ul>

    <H2>Availability and limits</H2>
    <P>
      The Service is provided as-is. We do not guarantee uninterrupted uptime,
      specific latency, or that a given model will remain in the catalog. We
      may throttle, suspend, or refuse requests that threaten the Service or
      violate these Terms.
    </P>

    <H2>Intellectual property</H2>
    <P>
      AInvoker and its branding, dashboard, and documentation remain our
      property. You retain rights in the prompts, code, and content you submit,
      subject to the licenses needed for us (and upstream providers) to process
      requests. Subject to these Terms, we grant you a limited, non-exclusive,
      non-transferable license to use the Service.
    </P>

    <H2>Disclaimers</H2>
    <P>
      The Service and model outputs are provided “as is” and “as available,”
      without warranties of any kind, including merchantability, fitness for a
      particular purpose, non-infringement, or accuracy of generated content.
      AI outputs can be wrong, biased, or unsafe. Do not use them as the sole
      basis for decisions with legal, medical, financial, or safety
      consequences without independent review.
    </P>

    <H2>Limitation of liability</H2>
    <P>
      To the maximum extent permitted by law, AInvoker and its suppliers are
      not liable for indirect, incidental, special, consequential, or punitive
      damages, or for lost profits, data, or goodwill. Our total liability for
      claims arising from the Service is limited to the amounts you paid us for
      the Service in the three months before the claim (or ₱0 if you are on
      Free).
    </P>

    <H2>Termination</H2>
    <P>
      You may stop using the Service at any time. We may suspend or terminate
      access if you breach these Terms, if required by law, or if we discontinue
      the Service. After termination, API keys stop working. Sections that by
      nature should survive (including billing already incurred, IP,
      disclaimers, and liability limits) remain in effect.
    </P>

    <H2>Changes</H2>
    <P>
      We may update these Terms. The “Last updated” date will change, and
      continued use after the update constitutes acceptance. If a change is
      material, we will try to provide reasonable notice through the Service or
      email.
    </P>

    <H2>Governing law</H2>
    <P>
      These Terms are governed by the laws of the Republic of the Philippines,
      without regard to conflict-of-law rules. Courts located in the
      Philippines have exclusive jurisdiction, except where applicable consumer
      law says otherwise.
    </P>

    <H2>Contact</H2>
    <P>
      Questions about these Terms:{" "}
      <a href="mailto:support-ainvoker@ainvoker.com" className={linkClass}>
        support-ainvoker@ainvoker.com
      </a>
      .
    </P>
  </LegalArticle>
)

export default Terms
