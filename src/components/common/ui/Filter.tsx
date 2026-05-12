import { useState, useRef, useEffect } from "react";
import { IoChevronDown, IoCheckmark } from "react-icons/io5";

type Option = {
  label: string;
  value: string | number | null;
  mobileHidden?: boolean;
};

type CustomSelectProps = {
  label: string;
  value: string | number | null;
  options: Option[];
  onChange: (value: any) => void;
  className?: string;
};

const CustomSelect = ({ label, value, options, onChange }: CustomSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  return (
    <div className="relative select-none" ref={containerRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="bg-[#e8e8e8] hover:bg-[#dfdfdf] rounded-2xl px-3 py-1.5 md:px-4 md:py-2.5 text-[13px] md:text-[14px] font-medium text-[#1D1D1F] flex items-center justify-between gap-2 md:gap-4 cursor-pointer transition-all duration-200"
      >
        <span className="capitalize">{label === 'Tipo' ? '' : selectedOption?.label || label}</span>
        <IoChevronDown className={`transition-transform duration-300 text-gray-400 w-3 h-3 md:w-3.5 md:h-3.5 ${isOpen ? "rotate-180" : ""}`} />
      </div>

      {isOpen && (
        <div className="absolute top-[calc(100%+8px)] left-0 min-w-[140px] bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.15)] p-1.5 z-[100] animate-in fade-in duration-100 border border-gray-100/50">
          <div className="max-h-[250px] overflow-y-auto custom-scrollbar flex flex-col">
            {options.map((opt, idx) => (
              <div
                key={idx}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`px-3 py-2 text-[13px] cursor-pointer transition-colors justify-between items-center rounded-lg capitalize ${opt.value === value ? "bg-[#f5f5f5] text-black font-semibold" : "text-gray-600 hover:bg-[#fcfcfc] font-medium"
                  } ${opt.mobileHidden ? "hidden md:flex" : "flex"}`}
              >
                {opt.label}
                {opt.value === value && <IoCheckmark size={14} className="text-black ml-2" />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

type Props = {
  filter?: string;
  setFilter?: (filter: string) => void;
  year?: number | null;
  setYear?: (year: number | null) => void;
  month?: number | null;
  setMonth?: (month: number | null) => void;
  currency?: "ARS" | "USD" | null;
  setCurrency?: (currency: "ARS" | "USD" | null) => void;
};

export const Filter = ({
  filter,
  year,
  month,
  currency,
  setFilter,
  setYear,
  setMonth,
  setCurrency,
}: Props) => {
  return (
    <div className="flex flex-wrap items-center gap-2 md:gap-4">
      {/* Filtro Año */}
      {setYear && (
        <CustomSelect
          label="Año"
          value={year ?? 2026}
          options={[
            { label: "2025", value: 2025 },
            { label: "2026", value: 2026 },
          ]}
          onChange={setYear}
        />
      )}

      {/* Filtro Mes */}
      {setMonth && (
        <CustomSelect
          label="Mes"
          value={month ?? null}
          options={[
            { label: "Mes", value: null },
            ...Array.from({ length: 12 }, (_, i) => ({
              label: new Date(0, i).toLocaleString("es-AR", { month: "long" }),
              value: i + 1,
            })),
          ]}
          onChange={setMonth}
        />
      )}

      {/* Filtro Moneda */}
      {setCurrency && (
        <CustomSelect
          label="Moneda"
          value={currency ?? null}
          options={[
            { label: "Moneda", value: null, mobileHidden: true },
            { label: "ARS", value: "ARS" },
            { label: "USD", value: "USD" },
          ]}
          onChange={setCurrency}
        />
      )}

      {/* Filtro Tipo */}
      {setFilter && (
        <CustomSelect
          label="Recientes"
          value={filter ?? "Recientes"}
          options={[
            { label: "Recientes", value: "desc" },
            { label: "Antiguos", value: "asc" },
            { label: "Pendiente", value: "pendiente" },
            { label: "Finalizado", value: "finalizado" },
          ]}
          onChange={setFilter}
        />
      )}
    </div>
  );
};
