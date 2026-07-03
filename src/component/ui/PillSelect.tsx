import React from "react";

interface PillSelectProps {
  options: string[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  multi?: boolean;
}

const PillSelect: React.FC<PillSelectProps> = ({ options, selectedIds, onChange, multi = false }) => {
  const toggle = (option: string) => {
    if (multi) {
      const next = selectedIds.includes(option)
        ? selectedIds.filter((id) => id !== option)
        : [...selectedIds, option];
      onChange(next);
      return;
    }

    onChange(selectedIds.includes(option) ? [] : [option]);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = selectedIds.includes(option);
        return (
          <button
            key={option}
            type="button"
            onClick={() => toggle(option)}
            className={`rounded-full px-3 py-2 text-sm transition-colors ${active ? "bg-[#a6ff00] text-black" : "bg-[rgba(255,255,255,0.06)] text-white/80 border border-[rgba(255,255,255,0.12)]"}`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
};

export default PillSelect;
