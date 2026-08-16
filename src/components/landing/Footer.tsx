import { Link } from "react-router-dom"
import { FaGithub, FaXTwitter } from "react-icons/fa6"
import Logo from "../../assets/logo.svg"

const navLinks = [
    { label: "Home", to: "/" },
    { label: "Dashboard", to: "/" },
    { label: "Documentation", to: "/docs" },
    { label: "Pricing", to: "#pricing" },
    { label: "Contact", to: "#contact" },
]

const siteLinks = [
    { label: "TOS", to: "/terms" },
    { label: "Privacy", to: "/privacy" },
    { label: "Blog", to: "#" },
]

const Footer = () => {
    return (
        <footer className="border-t border-[#222] py-16 mt-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                <div className="flex flex-col gap-4">
                    <Link to="/" className="flex items-center gap-2 w-fit">
                        <img src={Logo} alt="AInvoker Logo" className="h-7" />
                        <span className="text-xl font-semibold">AInvoker</span>
                    </Link>
                    <div className="flex gap-4">
                        <a
                            href="https://github.com/ainvoker"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#aaa] hover:text-white transition"
                            aria-label="GitHub"
                        >
                            <FaGithub size={20} />
                        </a>
                        <a
                            href="https://twitter.com/ainvoker"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#aaa] hover:text-white transition"
                            aria-label="Twitter"
                        >
                            <FaXTwitter size={20} />
                        </a>
                    </div>
                </div>

                <div>
                    <p className="font-semibold mb-4">Navigation</p>
                    <ul className="flex flex-col gap-2">
                        {navLinks.map(({ label, to }) => (
                            <li key={label}>
                                {to.startsWith("#") ? (
                                    <a href={to} className="text-[#aaa] hover:text-white transition">
                                        {label}
                                    </a>
                                ) : (
                                    <Link to={to} className="text-[#aaa] hover:text-white transition">
                                        {label}
                                    </Link>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <p className="font-semibold mb-4">Site Links</p>
                    <ul className="flex flex-col gap-2">
                        {siteLinks.map(({ label, to }) => (
                            <li key={label}>
                                <Link to={to} className="text-[#aaa] hover:text-white transition">
                                    {label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <p className="text-[#666] text-sm mt-12">
                &copy; {new Date().getFullYear()} AInvoker. All rights reserved.
            </p>
        </footer>
    )
}

export default Footer
