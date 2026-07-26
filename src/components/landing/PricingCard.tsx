import { Link } from "react-router-dom"
import { IoCheckmarkOutline } from "react-icons/io5"

interface PricingCardProps {
    name: string
    price: string
    priceNote?: string
    description: string
    features: string[]
    cta: string
    ctaHref: string
    highlighted?: boolean
}

const PricingCard = ({
    name,
    price,
    priceNote,
    description,
    features,
    cta,
    ctaHref,
    highlighted = false,
}: PricingCardProps) => {
    const isExternal = ctaHref.startsWith("http") || ctaHref.startsWith("mailto")

    return (
        <div
            className={`
                landing-card flex h-full flex-col gap-6 rounded-xl border px-8 py-10
                ${highlighted ? "border-white bg-[#191919]" : "border-[#333] bg-[#141414]"}
            `}
        >
            <div className="flex flex-col gap-2">
                <h3 className="text-xl font-semibold">{name}</h3>
                <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">{price}</span>
                    {priceNote && <span className="text-[#aaa]">{priceNote}</span>}
                </div>
                <p className="text-[#aaa]">{description}</p>
            </div>

            <ul className="flex flex-col gap-3 flex-1">
                {features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-[#ccc]">
                        <IoCheckmarkOutline className="mt-1 shrink-0" size={16} />
                        <span>{feature}</span>
                    </li>
                ))}
            </ul>

            {isExternal ? (
                <a
                    href={ctaHref}
                    className="bg-white text-accent text-center font-semibold px-4 py-3 rounded-lg hover:brightness-95 transition"
                >
                    {cta}
                </a>
            ) : (
                <Link
                    to={ctaHref}
                    className="bg-white text-accent text-center font-semibold px-4 py-3 rounded-lg hover:brightness-95 transition"
                >
                    {cta}
                </Link>
            )}
        </div>
    )
}

export default PricingCard
