import React, { type InputHTMLAttributes, useState } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  id,
  value,
  onChange,
  onFocus,
  onBlur,
  className = "",
  placeholder,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  // Determine if the label should be "active" (floated up)
  // Value might be a number, string, or readonly array. Check if it exists and has length/value.
  const hasValue =
    value !== undefined && value !== null && String(value).length > 0;
  const isActive = isFocused || hasValue;

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  // Use React's built-in useId hook to generate a stable, pure ID for accessibility
  const generatedId = React.useId();
  const inputId = id || generatedId;

  return (
    <div className={`relative ${className}`}>
      <label
        htmlFor={inputId}
        className="absolute left-4 pointer-events-none transition-all duration-200 font-medium"
        style={{
          top: isActive ? "8px" : "50%",
          transform: isActive ? "translateY(0)" : "translateY(-50%)",
          fontSize: isActive ? "11px" : "12px",
          color: isActive
            ? "var(--color-primary)"
            : "var(--color-text-secondary)",
        }}
      >
        {label}
      </label>
      <input
        id={inputId}
        value={value}
        onChange={onChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={isFocused ? placeholder : ""}
        className="w-full rounded-lg px-4 text-sm outline-none transition-all duration-200 focus-visible:outline-none"
        style={{
          color: "var(--color-text-primary)",
          paddingTop: isActive ? "20px" : "12px",
          paddingBottom: isActive ? "6px" : "12px",
          backgroundColor: "rgba(255,255,255,0.07)",
          border: `1px solid ${isActive ? "var(--color-primary)" : "rgba(255,255,255,0.12)"}`,
          minHeight: "46px",
        }}
        {...props}
      />
    </div>
  );
};

export default Input;
