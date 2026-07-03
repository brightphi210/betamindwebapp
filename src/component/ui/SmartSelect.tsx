import React, { useState } from "react";

interface SmartSelectProps {
  label?: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const SmartSelect: React.FC<SmartSelectProps> = ({ label, options, value, onChange, placeholder = "Search..." }) => {
  const [query, setQuery] = useState(value);
  const filtered = options.filter((option) => option.toLowerCase().includes(query.toLowerCase()));

  return (
    <div>
      {label && <p className="text-[10px] text-[#A8A8A8] uppercase font-bold tracking-wider mb-3">{label}</p>}
      <input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          onChange(e.target.value);
        }}
        placeholder={placeholder}
        className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200 bg-[rgba(255,255,255,0.07)] border border-[rgba(255,255,255,0.12)] text-white placeholder:text-[#A8A8A8]"
      />
      {filtered.length > 0 && (
        <div className="mt-2 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#02160B] p-2">
          {filtered.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                setQuery(option);
                onChange(option);
              }}
              className="block w-full rounded-lg px-3 py-2 text-left text-sm text-white/80 hover:bg-[rgba(255,255,255,0.06)]"
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SmartSelect;
