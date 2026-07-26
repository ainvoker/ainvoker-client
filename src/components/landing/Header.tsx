const Header = () => {
    return (
        <header className="flex justify-center">
            <div className="text-center px-4 md:px-20 flex flex-col items-center gap-3 mt-12 md:mt-20 max-w-4xl mx-auto">
                <h1
                    className="hero-animate text-4xl md:text-5xl font-black bg-accent-gradient-lg w-fit bg-clip-text text-transparent leading-[1.3]"
                    style={{ animationDelay: "80ms" }}
                >
                    Centralized AI <br />Access & Management
                </h1>
                <p
                    className="hero-animate text-lg text-[#cccccc]"
                    style={{ animationDelay: "220ms" }}
                >
                    Ainvoker simplifies AI integration by providing a unified gateway to multiple providers.
                    Manage API keys, monitor usage, and audit your AI applications with enterprise-grade security.
                </p>
            </div>
        </header>
    )
}

export default Header
