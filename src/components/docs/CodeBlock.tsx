import { useState } from "react"
import SyntaxHighlighter from "react-syntax-highlighter"
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs"
import { IoCheckmarkOutline } from "react-icons/io5"
import { MdOutlineContentCopy } from "react-icons/md"

type CodeBlockProps = {
  code: string
  language?: string
  title?: string
}

const CodeBlock = ({ code, language = "typescript", title }: CodeBlockProps) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (copied) return
    await window.navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="overflow-hidden rounded-lg border border-[#2a2a2a] bg-[#1b1b1b]">
      <div className="flex items-center justify-between border-b border-[#2a2a2a] px-4 py-2.5">
        <span className="text-xs font-medium text-[#888]">{title ?? language}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-[#aaa] transition hover:bg-[#2a2a2a] hover:text-white"
          aria-label="Copy code"
        >
          {copied ? <IoCheckmarkOutline size={14} /> : <MdOutlineContentCopy size={14} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <div className="overflow-x-auto text-sm">
        <SyntaxHighlighter
          language={language}
          style={atomOneDark}
          customStyle={{
            backgroundColor: "#1b1b1b",
            margin: 0,
            padding: "1rem",
          }}
          showLineNumbers={false}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  )
}

export default CodeBlock
