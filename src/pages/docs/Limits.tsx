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
    description="Request and token quotas apply per workspace plan and reset each billing period."
  >
    <H2>How limits work</H2>
    <P>
      Usage is tracked per organization for the current billing period. A period starts when
      your plan starts (for Pro, when payment succeeds) and renews monthly on that date, so
      paying mid-month gives you a full period from that day. When you hit a cap, the API
      returns <InlineCode>429 RATE_LIMIT_EXCEEDED</InlineCode>.
    </P>
    <P>
      Each renewal starts a new period with the full allowance; unused quota does not carry
      over. A workspace awaiting checkout, or whose plan has ended, has no quota until the plan
      is active again. The dashboard can also show usage for the last 7 days, a calendar month,
      or a custom date range — those views do not change your quota.
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
      headers={["Plan", "Requests / period", "Tokens / period", "Models"]}
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
        Image models are Pro and Scale only. Each image counts its tokens toward the same monthly
        token limit, and reserves 8,000 output tokens while it is being generated.
      </li>
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
          "Request or token limit for the billing period reached",
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
