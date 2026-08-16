import Logo from "../../assets/logo.svg"
import CodeSnippet from "../landing/CodeSnippet"

const SAMPLE_CODE = `import { ainvoker as ai } from "ainvoker"

const { text } = await ai.text.generate({
  model: "openai/gpt-5.4",
  prompt: "How does the SDK work?"
})

console.log(text)`

const AuthBrandPanel = () => {
  return (
    <div className="flex-1 min-h-screen bg-accent hidden md:flex items-center justify-center px-12 lg:px-16">
      <div className="w-full max-w-lg flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <img src={Logo} alt="AInvoker Logo" className="h-10" />
          <span className="text-3xl font-semibold text-white">AInvoker</span>
        </div>
        <h2 className="text-3xl lg:text-4xl font-black text-white leading-[1.3]">
          Centralized AI Access & Management
        </h2>
        <p className="text-lg text-[#cccccc]">One SDK. Every provider.</p>
        <CodeSnippet
          language="typescript"
          codes={[{ provider: "ainvoker", code: SAMPLE_CODE }]}
          className="w-full"
        />
      </div>
    </div>
  )
}

export default AuthBrandPanel
