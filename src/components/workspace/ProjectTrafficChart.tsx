import { useState } from "react"
import type {
  AnalyticsRange,
  UsageDailyPoint,
  UsageDailySegmentPoint,
} from "../../services/UsageService"
import type { BindingQuota, QuotaResource } from "../../utils/quota"
import { formatCompactNumber, formatTokens } from "../../utils/requests"
import QuotaPaceChart, { type QuotaPaceSeries } from "./QuotaPaceChart"
import SegmentedControl from "./SegmentedControl"

type GroupBy = "total" | "model" | "apiKey"

type ProjectTrafficChartProps = {
  range: AnalyticsRange
  daily: UsageDailyPoint[]
  dailyByModel: UsageDailySegmentPoint[]
  dailyByApiKey: UsageDailySegmentPoint[]
}

const METRIC_OPTIONS: { value: QuotaResource; label: string }[] = [
  { value: "requests", label: "Requests" },
  { value: "tokens", label: "Tokens" },
]

const SERIES_OPTIONS: { value: QuotaPaceSeries; label: string }[] = [
  { value: "daily", label: "Daily" },
  { value: "cumulative", label: "Cumulative" },
]

const GROUP_OPTIONS: { value: GroupBy; label: string }[] = [
  { value: "total", label: "Total" },
  { value: "model", label: "Model" },
  { value: "apiKey", label: "API key" },
]

const ProjectTrafficChart = ({
  range,
  daily,
  dailyByModel,
  dailyByApiKey,
}: ProjectTrafficChartProps) => {
  const [metric, setMetric] = useState<QuotaResource>("requests")
  const [series, setSeries] = useState<QuotaPaceSeries>("daily")
  const [groupBy, setGroupBy] = useState<GroupBy>("total")

  const total = daily.reduce(
    (sum, d) => sum + (metric === "requests" ? d.requestsUsed : d.tokensUsed),
    0,
  )
  const binding: BindingQuota = {
    resource: metric,
    used: total,
    limit: 0,
    remaining: 0,
    percentUsed: 0,
    unlimited: true,
  }

  const breakdown =
    groupBy === "model"
      ? dailyByModel
      : groupBy === "apiKey"
        ? dailyByApiKey
        : undefined

  return (
    <section className="rounded-2xl border border-neutral-200/80 bg-white p-4 md:p-5 dark:border-neutral-700 dark:bg-neutral-900">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-[15px] font-medium text-accent">Traffic</h2>
          <p className="mt-0.5 text-xs tabular-nums text-neutral-400">
            {metric === "requests"
              ? `${formatCompactNumber(total)} requests`
              : `${formatTokens(total)} tokens`}{" "}
            in range
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SegmentedControl
            label="Metric"
            options={METRIC_OPTIONS}
            value={metric}
            onChange={setMetric}
          />
          <SegmentedControl
            label="Chart series"
            options={SERIES_OPTIONS}
            value={series}
            onChange={setSeries}
          />
          <SegmentedControl
            label="Group by"
            options={GROUP_OPTIONS}
            value={groupBy}
            onChange={setGroupBy}
          />
        </div>
      </div>

      <QuotaPaceChart
        daily={daily}
        binding={binding}
        showPaceLine={false}
        windowDays={range === "billing_month" ? undefined : daily.length}
        series={series}
        breakdown={breakdown}
        className="mt-4 -mx-1"
      />
    </section>
  )
}

export default ProjectTrafficChart
