import Card from './Card'
import Reveal from './Reveal'
import { GoKey } from "react-icons/go"
import { VscGraphLine } from "react-icons/vsc"
import { IoShieldOutline } from "react-icons/io5"
import { IoCode } from "react-icons/io5"
import { AiOutlineThunderbolt } from "react-icons/ai"
import { GrUserAdmin } from "react-icons/gr"

const features = [
    {
        id: 0,
        icon: GoKey,
        title: "API Key Management",
        description: "Centralize, rotate, and secure all your API keys in one place."
    },
    {
        id: 1,
        icon: VscGraphLine,
        title: "Usage Analytics",
        description: "Real-time monitoring of usage, costs, and performance metrics."
    },
    {
        id: 2,
        icon: IoShieldOutline,
        title: "Enterprise Security",
        description: "Role-based access controls and comprehensive audit logs."
    },
    {
        id: 3,
        icon: IoCode,
        title: "Multi-Provider Support",
        description: "Seamlessly switch between agents through different providers."
    },
    {
        id: 4,
        icon: AiOutlineThunderbolt,
        title: "High Performance",
        description: "Optimized routing for minimum latency and maximum throughput."
    },
    {
        id: 5,
        icon: GrUserAdmin,
        title: "Admin Controls",
        description: "Comprehensive controls for managing your organization's AI infrastructure."
    }
]

const Features = () => {
    return (
        <section className="py-25">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {
                    features.map((feature, i) => (
                        <Reveal key={feature.id} delay={i * 80} className="h-full">
                            <Card title={feature.title} description={feature.description} Icon={feature.icon} />
                        </Reveal>
                    ))
                }
            </div>
        </section>
    )
}

export default Features
