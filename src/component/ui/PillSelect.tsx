import React from 'react';
import type { IconType } from 'react-icons';

export interface PillOption {
  id: string;
  label: string;
  icon?: IconType;
}

interface PillSelectProps {
  options: PillOption[];
  selectedIds: string[];
  onChange: (selectedIds: string[]) => void;
  multi?: boolean;
}

export const PillSelect: React.FC<PillSelectProps> = ({ options, selectedIds, onChange, multi = true }) => {
  const toggleSelection = (id: string) => {
    if (multi) {
      if (selectedIds.includes(id)) {
        onChange(selectedIds.filter(val => val !== id));
      } else {
        onChange([...selectedIds, id]);
      }
    } else {
      onChange([id]);
    }
  };

  return (
    <div className="flex flex-wrap gap-3">
      {options.map((option) => {
        const isSelected = selectedIds.includes(option.id);
        const Icon = option.icon;
        
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => toggleSelection(option.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200 ${
              isSelected 
                ? "bg-[var(--color-primary)] border-[var(--color-primary)] text-black" 
                : "bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)] text-white hover:border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.05)]"
            }`}
          >
            {Icon && <Icon className={`w-4 h-4 ${isSelected ? "text-black" : "text-[var(--color-text-secondary)]"}`} />}
            {option.label}
          </button>
        );
      })}
    </div>
  );
};

export default PillSelect;
