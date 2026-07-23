import React from 'react'
import Card from './Card'
import { GoKey } from "react-icons/go";
import { VscGraphLine } from "react-icons/vsc";
import { IoShieldOutline } from "react-icons/io5";
import { IoCode } from "react-icons/io5";
import { AiOutlineThunderbolt } from "react-icons/ai";
import { GrUserAdmin } from "react-icons/gr";

const features = [
    {
        id: 0,
        icon: GoKey,
        title: "API Key Management",
        description: "Generate, rotate, and revoke API keys with granular permission controls."
    },
    {
        id: 1,
        icon: VscGraphLine,
        title: "Usage Analytics",
        description: "Real-time monitoring of API usage, costs, and performance metrics."
    },
    {
        id: 2,
        icon: IoShieldOutline,
        title: "Enterprise Security",
        description: "Role-based access control, rate limiting, and comprehensive audit logs."
    },
    {
        id: 3,
        icon: IoCode,
        title: "Multi-Provider Support",
        description: "Seamless integration with OpenAI, Google, Microsoft, and more."
    },
    {
        id: 4,
        icon: AiOutlineThunderbolt,
        title: "High Performance",
        description: "Optimized routing and caching for minimal latency and maximum throughput."
    },
    {
        id: 5,
        icon: GrUserAdmin,
        title: "Admin Controls",
        description: "Comprehensive admin panel for user management and system configuration."
    }
]

const Features = () => {
    return (
        <div className='py-25'>
            <div className='grid grid-cols-3 gap-16'>
                {
                    features.map(feature => (
                        <Card key={feature.id} title={feature.title} description={feature.description} Icon={feature.icon} />
                    ))
                }
            </div>
        </div>
    )
}

export default Features
