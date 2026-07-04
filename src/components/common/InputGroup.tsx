import type { InputGroupParams } from '../../types/common/inputgroup'
import { capitalize } from '../../utils/helper'

const InputGroup = ({ label, type, placeholder, error, name, onChange, onBlur, ref }: InputGroupParams) => {
    return (
        <div className={`rounded-lg overflow-hidden border border-gray-300 ${error ? 'bg-red-100' : 'bg-light'}`}>
            {error ?
                <label htmlFor={name} className="block cursor-text px-4 pt-2 text-xs font-medium text-red-500">
                    {capitalize(error)}
                </label>
                :
                <label htmlFor={name} className="block cursor-text px-4 pt-2 text-xs font-medium text-gray-800">
                    {label}
                </label>
            }
            <input type={type} name={name} id={name} placeholder={placeholder} onChange={onChange} onBlur={onBlur} ref={ref}
                className={`w-full px-4 pb-2 outline-none text-base bg-transparent ${error ? 'text-red-500 autofill-error' : 'text-gray-700 autofill-light'}`} />
        </div>
    )
}

export default InputGroup