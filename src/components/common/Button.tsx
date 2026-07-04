import React from "react";

type ButtonProps = {
    children: React.ReactNode;
    type?: "button" | "submit" | "reset";
    disabled?: boolean;
    loading?: boolean;
    onClick?: () => void;
    className?: string;
};

const Button = ({
    children,
    type = "button",
    disabled = false,
    loading = false,
    onClick,
    className = "",
}: ButtonProps) => {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className={`
                bg-accent-gradient
                text-white
                py-3 px-4
                rounded-lg
                font-medium
                transition
                cursor-pointer
                hover:brightness-95
                disabled:opacity-50
                disabled:cursor-not-allowed
                flex items-center justify-center gap-2
                ${className}
            `}
        >
            {loading ? "Loading..." : children}
        </button>
    );
};

export default Button;