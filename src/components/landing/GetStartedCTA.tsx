import { Link } from "react-router-dom"
import Reveal from "./Reveal"

const GetStartedCTA = () => {
    return (
        <section className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden py-20 md:py-28">
            <div
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,#2a2a2a_0%,#111111_55%,#0a0a0a_100%)]"
                aria-hidden
            />
            <div
                className="pointer-events-none absolute inset-0 opacity-40 animate-[cta-drift_12s_ease-in-out_infinite_alternate]"
                style={{
                    background:
                        "radial-gradient(circle at 20% 40%, rgba(255,255,255,0.08), transparent 45%), radial-gradient(circle at 80% 60%, rgba(255,255,255,0.06), transparent 40%)",
                }}
                aria-hidden
            />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-[#444] to-transparent" aria-hidden />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-[#444] to-transparent" aria-hidden />

            <Reveal className="relative mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 text-center md:px-10 lg:px-20">
                <h2 className="text-4xl font-black leading-[1.3] bg-accent-gradient-lg w-fit bg-clip-text text-transparent md:text-5xl">
                    Ready to get started?
                </h2>
                <p className="max-w-2xl text-base text-[#ccc] md:text-lg">
                    Create a free account in minutes and start routing AI requests through one SDK.
                    Upgrade anytime as your usage grows.
                </p>
                <Link
                    to="/signup"
                    className="mt-4 rounded-lg bg-white px-8 py-3 font-semibold text-accent transition hover:brightness-95 hover:scale-[1.02] active:scale-[0.98]"
                >
                    Sign Up
                </Link>
            </Reveal>
        </section>
    )
}

export default GetStartedCTA
