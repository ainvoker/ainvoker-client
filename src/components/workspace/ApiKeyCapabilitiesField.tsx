import Checkbox from "../common/Checkbox"
import {
  ALL_API_KEY_FEATURES,
  API_KEY_PERMISSION_CATEGORIES,
} from "../../utils/apiKeyCapabilities"

type ApiKeyCapabilitiesFieldProps = {
  /** Selected feature ids, e.g. `text.chat`. */
  value: string[]
  onChange: (features: string[]) => void
  disabled?: boolean
}

const ApiKeyCapabilitiesField = ({ value, onChange, disabled }: ApiKeyCapabilitiesFieldProps) => {
  const selected = new Set(value)
  const allSelected = ALL_API_KEY_FEATURES.every((id) => selected.has(id))

  const setFeatures = (ids: string[], on: boolean) => {
    const next = new Set(selected)
    for (const id of ids) {
      if (on) next.add(id)
      else next.delete(id)
    }
    onChange(ALL_API_KEY_FEATURES.filter((id) => next.has(id)))
  }

  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-700">
      <div className="flex items-center justify-between gap-3 border-b border-neutral-200 bg-neutral-50 px-4 py-3 dark:border-neutral-700 dark:bg-neutral-800/60">
        <Checkbox
          checked={allSelected}
          indeterminate={!allSelected && value.length > 0}
          onChange={(on) => setFeatures(ALL_API_KEY_FEATURES, on)}
          label="Allow all permissions"
          description="Includes categories and features added later."
          disabled={disabled}
        />
      </div>

      <div className="max-h-72 divide-y divide-neutral-100 overflow-y-auto dark:divide-neutral-800">
        {API_KEY_PERMISSION_CATEGORIES.map((category) => {
          const ids = category.features.map((feature) => feature.id)
          const count = ids.filter((id) => selected.has(id)).length
          const full = count === ids.length

          return (
            <div key={category.id} className="px-4 py-3">
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={full}
                  indeterminate={count > 0 && !full}
                  onChange={(on) => setFeatures(ids, on)}
                  label={category.label}
                  disabled={disabled}
                />
                <span className="mt-0.5 shrink-0 text-xs text-neutral-400 tabular-nums">
                  {count}/{ids.length}
                </span>
              </div>
              <div className="mt-2 ml-[9px] flex flex-col gap-2 border-l border-neutral-200 pl-5 dark:border-neutral-700">
                {category.features.map((feature) => (
                  <Checkbox
                    key={feature.id}
                    checked={selected.has(feature.id)}
                    onChange={(on) => setFeatures([feature.id], on)}
                    label={feature.label}
                    description={<span className="font-mono">{feature.description}</span>}
                    disabled={disabled}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ApiKeyCapabilitiesField
