import React, { useState, useRef, useEffect } from 'react';
import { FiChevronDown } from 'react-icons/fi';

const COUNTRIES = [
  { code: '+1', name: 'United States', flag: '🇺🇸' },
  { code: '+44', name: 'United Kingdom', flag: '🇬🇧' },
  { code: '+234', name: 'Nigeria', flag: '🇳🇬' },
  { code: '+91', name: 'India', flag: '🇮🇳' },
  { code: '+61', name: 'Australia', flag: '🇦🇺' },
  { code: '+81', name: 'Japan', flag: '🇯🇵' },
  { code: '+49', name: 'Germany', flag: '🇩🇪' },
  { code: '+33', name: 'France', flag: '🇫🇷' },
  { code: '+55', name: 'Brazil', flag: '🇧🇷' },
  { code: '+27', name: 'South Africa', flag: '🇿🇦' },
  { code: '+254', name: 'Kenya', flag: '🇰🇪' },
  { code: '+233', name: 'Ghana', flag: '🇬🇭' },
];

interface PhoneInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({ label, value, onChange, className = "" }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  
  // Parse value or default to US
  const initialCountry = COUNTRIES.find(c => value.startsWith(c.code)) || COUNTRIES[0];
  const [selectedCountry, setSelectedCountry] = useState(initialCountry);
  
  // Extract number without code for display in input
  const displayValue = value.startsWith(selectedCountry.code) 
    ? value.substring(selectedCountry.code.length).trim() 
    : value;

  const dropdownRef = useRef<HTMLDivElement>(null);

  const isActive = isFocused || displayValue.length > 0;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCountrySelect = (country: typeof COUNTRIES[0]) => {
    setSelectedCountry(country);
    setShowDropdown(false);
    onChange(`${country.code} ${displayValue}`);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(`${selectedCountry.code} ${e.target.value}`);
  };

  const generatedId = React.useId();

  return (
    <div className={`relative ${className}`}>
      <label
        htmlFor={generatedId}
        className="absolute left-[110px] pointer-events-none transition-all duration-200 font-medium z-10"
        style={{
          top: isActive ? "8px" : "50%",
          transform: isActive ? "translateY(0)" : "translateY(-50%)",
          fontSize: isActive ? "11px" : "12px",
          color: isActive ? "var(--color-primary)" : "var(--color-text-secondary)",
        }}
      >
        {label}
      </label>
      
      <div 
        className="w-full rounded-lg flex items-center transition-all duration-200 overflow-visible relative"
        style={{
          backgroundColor: "rgba(255,255,255,0.07)",
          border: `1px solid ${isFocused || showDropdown ? "var(--color-primary)" : "rgba(255,255,255,0.12)"}`,
          minHeight: "50px",
        }}
      >
        {/* Country Selector Dropdown */}
        <div className="relative h-full flex items-center" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-1.5 px-4 py-2 hover:bg-[rgba(255,255,255,0.05)] rounded-l-lg transition-colors h-full"
          >
            <span className="text-sm">{selectedCountry.flag}</span>
            <span className="text-white text-sm font-medium">{selectedCountry.code}</span>
            <FiChevronDown className={`w-3 h-3 text-[var(--color-text-secondary)] transition-transform ${showDropdown ? "rotate-180" : ""}`} />
          </button>

          {showDropdown && (
            <div className="absolute top-[110%] left-0 w-64 bg-[var(--color-surface)] border border-[rgba(255,255,255,0.1)] rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
              {COUNTRIES.map(country => (
                <button
                  key={country.code}
                  type="button"
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[rgba(255,255,255,0.05)] transition-colors text-left"
                  onClick={() => handleCountrySelect(country)}
                >
                  <span className="text-lg">{country.flag}</span>
                  <span className="text-white text-sm flex-1">{country.name}</span>
                  <span className="text-[var(--color-text-secondary)] text-sm">{country.code}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-[rgba(255,255,255,0.12)]"></div>

        {/* Number Input */}
        <input
          id={generatedId}
          type="tel"
          value={displayValue}
          onChange={handleNumberChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="flex-1 bg-transparent px-4 text-sm text-white outline-none h-full w-full"
          style={{
            paddingTop: isActive ? "16px" : "0px",
            paddingBottom: isActive ? "0px" : "0px",
          }}
        />
      </div>
    </div>
  );
};

export default PhoneInput;
