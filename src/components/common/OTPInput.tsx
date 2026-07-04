import { useRef, useState } from "react";

type OTPInputProps = {
    value: string;
    onChange: (value: string) => void;
    error: string | null;
    setError: React.Dispatch<React.SetStateAction<string | null>>;
    length?: number;
};

export default function OTPInput({
    value,
    onChange,
    error,
    setError,
    length = 6
}: OTPInputProps) {
    const [isFocused, setIsFocused] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setError('')
        const digits = e.target.value.replace(/\D/g, "").slice(0, length)
        onChange(digits)
    }

    return (
        <div
            className={`my-10 ${error ? "mb-3" : ""}`}
            onClick={() => inputRef.current?.focus()}
        >
            <input
                ref={inputRef}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                autoFocus
                value={value}
                onChange={handleChange}
                className="sr-only"
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
            />

            <div className="flex gap-4 cursor-text">
                {Array.from({ length }).map((_, index) => (
                    <div
                        key={index}
                        className={`
                            h-15 aspect-square
                            border rounded-xl
                            flex items-center justify-center
                            text-lg font-medium
                            ${error ? "border-2 border-red-400 bg-red-100 text-red-400" : value.length === index && isFocused ? "border-2 border-accent" : "border-gray-300"}
                        `}
                    >
                        {value[index] ?? ""}
                    </div>
                ))}
            </div>

            {error && <p className="text-center pt-2 text-sm text-red-500 animate-shake">{error}</p>}
        </div>
    );
}