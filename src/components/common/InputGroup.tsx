import { useState } from 'react'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import type { InputGroupParams } from '../../types/common/inputgroup'
import Helper from '../../utils/helper'

const InputGroup = ({ label, type, placeholder, error, name, onChange, onBlur, ref }: InputGroupParams) => {
    const [showPassword, setShowPassword] = useState(false)
    const isPassword = type === 'password'
    const inputType = isPassword && showPassword ? 'text' : type

    return (
        <div className={`rounded-lg overflow-hidden border border-gray-300 ${error ? 'bg-red-100' : 'bg-light'}`}>
            {error ?
                <label htmlFor={name} className="block cursor-text px-4 pt-2 text-xs font-medium text-red-500">
                    {Helper.capitalize(error)}
                </label>
                :
                <label htmlFor={name} className="block cursor-text px-4 pt-2 text-xs font-medium text-gray-800">
                    {label}
                </label>
            }
            <div className="flex items-center">
                <input type={inputType} name={name} id={name} placeholder={placeholder} onChange={onChange} onBlur={onBlur} ref={ref}
                    className={`peer min-w-0 flex-1 px-4 pb-2 outline-none text-base bg-transparent ${error ? 'text-red-500 autofill-error' : 'text-gray-700 autofill-light'}`} />
                {isPassword && (
                    <button
                        type="button"
                        className={`mr-2 mb-2 grid size-8 shrink-0 place-items-center rounded-md transition-colors hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 peer-placeholder-shown:pointer-events-none peer-placeholder-shown:invisible ${error ? 'text-red-500' : 'text-gray-500'}`}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        aria-pressed={showPassword}
                        onClick={() => setShowPassword((visible) => !visible)}
                    >
                        {showPassword ? <FiEyeOff aria-hidden="true" /> : <FiEye aria-hidden="true" />}
                    </button>
                )}
            </div>
        </div>
    )
}

export default InputGroup