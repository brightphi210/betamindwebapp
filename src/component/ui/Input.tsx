import React, { useState, type InputHTMLAttributes } from "react";

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
  const hasValue = value !== undefined && value !== null && String(value).length > 0;
  const isActive = isFocused || hasValue;

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

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
          color: isActive ? "#a6ff00" : "#A8A8A8",
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
        className="w-full rounded-md px-4 text-sm outline-none transition-all duration-200 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.09)] text-white placeholder:text-[#A8A8A8] focus:border-[#a6ff00] focus:bg-[rgba(255,255,255,0.05)] focus-visible:outline-none"
        style={{
          paddingTop: isActive ? "22px" : "14px",
          paddingBottom: isActive ? "10px" : "14px",
          minHeight: "55px",
          boxShadow: isFocused ? "0 0 0 1px rgba(166,255,0,0.18)" : undefined,
        }}
        {...props}
      />
    </div>
  );
};

export default Input;
