import { useState, useRef, useEffect } from "react";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import { FiCalendar } from "react-icons/fi";

type Props = {
  value: string; // YYYY-MM-DD
  onChange: (date: string) => void;
};

const DAYS_OF_WEEK = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"];
const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

export const CustomDatePicker = ({ value, onChange }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse initial value or current date
  const initialDate = value ? new Date(value + "T00:00:00") : new Date();

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

  const handleSelectDate = (day: number) => {
    const newDate = new Date(year, month, day);
    const yyyy = newDate.getFullYear();
    const mm = String(newDate.getMonth() + 1).padStart(2, "0");
    const dd = String(newDate.getDate()).padStart(2, "0");
    onChange(`${yyyy}-${mm}-${dd}`);
    setIsOpen(false);
  };

  // Convert selected string to YYYY-MM-DD to compare highlighting
  const isSelected = (day: number) => {
    if (!value) return false;
    const selectedDateStr = value;
    const currentIterStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return selectedDateStr === currentIterStr;
  };

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
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-[#f5f5f5] rounded-xl px-4 py-2.5 flex items-center justify-between cursor-pointer transition-colors"
      >
        <span className="text-[14px] font-medium text-[#1D1D1F]">{displayValue}</span>
        <FiCalendar className="text-black" size={16} />
      </div>

      {/* Popover Calendar */}
      {isOpen && (
        <div className="absolute bottom-[calc(100%+8px)] left-0 w-[270px] bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-4 z-50 animate-in fade-in zoom-in-95 duration-200 border border-gray-100/50">

          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <span className="text-[14px] font-bold text-black capitalize pl-1">
              {MONTHS[month]} {year}
            </span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => changeMonth(-1)}
                className="w-8 h-8 rounded-full flex justify-center items-center hover:bg-gray-100 transition-colors text-gray-600"
              >
                <IoChevronBack size={16} />
              </button>
              <button
                type="button"
                onClick={() => changeMonth(1)}
                className="w-8 h-8 rounded-full flex justify-center items-center hover:bg-gray-100 transition-colors text-gray-600"
              >
                <IoChevronForward size={16} />
              </button>
            </div>
          </div>

          {/* Days of Week */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS_OF_WEEK.map((d) => (
              <div key={d} className="text-center text-[11px] font-bold text-gray-400">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const selected = isSelected(day);

              const isToday = () => {
                const today = new Date();
                return today.getDate() === day && today.getMonth() === month && Math.abs(today.getFullYear() - year) < 1;
              };

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleSelectDate(day)}
                  className={`w-8 h-8 flex items-center justify-center rounded-full text-[13px] font-medium transition-all ${selected
                    ? "bg-black text-white shadow-md font-bold"
                    : isToday()
                      ? "text-blue-600 bg-blue-50 font-bold"
                      : "text-[#1D1D1F] hover:bg-gray-100"
                    }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
