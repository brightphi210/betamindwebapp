import React, { type ButtonHTMLAttributes, type ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  fullWidth?: boolean;
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  fullWidth = false,
  isLoading = false,
  className = "",
  disabled,
  ...props
}) => {
  let variantStyles = "";

  switch (variant) {
    case "primary":
      variantStyles =
        "bg-[var(--color-primary)] text-black font-semibold hover:opacity-90";
      break;
    case "secondary":
      variantStyles =
        "bg-[var(--color-surface)] text-[var(--color-text-primary)] hover:bg-opacity-80";
      break;
    case "outline":
      variantStyles =
        "bg-transparent border border-[rgba(255,255,255,0.15)] text-[var(--color-text-primary)] hover:bg-[rgba(255,255,255,0.05)]";
      break;
    case "ghost":
      variantStyles =
        "bg-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]";
      break;
  }

  const widthClass = fullWidth ? "w-full" : "";
  const disabledClass =
    disabled || isLoading ? "opacity-60 cursor-not-allowed" : "cursor-pointer";

  return (
    <button
      className={`flex items-center justify-center gap-2 py-2.5 px-5 rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)] ${variantStyles} ${widthClass} ${disabledClass} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button;
