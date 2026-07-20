"use client";

import { useState } from "react";
import { AlertCircle } from "lucide-react";

interface NidaInputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
}

/**
 * NidaInput - Formats NIDA number as 0000-0000-0000-0000-00
 * Tanzanian National ID is 20 digits, displayed in groups of 4-4-4-4-2
 */
export function NidaInput({
  label,
  value,
  onChange,
  placeholder = "0000-0000-0000-0000-00",
  error,
  required,
}: NidaInputProps) {
  const [focused, setFocused] = useState(false);

  // Format raw input to NIDA format: 0000-0000-0000-0000-00
  const formatNida = (input: string): string => {
    // Remove all non-digit characters
    const digits = input.replace(/\D/g, "");
    
    // Limit to 20 digits (Tanzanian NIDA length)
    const truncated = digits.slice(0, 20);
    
    // Format as 0000-0000-0000-0000-00
    const parts = [
      truncated.slice(0, 4),
      truncated.slice(4, 8),
      truncated.slice(8, 12),
      truncated.slice(12, 16),
      truncated.slice(16, 20),
    ];
    
    return parts.filter(Boolean).join("-");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatNida(e.target.value);
    onChange(formatted);
  };

  // Validate NIDA format
  const isValid = (val: string): boolean => {
    const digits = val.replace(/\D/g, "");
    return digits.length === 20;
  };

  return (
    <div>
      <label className="mb-1 block text-[12px] font-medium text-police-muted">
        {label || "Namba ya NIDA"}
        {required && <span className="ml-0.5 text-[#EF4444]">*</span>}
      </label>
      <div className="relative">
        <input
          type="text"
          inputMode="numeric"
          value={value}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          className={`w-full rounded-xl border bg-police-input px-3 h-10 text-[13px] font-mono tracking-wider text-police placeholder:text-police-faint focus:outline-none ${
            error
              ? "border-[#EF4444]"
              : isValid(value) && value.length > 0
              ? "border-[#10B981]"
              : "border-police focus:border-[#1E3A8A]"
          }`}
        />
        {isValid(value) && !focused && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#10B981] text-sm">✓</span>
        )}
      </div>
      {error && (
        <div className="mt-1 flex items-center gap-1">
          <AlertCircle size={11} className="text-[#EF4444]" />
          <p className="text-[10px] text-[#EF4444]">{error}</p>
        </div>
      )}
      {!error && value.length > 0 && !isValid(value) && (
        <p className="mt-0.5 text-[9px] text-[#FF9800]">
          Nambari ya NIDA inahitaji tarakimu 20 ({value.replace(/\D/g, "").length}/20)
        </p>
      )}
    </div>
  );
}

/**
 * Validate a formatted NIDA number string
 */
export function validateNidaFormatted(value: string): { valid: boolean; error?: string } {
  if (!value?.trim()) return { valid: false, error: "NIDA inahitajika" };
  const digits = value.replace(/\D/g, "");
  if (digits.length !== 20) return { valid: false, error: `NIDA lazima iwe nambari 20 (una ${digits.length})` };
  return { valid: true };
}
