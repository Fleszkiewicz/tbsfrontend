import { useState, useRef, useEffect } from "react";
import { IoChevronDown, IoCheckmark } from "react-icons/io5";

export type SelectOption = {
  label: string;
  value: string | number | null;
  mobileHidden?: boolean;
};

type CustomSelectProps = {
  value: string | number | null;
  options: SelectOption[];
  onChange: (value: any) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  size?: "sm" | "md";
};

export const CustomSelect = ({
  value,
  options,
  onChange,
  className = "",
  placeholder = "Seleccionar",
  disabled = false,
  size = "md",
}: CustomSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [internalValue, setInternalValue] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === internalValue);

  return (
    <div className={`relative select-none w-full ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`} ref={containerRef}>
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full bg-[#f0f0f0] flex items-center justify-between gap-2 transition-all duration-200 border-none 
          ${size === "sm" ? "rounded-md px-2 py-1 text-[14px]" : "rounded-xl px-4 py-2.5 text-[14px]"} 
          font-medium text-[#1D1D1F] 
          ${!disabled ? "cursor-pointer hover:bg-[#e8e8e8]" : ""} 
          ${isOpen ? "ring-2 ring-black/10" : ""}`}
      >
        <span className="capitalize">{selectedOption ? selectedOption.label : placeholder}</span>
        <IoChevronDown className={`transition-transform duration-300 text-gray-400 w-4 h-4 ${isOpen ? "rotate-180" : ""}`} />
      </div>

      {isOpen && !disabled && (
        <div className="absolute top-[calc(100%+8px)] left-0 w-full min-w-[140px] bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.15)] p-1.5 z-[100] animate-in fade-in duration-100 border border-gray-100/50">
          <div className="max-h-[250px] overflow-y-auto custom-scrollbar flex flex-col gap-0.5">
            {options.map((opt, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setInternalValue(opt.value);
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`px-3 py-2 text-[14px] cursor-pointer transition-colors justify-between items-center rounded-lg capitalize ${opt.value === internalValue ? "bg-[#f5f5f5] text-black font-semibold" : "text-gray-600 hover:bg-[#fcfcfc] font-medium"
                  } ${opt.mobileHidden ? "hidden md:flex" : "flex"}`}
              >
                {opt.label}
                {opt.value === internalValue && <IoCheckmark size={16} className="text-black ml-2" />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
