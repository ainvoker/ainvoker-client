import type { IconType } from "react-icons";

interface CardProps {
    Icon: IconType;
    title: string;
    description: string;
}

const Card = ({ Icon, title, description }: CardProps) => {
  return (
    <div className="landing-card h-full bg-[#191919] px-8 py-12 rounded-lg shadow shadow-[#232323] flex flex-col gap-2">
      <Icon size={35} className="mb-4"/>
      <p className="text-xl font-semibold">{title}</p>
      <p className="text-lg">{description}</p>
    </div>
  )
}

export default Card
