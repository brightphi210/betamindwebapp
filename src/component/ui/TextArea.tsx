import React, { useState, type TextareaHTMLAttributes } from 'react';

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export const TextArea: React.FC<TextAreaProps> = ({ label, id, value, onChange, onFocus, onBlur, className = "", placeholder, ...props }) => {
  const [isFocused, setIsFocused] = useState(false);
  
  const hasValue = value !== undefined && value !== null && String(value).length > 0;
  const isActive = isFocused || hasValue || !!placeholder;

  const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  const generatedId = React.useId();
  const inputId = id || generatedId;

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="absolute left-4 pointer-events-none transition-all duration-200 font-medium z-10"
          style={{
            top: isActive ? "8px" : "14px",
            fontSize: isActive ? "11px" : "12px",
            color: isActive ? "var(--color-primary)" : "var(--color-text-secondary)",
          }}
        >
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        value={value}
        onChange={onChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={isFocused ? placeholder : ""}
        className="w-full rounded-lg px-4 text-sm outline-none transition-all duration-200 resize-y"
        style={{
          color: "var(--color-text-primary)",
          paddingTop: label ? (isActive ? "26px" : "14px") : "14px",
          paddingBottom: "14px",
          backgroundColor: "rgba(255,255,255,0.07)",
          border: `1px solid ${isFocused ? "var(--color-primary)" : "rgba(255,255,255,0.12)"}`,
          minHeight: "100px",
        }}
        {...props}
      />
    </div>
  );
};

export default TextArea;
