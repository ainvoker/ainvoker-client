import { useState } from 'react'
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';

const CodeSnippet = ({ language, codes, className }: { language: string, codes: { provider: string, code: string }[], className: string }) => {
    const [current, setCurrent] = useState(0)

    return (
        <div className={`
            bg-[#1b1b1b] rounded-lg
            ${className}
        `}>
            <div className='p-4 flex justify-between border-b border-gray-800'>
                <div className='flex gap-2'>
                    <span className="w-2.5 aspect-square rounded-full bg-red-400"></span>
                    <span className="w-2.5 aspect-square rounded-full bg-yellow-500"></span>
                    <span className="w-2.5 aspect-square rounded-full bg-green-400"></span>
                </div>
            </div>
            <div className='px-2 pb-2'>
            <SyntaxHighlighter customStyle={{ backgroundColor: '#1b1b1b'}} language={language} style={atomOneDark} showLineNumbers>
            {
                codes[current].code
            }
            </SyntaxHighlighter>
            </div>
        </div>
    )
}

export default CodeSnippet