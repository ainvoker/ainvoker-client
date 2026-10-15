import PricingCard from "./PricingCard"
import Reveal from "./Reveal"

const plans = [
    {
        name: "Free",
        price: "$0",
        description: "Personal workspace only — enough to try the gateway.",
        features: [
            "Personal workspace only (Free cannot be used on extra orgs)",
            "50k lifetime usage units + 300 requests per month",
            "Economy models only",
            "Hard stop at caps",
        ],
        cta: "Get Started",
        ctaHref: "/signup",
    },
    {
        name: "Pro",
        price: "₱499",
        priceNote: "/ month",
        description: "Fixed monthly plan with included usage per organization.",
        features: [
            "Unlimited additional orgs (each on its own plan)",
            "1M usage units per org per month (economy models)",
            "Hard stop at cap (no overage)",
        ],
        cta: "Get Started",
        ctaHref: "/signup",
        highlighted: true,
    },
    {
        name: "Scale",
        price: "₱499",
        priceNote: " wallet advance · metered",
        description: "Pay-as-you-go with a prepaid wallet and saved payment method.",
        features: [
            "Unlimited additional orgs (each on its own plan)",
            "All catalog models (economy + premium)",
            "Usage billed at retail; wallet settles monthly",
            "Top-up refreshes wallet when usage exceeds balance",
        ],
        cta: "Get Started",
        ctaHref: "/signup",
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
