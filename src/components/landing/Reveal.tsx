import { useEffect, useRef, useState, type ReactNode } from "react"

type RevealProps = {
    children: ReactNode
    className?: string
    /** Delay in ms before the reveal starts once in view */
    delay?: number
    /** Animation variant */
    variant?: "up" | "fade" | "left" | "right"
    /** Only animate once (default true) */
    once?: boolean
}

const Reveal = ({
    children,
    className = "",
    delay = 0,
    variant = "up",
    once = true,
}: RevealProps) => {
    const ref = useRef<HTMLDivElement>(null)
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const el = ref.current
        if (!el) return

        const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
        if (prefersReduced) {
            setVisible(true)
            return
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true)
                    if (once) observer.unobserve(el)
                } else if (!once) {
                    setVisible(false)
                }
            },
            { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
        )

        observer.observe(el)
        return () => observer.disconnect()
    }, [once])

    return (
        <div
            ref={ref}
            className={`reveal reveal-${variant} ${visible ? "reveal-visible" : ""} ${className}`}
            style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}
        >
            {children}
        </div>
    )
}

export default Reveal
