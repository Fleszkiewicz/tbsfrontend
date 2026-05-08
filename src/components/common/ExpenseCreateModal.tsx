import { useState, useRef, useEffect } from "react";
import { IoClose, IoChevronDown, IoCheckmark } from "react-icons/io5";
import { CustomDatePicker } from "./CustomDatePicker";

type Props = {
  onClose: () => void;
};

export const ExpenseCreateModal = ({ onClose }: Props) => {
  const [moneda, setMoneda] = useState("ARS");
  const [fecha, setFecha] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsSelectOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      className="w-full max-w-[420px] bg-white rounded-[20px] text-black shadow-2xl relative animate-in zoom-in-95 duration-200"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex justify-between items-center p-5 md:p-6 pb-3 md:pb-4">
        <h2 className="text-[20px] md:text-[24px] font-semibold text-[#1D1D1F]">Añadir Gasto</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-black transition-colors"
        >
          <IoClose className="w-5 h-5" />
        </button>
      </div>
      <div className="border-t border-gray-100 p-5 md:p-6 pt-4 md:pt-5 -mb-5">
      </div>

      {/* Form Area */}
      <div className="flex flex-col gap-3 md:gap-4 px-5 md:px-6 pb-5 md:pb-6">
        {/* Descripción */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] md:text-[13px] font-medium text-gray-500">
            Motivo
          </label>
          <input
            type="text"
            className="w-full bg-[#f5f5f5] rounded-xl px-3 md:px-4 py-2 md:py-2.5 text-[13px] md:text-[14px] font-medium placeholder:text-gray-500 text-[#1D1D1F] focus:outline-none focus:ring-1 focus:ring-gray-300 transition-all"
          />
        </div>

        {/* Dos columnas: Moneda y Cotización */}
        <div className="flex gap-3 md:gap-4">
          <div className="flex flex-col gap-1.5 w-[90px] md:w-[110px]">
            <label className="text-[12px] md:text-[13px] font-medium text-gray-500">Moneda</label>
            <div className="relative select-none" ref={selectRef}>
              <div
                onClick={() => setIsSelectOpen(!isSelectOpen)}
                className="bg-[#f5f5f5] rounded-xl px-3 md:px-4 py-2 md:py-2.5 flex items-center justify-between cursor-pointer"
              >
                <span className="text-[13px] md:text-[14px] font-medium text-[#1D1D1F]">{moneda}</span>
                <IoChevronDown className={`text-gray-400 transition-transform ${isSelectOpen ? "rotate-180" : ""} w-3 h-3 md:w-3.5 md:h-3.5`} />
              </div>

              {isSelectOpen && (
                <div className="absolute top-[calc(100%+8px)] left-0 w-full min-w-[120px] bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.15)] p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 border border-gray-100">
                  {["ARS", "USD"].map((opt) => (
                    <div
                      key={opt}
                      onClick={() => {
                        setMoneda(opt);
                        setIsSelectOpen(false);
                      }}
                      className={`px-3 py-2 text-[13px] md:text-[14px] font-medium cursor-pointer flex justify-between items-center transition-colors rounded-lg ${moneda === opt ? "bg-[#f5f5f5] text-black" : "text-gray-600 hover:bg-[#fcfcfc]"}`}
                    >
                      {opt}
                      {moneda === opt && <IoCheckmark className="text-black w-3.5 h-3.5" />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {moneda === "USD" && (
            <div className="flex flex-col gap-1.5 flex-grow animate-in fade-in duration-200">
              <label className="text-[12px] md:text-[13px] font-medium text-gray-500">Cotización</label>
              <input
                type="text"
                placeholder="0.00"
                className="w-full bg-[#f5f5f5] rounded-xl px-3 md:px-4 py-2 md:py-2.5 text-[13px] md:text-[14px] font-medium placeholder:text-gray-500 text-[#1D1D1F] focus:outline-none focus:ring-1 focus:ring-gray-300 transition-all"
              />
            </div>
          )}
        </div>

        {/* Monto */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] md:text-[13px] font-medium text-gray-500">Monto</label>
          <input
            type="text"
            placeholder="0.00"
            className="w-full bg-[#f5f5f5] rounded-xl px-3 md:px-4 py-2 md:py-2.5 text-[13px] md:text-[14px] font-medium placeholder:text-gray-500 text-[#1D1D1F] focus:outline-none focus:ring-1 focus:ring-gray-300 transition-all"
          />
        </div>


        {/* Fecha */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] md:text-[13px] font-medium text-gray-500">Fecha</label>
          <CustomDatePicker
            value={fecha}
            onChange={setFecha}
          />
        </div>
      </div>

      {/* Footer con línea borde de lado a lado */}
      <div className="border-t border-gray-100 p-5 md:p-6 pt-4 md:pt-5">
        <button
          type="button"
          className="w-full bg-black hover:bg-gray-900 text-white font-semibold text-[13px] md:text-[14px] rounded-full py-2.5 md:py-3 transition-colors active:scale-[0.98]"
        >
          Guardar
        </button>
      </div>
    </div>
  );
};
