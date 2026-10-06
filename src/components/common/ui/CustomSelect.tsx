import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
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
  const [menuCoords, setMenuCoords] = useState<{ top: number; left: number; width: number }>({
    top: 0,
    left: 0,
    width: 0,
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const updateCoords = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const width = Math.max(rect.width, 140);
      const maxLeft = window.innerWidth - width - 10;
      const left = Math.max(10, Math.min(rect.left, maxLeft));

      setMenuCoords({
        top: rect.bottom + 6,
        left,
        width,
      });
    }
  };

  const toggleOpen = () => {
    if (disabled) return;
    if (!isOpen) {
      updateCoords();
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        menuRef.current &&
        !menuRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    const handleScrollOrResize = () => {
      if (isOpen) {
        updateCoords();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [isOpen]);

  const selectedOption = options.find((opt) => opt.value === internalValue);

  return (
    <div
      className={`relative select-none w-full ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
      ref={containerRef}
    >
      <div
        onClick={toggleOpen}
        className={`w-full bg-[#f0f0f0] flex items-center justify-between gap-2 transition-all duration-200 border-none 
          ${size === "sm" ? "rounded-md px-2 py-1 text-[14px]" : "rounded-xl px-4 py-2.5 text-[14px]"} 
          font-medium text-[#1D1D1F] 
          ${!disabled ? "cursor-pointer hover:bg-[#e8e8e8]" : ""} 
          ${isOpen ? "ring-2 ring-black/10" : ""}`}
      >
        <span className="capitalize">{selectedOption ? selectedOption.label : placeholder}</span>
        <IoChevronDown className={`transition-transform duration-300 text-gray-400 w-4 h-4 ${isOpen ? "rotate-180" : ""}`} />
      </div>

      {isOpen && !disabled && typeof document !== "undefined" && createPortal(
        <div
          ref={menuRef}
          style={{
            position: "fixed",
            top: `${menuCoords.top}px`,
            left: `${menuCoords.left}px`,
            width: `${menuCoords.width}px`,
            zIndex: 99999,
          }}
          className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.18)] p-1.5 border border-gray-100/80 animate-in fade-in duration-100 select-none"
        >
          <div
            style={{
              maxHeight: `${Math.max(120, Math.min(250, window.innerHeight - menuCoords.top - 16))}px`,
            }}
            className="overflow-y-auto custom-scrollbar flex flex-col gap-0.5"
          >
            {options.map((opt, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setInternalValue(opt.value);
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`px-3 py-2 text-[14px] cursor-pointer transition-colors justify-between items-center rounded-lg capitalize ${
                  opt.value === internalValue
                    ? "bg-[#f5f5f5] text-black font-semibold"
                    : "text-gray-600 hover:bg-[#fcfcfc] font-medium"
                } ${opt.mobileHidden ? "hidden md:flex" : "flex"}`}
              >
                {opt.label}
                {opt.value === internalValue && <IoCheckmark size={16} className="text-black ml-2" />}
              </div>
            ))}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
