import React, { useState } from "react";

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

const TextArea: React.FC<TextAreaProps> = ({ label, value, onChange, placeholder, className = "", ...props }) => {
  const [isFocused, setIsFocused] = useState(false);
  return (
    <div className={`relative ${className}`}>
      {label && <label className="mb-2 block text-[10px] uppercase tracking-wider text-[#A8A8A8]">{label}</label>}
      <textarea
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        className="w-full min-h-[110px] rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200 bg-[rgba(255,255,255,0.07)] border border-[rgba(255,255,255,0.12)] text-white placeholder:text-[#A8A8A8] focus:border-[#a6ff00] focus:bg-[rgba(255,255,255,0.12)] focus-visible:outline-none"
        style={{ boxShadow: isFocused ? "0 0 0 1px rgba(166,255,0,0.18)" : undefined }}
        {...props}
      />
    </div>
  );
};

export default TextArea;
