import Features from "../components/landing/Features"
import Hero from "../components/landing/Hero"
import Services from "../components/landing/Services"
import GetStartedCTA from "../components/landing/GetStartedCTA"
import Pricing from "../components/landing/Pricing"
import Contact from "../components/landing/Contact"
import Footer from "../components/landing/Footer"

const Landing = () => {
  return (
    <div className="bg-accent text-white min-h-screen overflow-x-hidden">
      <div className="flex flex-col px-4 max-w-6xl mx-auto md:px-10 lg:px-20">
        <Hero />
        <Services />
        <Features />
        <GetStartedCTA />
        <Pricing />
        <Contact />
        <Footer />
      </div>
    </div>
  )
}

export default Landing
