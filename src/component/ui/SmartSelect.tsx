import React, { useState, useRef, useEffect, useCallback } from "react";
import { FiChevronDown, FiX } from "react-icons/fi";

interface SmartSelectProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
}

const SmartSelect: React.FC<SmartSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Search...",
  label,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState(value);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const filtered = options.filter((opt) =>
    opt.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        if (value) {
          setSearch(value);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [value]);

  useEffect(() => {
    if (isOpen && listRef.current) {
      const items = listRef.current.children;
      if (items[highlightedIndex]) {
        items[highlightedIndex].scrollIntoView({ block: "nearest" });
      }
    }
  }, [highlightedIndex, isOpen]);

  const handleSelect = useCallback(
    (option: string) => {
      onChange(option);
      setSearch(option);
      setIsOpen(false);
    },
    [onChange]
  );

  const handleClear = () => {
    onChange("");
    setSearch("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filtered.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filtered.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (filtered[highlightedIndex]) {
          handleSelect(filtered[highlightedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        if (value) setSearch(value);
        break;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {label && (
        <p className="text-[10px] text-[var(--color-text-secondary)] uppercase font-bold tracking-wider mb-3">
          {label}
        </p>
      )}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setHighlightedIndex(0);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full rounded-lg pl-4 pr-16 py-2.5 text-sm outline-none transition-all duration-200 bg-[rgba(255,255,255,0.07)] border border-[rgba(255,255,255,0.12)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] focus:border-[var(--color-primary)]"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {search && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-[var(--color-text-secondary)] hover:text-white transition-colors"
            >
              <FiX size={14} />
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 text-[var(--color-text-secondary)] hover:text-white transition-colors"
          >
            <FiChevronDown
              size={16}
              className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
            />
          </button>
        </div>
      </div>

      {isOpen && filtered.length > 0 && (
        <ul
          ref={listRef}
          className="absolute top-full left-0 right-0 mt-1 bg-[var(--color-surface)] border border-[rgba(255,255,255,0.1)] rounded-lg shadow-xl z-50 max-h-52 overflow-y-auto"
        >
          {filtered.map((option, index) => (
            <li
              key={option}
              className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                index === highlightedIndex
                  ? "bg-[rgba(219,255,0,0.1)] text-[var(--color-primary)]"
                  : "text-[var(--color-text-primary)] hover:bg-[rgba(255,255,255,0.05)]"
              }`}
              onClick={() => handleSelect(option)}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              {option}
            </li>
          ))}
        </ul>
      )}

      {isOpen && filtered.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-[var(--color-surface)] border border-[rgba(255,255,255,0.1)] rounded-lg shadow-xl z-50 px-4 py-3 text-sm text-[var(--color-text-secondary)]">
          No results found
        </div>
      )}
    </div>
  );
};

export default SmartSelect;
