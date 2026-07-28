"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Car } from "lucide-react";

// Common vehicle makes/models in Tanzania
const VEHICLE_MAKES_MODELS = [
  // Toyota
  "Toyota Corolla",
  "Toyota Land Cruiser",
  "Toyota Hiace",
  "Toyota Mark II",
  "Toyota Premio",
  "Toyota RAV4",
  "Toyota Hilux",
  "Toyota Fielder",
  "Toyota Noah",
  "Toyota Alphard",
  // Suzuki
  "Suzuki Maruti",
  "Suzuki Swift",
  "Suzuki Alto",
  "Suzuki Every",
  // Honda
  "Honda Fit",
  "Honda CR-V",
  "Honda Accord",
  "Honda Civic",
  // Nissan
  "Nissan Sunny",
  "Nissan Note",
  "Nissan X-Trail",
  "Nissan Navara",
  "Nissan Caravan",
  // Mitsubishi
  "Mitsubishi Lancer",
  "Mitsubishi Canter",
  "Mitsubishi Pajero",
  "Mitsubishi Fuso",
  // Others
  "Isuzu Elf",
  "Isuzu NQR",
  "Mazda BT-50",
  "Subaru Forester",
  "Subaru Impreza",
  "Foton",
  "Daihatsu Hijet",
  "Hino",
  "Volvo FH",
  "Scania",
  "Mercedes Actros",
  "BMW X Series",
  "Audi A Series",
  // Bajaji/Pikipiki
  "TVS Apache",
  "Bajaj Boxer",
  "Honda Motorcycle",
  "Yamaha Motorcycle",
  "Piaggio",
];

interface MakeModelDropdownProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
}

/**
 * MakeModelDropdown - Dropdown for vehicle make/model with search and "Other" option
 * Shows common Tanzanian vehicles, allows manual entry if not found
 */
export function MakeModelDropdown({
  label,
  value,
  onChange,
  placeholder = "Chagua Make/Model",
  error,
  required,
}: MakeModelDropdownProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [isOther, setIsOther] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter options based on search
  const filteredOptions = VEHICLE_MAKES_MODELS.filter((option) =>
    option.toLowerCase().includes(search.toLowerCase())
  );

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option: string) => {
    if (option === "__OTHER__") {
      setIsOther(true);
      setOpen(false);
      setSearch("");
      onChange(""); // Clear for manual entry
    } else {
      setIsOther(false);
      onChange(option);
      setOpen(false);
      setSearch("");
    }
  };

  const handleManualChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div ref={dropdownRef}>
      <label className="mb-1 block text-[12px] font-medium text-police-muted">
        {label || "Mfano (Make/Model)"}
        {required && <span className="ml-0.5 text-[#EF4444]">*</span>}
      </label>

      {isOther ? (
        /* Manual entry mode */
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={value}
              onChange={handleManualChange}
              placeholder="Ingiza make/model manually..."
              className={`w-full rounded-xl border bg-police-input px-3 h-10 text-[13px] text-police placeholder:text-police-faint focus:outline-none ${
                error ? "border-[#EF4444]" : "border-[#FF9800] focus:border-[#FF9800]"
              }`}
              autoFocus
            />
          </div>
          <button
            type="button"
            onClick={() => {
              setIsOther(false);
              setOpen(true);
            }}
            className="px-3 rounded-xl border border-[#2196F3] bg-[#2196F3]/10 text-[11px] font-semibold text-[#2196F3]"
          >
            Orodha
          </button>
        </div>
      ) : (
        /* Dropdown mode */
        <>
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className={`relative flex w-full items-center gap-2 rounded-xl border bg-police-input px-3 h-10 ${
              error 
                ? "border-[#EF4444]" 
                : value 
                ? "border-[#10B981]" 
                : "border-police focus:border-[#1E3A8A]"
            }`}
          >
            <Car size={14} className={value ? "text-[#1E3A8A]" : "text-police-faint"} />
            <span className={`flex-1 text-left text-[13px] truncate ${
              value ? "font-medium text-police" : "text-police-faint"
            }`}>
              {value || placeholder}
            </span>
            <ChevronDown size={14} className={`text-police-faint transition ${open ? "rotate-180" : ""}`} />
          </button>

          {open && (
            <div className="relative z-50 mt-1 rounded-xl border border-police bg-police-card shadow-lg max-h-56 overflow-hidden">
              {/* Search input */}
              <div className="p-2 border-b border-police-soft">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tafuta make/model..."
                  className="w-full rounded-lg border border-police bg-police-input px-3 py-2 text-[12px] text-police placeholder:text-police-faint focus:outline-none"
                  autoFocus
                />
              </div>

              {/* Options list */}
              <div className="max-h-40 overflow-y-auto p-1">
                {filteredOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleSelect(option)}
                    className={`block w-full text-left px-3 py-2 rounded-lg text-[12px] transition ${
                      value === option
                        ? "bg-[#1E3A8A]/10 font-bold text-[#1E3A8A]"
                        : "text-police hover:bg-police-muted"
                    }`}
                  >
                    {option}
                  </button>
                ))}
                
                {/* "Other" option */}
                <button
                  type="button"
                  onClick={() => handleSelect("__OTHER__")}
                  className="block w-full text-left px-3 py-2 mt-1 rounded-lg text-[12px] font-semibold text-[#2196F3] border-t border-police-soft pt-2 hover:bg-[#2196F3]/5"
                >
                  + Ingiza Mwingine (Manual)
                </button>

                {filteredOptions.length === 0 && (
                  <p className="px-3 py-3 text-[11px] text-center text-police-faint">
                    Hakuna matokeo. Chagua &quot;+ Ingiza Mwingine&quot;
                  </p>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {error && !isOther && (
        <p className="mt-1 text-[10px] text-[#EF4444]">{error}</p>
      )}
      
      {isOther && (
        <p className="mt-0.5 text-[9px] text-[#FF9800]">
          Umeweza kuingiza make/manual yasiyo kwenye orodha
        </p>
      )}
    </div>
  );
}

/**
 * SimpleSelect - Standard dropdown select with consistent styling
 */
interface SimpleSelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  error?: string;
  required?: boolean;
}

export function SimpleSelect({
  label,
  value,
  onChange,
  options,
  placeholder = "— Chagua —",
  error,
  required,
}: SimpleSelectProps) {
  return (
    <div>
      <label className="mb-1 block text-[12px] font-medium text-police-muted">
        {label}
        {required && <span className="ml-0.5 text-[#EF4444]">*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-xl border bg-police-input px-3 h-10 text-[13px] text-police focus:outline-none appearance-none ${
          error
            ? "border-[#EF4444]"
            : "border-police focus:border-[#1E3A8A]"
        }`}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      {error && <p className="mt-1 text-[10px] text-[#EF4444]">{error}</p>}
    </div>
  );
}
