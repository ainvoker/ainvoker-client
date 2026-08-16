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

const Limits = () => (
  <DocsArticle
    slug="limits"
    title="Limits"
    description="Monthly request and token quotas apply per workspace plan."
  >
    <H2>How limits work</H2>
    <P>
      Usage is tracked per organization for the current calendar month (UTC). When you hit a
      monthly cap, the API returns <InlineCode>429 RATE_LIMIT_EXCEEDED</InlineCode>.
    </P>
    <P>
      Successful responses can also include <InlineCode>X-RateLimit-*</InlineCode> headers with
      your remaining quota — see{" "}
      <Link
        to="/docs/text-chat"
        className="text-white underline underline-offset-2 hover:text-[#ddd]"
      >
        Text Chat
      </Link>
      .
    </P>

    <H2>Plan quotas</H2>
    <DocsTable
      headers={["Plan", "Requests / month", "Tokens / month", "Models"]}
      rows={[
        ["Free", "300", "50,000", "Free-tier models only"],
        ["Pro", "5,000", "2,000,000", "All models"],
        ["Scale", "Custom / metered", "Custom / metered", "All models"],
      ]}
    />
    <Ul>
      <li>
        Free is for your Personal workspace. Extra workspaces need Pro or Scale.
      </li>
      <li>Billing and usage are per organization.</li>
      <li>
        Scale is usage-based —{" "}
        <a
          href="mailto:support-ainvoker@ainvoker.com?subject=AInvoker%20Scale%20Plan"
          className="text-white underline underline-offset-2 hover:text-[#ddd]"
        >
          contact sales
        </a>{" "}
        for details.
      </li>
    </Ul>

    <H2>Related errors</H2>
    <DocsTable
      headers={["HTTP", "Code", "When"]}
      rows={[
        [
          "402",
          <InlineCode>SUBSCRIPTION_REQUIRED</InlineCode>,
          "Your workspace has no active plan",
        ],
        [
          "403",
          <InlineCode>MODEL_NOT_ALLOWED_ON_PLAN</InlineCode>,
          "Model not available on your plan",
        ],
        [
          "429",
          <InlineCode>RATE_LIMIT_EXCEEDED</InlineCode>,
          "Monthly request or token limit reached",
        ],
      ]}
    />
    <Callout title="About the header names">
      Despite the <InlineCode>X-RateLimit-*</InlineCode> names, these headers describe monthly
      quota remaining — not requests-per-minute throttling.
    </Callout>
  </DocsArticle>
)

export default Limits
