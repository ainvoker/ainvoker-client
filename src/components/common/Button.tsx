import React from "react"
import Spinner from "./Spinner"

type ButtonProps = {
  children: React.ReactNode
  type?: "button" | "submit" | "reset"
  disabled?: boolean
  loading?: boolean
  /** Shown next to the spinner while loading; defaults to children. */
  loadingLabel?: React.ReactNode
  onClick?: () => void
  className?: string
}

const Button = ({
  children,
  type = "button",
  disabled = false,
  loading = false,
  loadingLabel,
  onClick,
  className = "",
}: ButtonProps) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`
                bg-accent
                text-white
                dark:text-black
                py-3 px-4
                rounded-lg
                font-medium
                transition
                cursor-pointer
                hover:brightness-95
                disabled:opacity-50
                disabled:cursor-not-allowed
                flex items-center justify-center gap-2
                ${className}
            `}
    >
      {loading ? (
        <>
          <Spinner
            size="sm"
            className="text-white dark:text-black"
          />
          <span>{loadingLabel ?? children}</span>
        </>
      ) : (
        children
      )}
    </button>
  )
}

export default Button
