import { Link } from "react-router-dom"
import services from "../../bin/services-md.json"
import CodeSnippet from "./CodeSnippet"
import Reveal from "./Reveal"
import { GoArrowRight } from "react-icons/go"

const Services = () => {
  return (
    <section id="features" className="py-25 scroll-mt-8">
        <Reveal className="flex flex-col items-center gap-2 mb-20 text-center">
            <h2 className="text-4xl font-black bg-accent-gradient-lg w-fit bg-clip-text text-transparent leading-[1.3]">
                What Ainvoker Can Do
            </h2>
            <p className="text-lg text-[#ccc]">
                One SDK. Every provider. Every capability.
            </p>
        </Reveal>
        <div className="flex flex-col gap-16">
        {
            services?.map((service, i) => (
                <Reveal
                    key={service.id}
                    variant={i % 2 === 0 ? "left" : "right"}
                    className={`flex flex-col ${i % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"} gap-8 lg:gap-12 items-center`}
                >
                    <div className="flex-1 flex flex-col gap-3">
                        <h2 className="text-2xl font-bold">{service?.title}</h2>
                        <p className="text-lg text-[#ccc] leading-relaxed">{service?.description}</p>
                    </div>
                    <CodeSnippet language={service.language} codes={service.codes} className="flex-1 w-full" />
                </Reveal>
            ))
        }
        </div>
        <Reveal className="flex justify-center pt-12" delay={100}>
            <Link to="/docs" className="flex items-center gap-2 text-[#ccc] hover:text-white hover:underline transition">
                Explore the documentation
                <GoArrowRight size={15}/>
            </Link>
        </Reveal>
    </section>
  )
}

export default Services
