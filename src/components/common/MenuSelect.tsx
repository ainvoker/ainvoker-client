import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from "react"
import { HiCheck, HiChevronDown } from "react-icons/hi2"
import { createPortal } from "react-dom"
import { useTheme } from "../../contexts/ThemeContext"

export type MenuSelectOption = {
  value: string
  label: string
  description?: string
  disabled?: boolean
  leading?: ReactNode
}

type MenuSelectProps = {
  value: string
  options: MenuSelectOption[]
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  /** Matches form inputs by default; use compact in tables. */
  size?: "default" | "compact"
  className?: string
  "aria-label"?: string
}

type MenuCoords = {
  top: number
  left: number
  width: number
  openUp: boolean
}

const MenuSelect = ({
  value,
  options,
  onChange,
  placeholder = "Select…",
  disabled = false,
  size = "default",
  className = "",
  "aria-label": ariaLabel,
}: MenuSelectProps) => {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState<MenuCoords | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const listId = useId()

  const selected = options.find((option) => option.value === value) ?? null
  const isCompact = size === "compact"

  const updateCoords = () => {
    const trigger = rootRef.current
    if (!trigger) return
    const rect = trigger.getBoundingClientRect()
    const menuHeight = menuRef.current?.offsetHeight ?? 220
    const spaceBelow = window.innerHeight - rect.bottom
    const openUp = spaceBelow < menuHeight + 12 && rect.top > spaceBelow
    const width = Math.max(rect.width, isCompact ? 144 : 192)

    setCoords({
      top: openUp ? rect.top - 6 : rect.bottom + 6,
      left: Math.min(rect.left, window.innerWidth - width - 8),
      width,
      openUp,
    })
  }

  useLayoutEffect(() => {
    if (!open) {
      setCoords(null)
      return
    }
    updateCoords()
  }, [open, isCompact, options.length])

  useEffect(() => {
    if (!open) return

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node
      if (rootRef.current?.contains(target) || menuRef.current?.contains(target)) {
        return
      }
      setOpen(false)
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }

    const onReposition = () => updateCoords()

    document.addEventListener("mousedown", onPointerDown)
    document.addEventListener("keydown", onKeyDown)
    window.addEventListener("resize", onReposition)
    window.addEventListener("scroll", onReposition, true)
    return () => {
      document.removeEventListener("mousedown", onPointerDown)
      document.removeEventListener("keydown", onKeyDown)
      window.removeEventListener("resize", onReposition)
      window.removeEventListener("scroll", onReposition, true)
    }
  }, [open])

  useEffect(() => {
    if (disabled) setOpen(false)
  }, [disabled])

  const menu = open ? (
    // Theme is scoped to the workspace shell, not <html>. Portal needs its own .dark root.
    <div className={isDark ? "dark" : undefined}>
      <div
        ref={menuRef}
        id={listId}
        role="listbox"
        aria-label={ariaLabel}
        style={
          coords
            ? {
                position: "fixed",
                top: coords.openUp ? undefined : coords.top,
                bottom: coords.openUp
                  ? window.innerHeight - coords.top
                  : undefined,
                left: coords.left,
                width: coords.width,
                zIndex: 80,
              }
            : { position: "fixed", visibility: "hidden", zIndex: 80 }
        }
        className={[
          "overflow-hidden rounded-xl border border-neutral-200 bg-white text-accent",
          "shadow-[0_16px_40px_rgba(0,0,0,0.12)] dark:border-neutral-700 dark:bg-neutral-900",
          "dark:shadow-[0_16px_40px_rgba(0,0,0,0.45)]",
        ].join(" ")}
      >
        <div className="max-h-56 overflow-y-auto py-1">
          {options.map((option) => {
            const active = option.value === value
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={active}
                disabled={option.disabled}
                onClick={() => {
                  if (option.disabled) return
                  onChange(option.value)
                  setOpen(false)
                }}
                className={[
                  "flex w-full cursor-pointer items-center gap-2.5 px-3 py-2 text-left transition-colors",
                  "disabled:cursor-not-allowed disabled:opacity-40",
                  active
                    ? "bg-neutral-100 dark:bg-neutral-800"
                    : "hover:bg-neutral-50 dark:hover:bg-neutral-800/70",
                ].join(" ")}
              >
                {option.leading ? (
                  <span className="shrink-0">{option.leading}</span>
                ) : null}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-medium text-accent">
                    {option.label}
                  </span>
                  {option.description ? (
                    <span className="mt-0.5 block truncate text-[12px] text-neutral-400">
                      {option.description}
                    </span>
                  ) : null}
                </span>
                {active ? (
                  <HiCheck className="size-3.5 shrink-0 text-accent" aria-hidden />
                ) : (
                  <span className="size-3.5 shrink-0" aria-hidden />
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  ) : null

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={ariaLabel}
        onClick={() => setOpen((current) => !current)}
        className={[
          "flex w-full cursor-pointer items-center gap-2 border text-left text-accent outline-none transition-colors",
          "border-neutral-200 bg-white ring-accent/30 hover:border-neutral-300 focus-visible:ring-2",
          "dark:border-neutral-700 dark:bg-neutral-900 dark:hover:border-neutral-600",
          "disabled:cursor-not-allowed disabled:opacity-50",
          isCompact
            ? "rounded-lg px-2.5 py-1.5 text-xs"
            : "rounded-xl px-3 py-2.5 text-sm",
          open ? "border-neutral-300 ring-2 dark:border-neutral-600" : "",
        ].join(" ")}
      >
        {selected?.leading ? (
          <span className="shrink-0">{selected.leading}</span>
        ) : null}
        <span className="min-w-0 flex-1 truncate font-medium">
          {selected?.label ?? (
            <span className="font-normal text-neutral-400">{placeholder}</span>
          )}
        </span>
        <HiChevronDown
          className={[
            "shrink-0 text-neutral-400 transition-transform",
            isCompact ? "size-3.5" : "size-4",
            open ? "rotate-180" : "",
          ].join(" ")}
          aria-hidden
        />
      </button>

      {typeof document !== "undefined" && menu
        ? createPortal(menu, document.body)
        : null}
    </div>
  )
}

export default MenuSelect
