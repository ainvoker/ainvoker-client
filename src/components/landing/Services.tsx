import { Link } from "react-router-dom"
import services from "../../bin/services-md.json"
import CodeSnippet from "./CodeSnippet"
import { GoArrowRight } from "react-icons/go";

const Services = () => {
  return (
    <div className="px">
        <div className="flex flex-col items-center gap-2 mb-20">
            <h2 className="text-4xl font-black bg-accent-gradient-lg w-fit bg-clip-text text-transparent leading-[1.3]">
                What AInvoker Can Do
            </h2>
            <p className="text-lg">
                One SDK. Every provider. Every capability.
            </p>
        </div>
        <div className="flex flex-col gap-12">
        {
            services?.map((service, i) => (
                <div key={service.id} className={`flex ${i % 2 == 0 ? "flex-row" : "flex-row-reverse"} gap-6`}>
                    <div className="flex-5 flex flex-col gap-2">
                        <h2 className="text-lg font-bold">{service?.title}</h2>
                        <p className="text-lg">{service?.description}</p>
                    </div>
                    <CodeSnippet language={service.language} codes={service.codes} className="flex-6" />
                </div>
            ))
        }
        </div>
        <div className="flex justify-center p-6">
            <Link to={'/services'} className="flex items-center gap-2 hover:underline">
                Explore more what AInvoker can do
                <GoArrowRight size={15}/>   
            </Link>
        </div>
    </div>
  )
}

export default Services