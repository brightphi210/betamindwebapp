import React from "react";
import { FiLoader } from "react-icons/fi";

export type ButtonVariant = "white" | "green" | "dark" | "primary" | "outline" | "secondary";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: ButtonVariant;
  fullWidth?: boolean;
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = "green",
  fullWidth = false,
  isLoading = false,
  className = "",
  disabled,
  type = "button",
  ...props
}) => {
  const resolvedVariant = variant === "primary"
    ? "green"
    : variant === "outline"
      ? "white"
      : variant === "secondary"
        ? "dark"
        : variant;

  const variantClasses: Record<"white" | "green" | "dark", string> = {
    white: "bg-white text-black border border-white hover:bg-[#f3f3f3] shadow-sm",
    green: "bg-[#a6ff00] text-black border border-[#a6ff00] hover:opacity-90 shadow-[0_0_0_1px_rgba(166,255,0,0.15)]",
    dark: "bg-[#010C06] text-white border border-white/10 hover:bg-[#0a140c] shadow-[0_0_20px_rgba(0,0,0,0.25)]",
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center gap-2 rounded-md px-5 py-2.5 text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${fullWidth ? "w-full" : ""} ${variantClasses[resolvedVariant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <FiLoader className="h-4 w-4 animate-spin" />
          <span>{children}</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
