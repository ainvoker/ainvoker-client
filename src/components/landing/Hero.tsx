import Nav from './Nav'
import Header from './Header'
import CTA from './CTA'

const Hero = () => {
  return (
    <section className="flex flex-col w-full aspect-video">
      <Nav />
      <Header />
      <CTA />
    </section>
  )
}

export default Hero