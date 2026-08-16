import {
  HiOutlineComputerDesktop,
  HiOutlineMoon,
  HiOutlineSun,
} from "react-icons/hi2"
import { useTheme } from "../../contexts/ThemeContext"
import type { ThemePreference } from "../../services/UserService"

const themeOptions: {
  value: ThemePreference
  label: string
  icon: typeof HiOutlineSun
}[] = [
  { value: "DEVICE", label: "Device", icon: HiOutlineComputerDesktop },
  { value: "LIGHT", label: "Light", icon: HiOutlineSun },
  { value: "DARK", label: "Dark", icon: HiOutlineMoon },
]

type ThemeToggleProps = {
  /** Icon-only compact control (profile menu). Default shows labels. */
  compact?: boolean
  className?: string
}

const ThemeToggle = ({ compact = false, className }: ThemeToggleProps) => {
  const { themePreference, setThemePreference, isSaving } = useTheme()

  return (
    <div
      className={[
        "inline-flex rounded-lg border border-neutral-200 bg-neutral-50 p-0.5 dark:border-neutral-700 dark:bg-neutral-800",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      role="group"
      aria-label="Theme preference"
    >
      {themeOptions.map(({ value, label, icon: Icon }) => {
        const selected = themePreference === value
        return (
          <button
            key={value}
            type="button"
            disabled={isSaving}
            aria-label={label}
            aria-pressed={selected}
            title={label}
            onClick={() => void setThemePreference(value)}
            className={[
              "rounded-md transition-colors disabled:opacity-60",
              compact
                ? "grid size-8 place-content-center"
                : "inline-flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium",
              selected
                ? "bg-white text-accent shadow-sm dark:bg-neutral-950 dark:text-neutral-100"
                : compact
                  ? "text-neutral-400 hover:text-accent dark:hover:text-neutral-100"
                  : "text-neutral-500 hover:text-accent dark:text-neutral-400 dark:hover:text-neutral-100",
            ].join(" ")}
          >
            <Icon className="size-4" aria-hidden />
            {compact ? null : <span>{label}</span>}
          </button>
        )
      })}
    </div>
  )
}

export default ThemeToggle
