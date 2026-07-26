import PricingCard from "./PricingCard"
import Reveal from "./Reveal"

const plans = [
    {
        name: "Simple",
        price: "Free",
        description: "Free for everyone",
        features: [
            "2,500 requests / month",
            "100,000 tokens / month",
            "10 models supported",
            "1 model provider",
            "2 applications",
            "Basic usage analytics",
        ],
        cta: "Get Started",
        ctaHref: "/signup",
    },
    {
        name: "Prepaid",
        price: "₱179.00",
        priceNote: "/ month",
        description: "Fixed monthly plan with included quota",
        features: [
            "20,000 requests / month",
            "2M tokens / month",
            "50+ models supported",
            "5 model providers",
            "10 applications",
            "Advanced usage analytics",
            "Email support",
        ],
        cta: "Pay Now",
        ctaHref: "/signup",
        highlighted: true,
    },
    {
        name: "Postpaid",
        price: "Custom",
        priceNote: "pricing",
        description: "Pay only for what you use — built for scale",
        features: [
            "Unlimited requests (metered)",
            "All models & providers",
            "Unlimited applications",
            "Full analytics & audit logs",
            "Custom integrations & SLA",
            "Dedicated account support",
        ],
        cta: "Contact Sales",
        ctaHref: "mailto:support-ainvoker@ainvoker.com?subject=Ainvoker%20Postpaid%20Plan",
    },
]

const Pricing = () => {
    return (
        <section id="pricing" className="py-25 scroll-mt-8">
            <Reveal className="flex flex-col items-center gap-2 mb-16 text-center">
                <h2 className="text-4xl font-black bg-accent-gradient-lg w-fit bg-clip-text text-transparent leading-[1.3]">
                    Plans and Pricing
                </h2>
                <p className="text-lg text-[#ccc]">Choose the plan that fits your usage.</p>
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
