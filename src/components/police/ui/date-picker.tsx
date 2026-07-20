"use client";

import { Calendar } from "lucide-react";

interface DatePickerProps {
  label?: string;
  value: string; // ISO date string (YYYY-MM-DD) or empty
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  minDate?: string; // YYYY-MM-DD format
  maxDate?: string; // YYYY-MM-DD format
}

/**
 * DatePicker - Native date picker with Swahili-friendly display
 * Uses native date input for mobile compatibility, displays formatted date
 */
export function DatePicker({
  label,
  value,
  onChange,
  placeholder = "Chagua tarehe",
  error,
  required,
  minDate,
  maxDate,
}: DatePickerProps) {
  // Convert ISO format to display format (Swahili)
  const formatDateDisplay = (dateStr: string): string => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr + "T00:00:00");
      return date.toLocaleDateString("sw-TZ", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  // Swahili months for reference
  const SWAHILI_MONTHS = [
    "Januari", "Februari", "Machi", "Aprili", "Mei", "Juni",
    "Julai", "Agosti", "Septemba", "Oktoba", "Novemba", "Desemba"
  ];

  return (
    <div>
      <label className="mb-1 block text-[12px] font-medium text-police-muted">
        {label || "Tarehe"}
        {required && <span className="ml-0.5 text-[#EF4444]">*</span>}
      </label>
      <div className="relative">
        {/* Native date input - hidden but functional */}
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          min={minDate}
          max={maxDate}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        {/* Display layer with formatted date */}
        <div className={`flex items-center gap-2 rounded-xl border bg-police-input px-3 h-10 ${
          error 
            ? "border-[#EF4444]" 
            : value 
            ? "border-[#10B981]" 
            : "border-police"
        }`}>
          <Calendar size={14} className={` ${value ? "text-[#1E3A8A]" : "text-police-faint"}`} />
          <span className={`text-[13px] flex-1 ${
            value ? "font-medium text-police" : "text-police-faint"
          }`}>
            {value ? formatDateDisplay(value) : placeholder}
          </span>
          <svg width="14" height="14" viewBox="0 0 12 12" className="text-police-faint">
            <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      {error && (
        <p className="mt-1 text-[10px] text-[#EF4444]">{error}</p>
      )}
    </div>
  );
}

/**
 * DateTimePicker - Combines date and time selection
 */
interface DateTimePickerProps {
  label?: string;
  dateValue: string;
  timeValue: string;
  onDateChange: (value: string) => void;
  onTimeChange: (value: string) => void;
  showTime?: boolean;
}

export function DateTimePicker({
  label,
  dateValue,
  timeValue,
  onDateChange,
  onTimeChange,
  showTime = true,
}: DateTimePickerProps) {
  const formatDateDisplay = (dateStr: string): string => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr + "T00:00:00");
      return date.toLocaleDateString("sw-TZ", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div>
      {label && (
        <label className="mb-1 block text-[12px] font-medium text-police-muted">{label}</label>
      )}
      <div className={`flex gap-2 ${showTime ? "" : ""}`}>
        <div className="relative flex-1">
          <input
            type="date"
            value={dateValue}
            onChange={(e) => onDateChange(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <div className="flex items-center gap-1.5 rounded-xl border border-police bg-police-input px-2.5 h-9">
            <Calendar size={13} className="text-police-faint" />
            <span className="text-[12px] text-police">
              {dateValue ? formatDateDisplay(dateValue) : "Tarehe"}
            </span>
          </div>
        </div>
        {showTime && (
          <div className="relative w-28">
            <input
              type="time"
              value={timeValue}
              onChange={(e) => onTimeChange(e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="flex items-center justify-center rounded-xl border border-police bg-police-input px-2.5 h-9">
              <span className="text-[12px] text-police">
                {timeValue || "--:--"}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
