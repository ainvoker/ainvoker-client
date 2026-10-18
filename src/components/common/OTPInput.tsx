import { useRef, useState } from "react";

type OTPInputProps = {
    value: string;
    onChange: (value: string) => void;
    error: string | null;
    setError: React.Dispatch<React.SetStateAction<string | null>>;
    length?: number;
    /** Compact fits the AuthLayout `w-96` column; default is used on wider centered pages. */
    size?: "default" | "compact";
};

export default function OTPInput({
    value,
    onChange,
    error,
    setError,
    length = 6,
    size = "default",
}: OTPInputProps) {
    const [isFocused, setIsFocused] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)
    const compact = size === "compact"

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setError('')
        const digits = e.target.value.replace(/\D/g, "").slice(0, length)
        onChange(digits)
    }

    return (
        <div
            className={`${compact ? "my-6" : "my-10"} ${error ? "mb-3" : ""}`}
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

            <div className={`flex cursor-text ${compact ? "gap-2" : "gap-4"}`}>
                {Array.from({ length }).map((_, index) => (
                    <div
                        key={index}
                        className={`
                            aspect-square
                            border
                            flex items-center justify-center
                            font-medium
                            ${compact ? "h-11 flex-1 rounded-lg text-base" : "h-15 rounded-xl text-lg"}
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
