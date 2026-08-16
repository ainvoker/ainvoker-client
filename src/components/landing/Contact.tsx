import { useState, type FormEvent } from "react"
import { IoMailOutline, IoCallOutline } from "react-icons/io5"
import Reveal from "./Reveal"

const Contact = () => {
    const [submitted, setSubmitted] = useState(false)

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const form = e.currentTarget
        const data = new FormData(form)
        const firstName = data.get("firstName") as string
        const lastName = data.get("lastName") as string
        const email = data.get("email") as string
        const message = data.get("message") as string

        const subject = encodeURIComponent(`Contact from ${firstName} ${lastName}`)
        const body = encodeURIComponent(`${message}\n\n— ${firstName} ${lastName} (${email})`)
        window.location.href = `mailto:support-ainvoker@ainvoker.com?subject=${subject}&body=${body}`
        setSubmitted(true)
    }

    return (
        <section id="contact" className="py-25 scroll-mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                <Reveal variant="left" className="flex flex-col gap-6">
                    <h2 className="text-4xl font-black bg-accent-gradient-lg w-fit bg-clip-text text-transparent leading-[1.3]">
                        Get in touch
                    </h2>
                    <p className="text-lg text-[#ccc] leading-relaxed">
                        Have questions about AInvoker? Our team is here to help you get the most out of
                        your AI infrastructure. Reach out and we&apos;ll get back to you within one business day.
                    </p>
                    <div className="flex flex-col gap-4 mt-2">
                        <a
                            href="mailto:support-ainvoker@ainvoker.com"
                            className="flex items-center gap-3 text-[#ccc] hover:text-white transition"
                        >
                            <IoMailOutline size={20} />
                            support-ainvoker@ainvoker.com
                        </a>
                        <a
                            href="tel:+639123456789"
                            className="flex items-center gap-3 text-[#ccc] hover:text-white transition"
                        >
                            <IoCallOutline size={20} />
                            +63 912 345 6789
                        </a>
                    </div>
                </Reveal>

                <Reveal variant="right" delay={120}>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <input
                                name="firstName"
                                required
                                placeholder="First Name"
                                className="bg-[#191919] border border-[#333] rounded-lg px-4 py-3 text-white placeholder:text-[#666] focus:outline-none focus:border-[#555] transition-colors"
                            />
                            <input
                                name="lastName"
                                required
                                placeholder="Last Name"
                                className="bg-[#191919] border border-[#333] rounded-lg px-4 py-3 text-white placeholder:text-[#666] focus:outline-none focus:border-[#555] transition-colors"
                            />
                        </div>
                        <input
                            name="email"
                            type="email"
                            required
                            placeholder="Email"
                            className="bg-[#191919] border border-[#333] rounded-lg px-4 py-3 text-white placeholder:text-[#666] focus:outline-none focus:border-[#555] transition-colors"
                        />
                        <textarea
                            name="message"
                            required
                            rows={5}
                            placeholder="How can we help you?"
                            className="bg-[#191919] border border-[#333] rounded-lg px-4 py-3 text-white placeholder:text-[#666] focus:outline-none focus:border-[#555] resize-none transition-colors"
                        />
                        <button
                            type="submit"
                            className="self-end bg-white text-accent font-semibold px-6 py-3 rounded-lg hover:brightness-95 hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer"
                        >
                            {submitted ? "Opening email client…" : "Send Message"}
                        </button>
                    </form>
                </Reveal>
            </div>
        </section>
    )
}

export default Contact
