

const Header = () => {
    return (
        <header className="flex justify-center">
            <div className="text-center px-20 flex flex-col items-center gap-3 mt-[10%] w-230">
                <h1 className="text-5xl font-black bg-accent-gradient-lg w-fit bg-clip-text text-transparent leading-[1.3]">
                    Centralized AI <br />Access & Management
                </h1>
                <p className="text-lg text-[#cccccc]">
                    AInvoker simplifies AI integration by providing a unified gateway to multiple AI providers. 
                    Manage API keys, monitor usage, and scale your AI applications with enterprise-grade security.
                </p>
            </div>
        </header>
    )
}

export default Header