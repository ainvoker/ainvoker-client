import Features from "../components/landing/Features"
import Hero from "../components/landing/Hero"
import Services from "../components/landing/Services"

const Landing = () => {
  return (
    <div className="bg-accent text-white min-h-screen flex justify-center">
      <div className="flex flex-col px-4 max-w-450 md:px-10 lg:px-20">
        <Hero />
        <Services />
        <Features />
      </div>
    </div>
  )
}

export default Landing