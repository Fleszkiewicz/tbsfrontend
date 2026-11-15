import { useState, useRef, useEffect } from "react";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import { FiCalendar } from "react-icons/fi";
import { LuChevronsLeft, LuChevronsRight } from "react-icons/lu";

type Props = {
  value: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  /** Días anteriores a esta fecha (YYYY-MM-DD) quedan deshabilitados */
  minDate?: string;
  /** Días posteriores a esta fecha (YYYY-MM-DD) quedan deshabilitados */
  maxDate?: string;
  /** Banda gris continua entre rangeStart y rangeEnd (ambos inclusive) */
  rangeStart?: string;
  rangeEnd?: string;
};

const DAYS_OF_WEEK = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"];
const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const toIso = (y: number, m: number, d: number) =>
  `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

export const CustomDatePicker = ({
  value,
  onChange,
  minDate,
  maxDate,
  rangeStart,
  rangeEnd,
}: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse initial value, start of range or current date
  const initialBase = value || rangeStart || "";
  const initialDate = initialBase ? new Date(initialBase + "T00:00:00") : new Date();

  const [currentViewDate, setCurrentViewDate] = useState(initialDate);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const year = currentViewDate.getFullYear();
  const month = currentViewDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const changeMonth = (offset: number) => {
    setCurrentViewDate(new Date(year, month + offset, 1));
  };

  const changeYear = (offset: number) => {
    setCurrentViewDate(new Date(year + offset, month, 1));
  };

  // Al abrir, vuelve al mes de la fecha elegida (o del inicio del rango)
  const toggleOpen = () => {
    if (!isOpen) {
      const base = value || rangeStart || "";
      if (base) setCurrentViewDate(new Date(base + "T00:00:00"));
    }
    setIsOpen(!isOpen);
  };

  const handleSelectDate = (iso: string) => {
    onChange(iso);
    setIsOpen(false);
  };

  const now = new Date();
  const todayIso = toIso(now.getFullYear(), now.getMonth(), now.getDate());

  // Format display value
  const displayValue = value
    ? new Date(value + "T00:00:00").toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
    : "Seleccionar fecha";

  return (
    <div className="relative select-none" ref={containerRef}>
      {/* Input Facade */}
      <div
        onClick={toggleOpen}
        className={`w-full bg-[#f0f0f0] rounded-xl px-4 py-2.5 flex items-center justify-between transition-all duration-200 border-none cursor-pointer hover:bg-[#e8e8e8] ${isOpen ? "ring-2 ring-black/10" : ""}`}
      >
        <span className="text-[14px] font-medium text-[#1D1D1F]">{displayValue}</span>
        <FiCalendar className="text-gray-400" size={16} />
      </div>

      {/* Popover Calendar */}
      {isOpen && (
        <div className="absolute top-[calc(100%+8px)] left-0 w-[270px] bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-4 z-[100] animate-in fade-in duration-100 border border-gray-100/50">

          {/* Header: « año anterior · ‹ mes anterior | mes y año | mes siguiente › · año siguiente » */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex">
              <button
                type="button"
                onClick={() => changeYear(-1)}
                title="Año anterior"
                className="w-7 h-7 rounded-full flex justify-center items-center hover:bg-gray-100 transition-colors text-gray-600"
              >
                <LuChevronsLeft size={16} />
              </button>
              <button
                type="button"
                onClick={() => changeMonth(-1)}
                title="Mes anterior"
                className="w-7 h-7 rounded-full flex justify-center items-center hover:bg-gray-100 transition-colors text-gray-600"
              >
                <IoChevronBack size={16} />
              </button>
            </div>

            <span className="text-[13px] font-bold text-black capitalize">
              {MONTHS[month]} {year}
            </span>

            <div className="flex">
              <button
                type="button"
                onClick={() => changeMonth(1)}
                title="Mes siguiente"
                className="w-7 h-7 rounded-full flex justify-center items-center hover:bg-gray-100 transition-colors text-gray-600"
              >
                <IoChevronForward size={16} />
              </button>
              <button
                type="button"
                onClick={() => changeYear(1)}
                title="Año siguiente"
                className="w-7 h-7 rounded-full flex justify-center items-center hover:bg-gray-100 transition-colors text-gray-600"
              >
                <LuChevronsRight size={16} />
              </button>
            </div>
          </div>

          {/* Days of Week */}
          <div className="grid grid-cols-7 mb-2">
            {DAYS_OF_WEEK.map((d) => (
              <div key={d} className="text-center text-[11px] font-bold text-gray-400">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar Grid (sin gap horizontal para que la banda sea continua) */}
          <div className="grid grid-cols-7 gap-y-1">
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const iso = toIso(year, month, day);
              const col = (firstDayOfMonth + i) % 7;

              const selected = value === iso;
              const isToday = iso === todayIso;
              const disabled =
                (!!minDate && iso < minDate) || (!!maxDate && iso > maxDate);
              const inRange =
                !!rangeStart && !!rangeEnd && iso >= rangeStart && iso <= rangeEnd;
              const roundLeft = iso === rangeStart || col === 0 || day === 1;
              const roundRight = iso === rangeEnd || col === 6 || day === daysInMonth;

              return (
                <div
                  key={day}
                  className={`h-8 flex items-center justify-center ${inRange
                    ? `bg-gray-100 ${roundLeft ? "rounded-l-full" : ""} ${roundRight ? "rounded-r-full" : ""}`
                    : ""
                    }`}
                >
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => handleSelectDate(iso)}
                    className={`w-8 h-8 flex items-center justify-center rounded-full text-[13px] font-medium transition-all ${disabled
                      ? "text-gray-300 line-through cursor-not-allowed"
                      : selected
                        ? "bg-black text-white shadow-md font-bold"
                        : isToday
                          ? `text-blue-600 font-bold ${inRange ? "hover:bg-gray-200" : "bg-blue-50"}`
                          : `text-[#1D1D1F] ${inRange ? "hover:bg-gray-200" : "hover:bg-gray-100"}`
                      }`}
                  >
                    {day}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
