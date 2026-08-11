import PricingCard from "./PricingCard"
import Reveal from "./Reveal"

const plans = [
    {
        name: "Free",
        price: "$0",
        description: "Personal workspace only — enough to try the gateway.",
        features: [
            "Personal workspace only (Free cannot be used on extra orgs)",
            "50k tokens / 300 requests per month",
            "Cheap models only (freeEligible)",
            "Hard stop at monthly caps",
        ],
        cta: "Get Started",
        ctaHref: "/signup",
    },
    {
        name: "Pro",
        price: "$19",
        priceNote: "/ month",
        description: "Fixed monthly plan with included limits per organization.",
        features: [
            "Unlimited additional orgs (each on its own plan)",
            "2M tokens / 5k requests per org per month",
            "All catalog models",
            "Hard stop at cap (no overage)",
        ],
        cta: "Get Started",
        ctaHref: "/signup",
        highlighted: true,
    },
    {
        name: "Scale",
        price: "Custom",
        priceNote: " · metered",
        description: "Metered pricing for teams that need headroom.",
        features: [
            "Unlimited additional orgs (each on its own plan)",
            "Usage-based / contact sales",
            "All catalog models",
            "Optional safety ceilings when configured",
        ],
        cta: "Contact Sales",
        ctaHref: "mailto:support-ainvoker@ainvoker.com?subject=Ainvoker%20Scale%20Plan",
    },
]

const Pricing = () => {
    return (
        <section id="pricing" className="py-25 scroll-mt-8">
            <Reveal className="flex flex-col items-center gap-2 mb-16 text-center">
                <h2 className="text-4xl font-black bg-accent-gradient-lg w-fit bg-clip-text text-transparent leading-[1.3]">
                    Plans and Pricing
                </h2>
                <p className="text-lg text-[#ccc]">
                    Billing is per organization. Free stays on Personal; extra
                    workspaces require Pro or Scale.
                </p>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
                {plans.map((plan, i) => (
                    <Reveal key={plan.name} delay={i * 100} className="h-full">
                        <PricingCard {...plan} />
                    </Reveal>
                ))}
            </div>
        </section>
    )
}

export default Pricing
