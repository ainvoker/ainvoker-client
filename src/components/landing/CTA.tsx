import { Link } from "react-router-dom"
import { MdOutlineContentCopy } from "react-icons/md";
import { GoArrowRight } from "react-icons/go";
import { IoCheckmarkOutline } from "react-icons/io5";
import { useState } from "react";

const CTA = () => {
    const [copied, setCopied] = useState(false)

    const handleClick = async () => {
        if(copied) return
        await window.navigator.clipboard.writeText("npm install ainvoker")
        setCopied(true)
        setTimeout(() => setCopied(false), 3000)
    }

    return (
        <div className="flex gap-3 justify-center mt-15">
            <div className="font-mono flex gap-2 bg-[#60606033] px-4 py-2 rounded-lg w-80">
                <span className="select-none">$</span>
                <span className="flex-1">npm install ainvoker</span>
                <button
                    className="cursor-pointer"
                    onClick={handleClick}
                >
                    {
                        copied
                        ? <IoCheckmarkOutline />
                        : <MdOutlineContentCopy />
                    }
                </button>
            </div>
            <Link 
                to="/v1/docs" 
                className="bg-white px-4 py-2 flex gap-2 text-accent text-sm rounded-lg items-center font-semibold"
            >
                View Docs
                <GoArrowRight size={15} />
            </Link>
        </div>
    )
}

export default CTA