import { useState, useEffect } from "react";
import { IoCloseOutline } from "react-icons/io5";
import { CustomDatePicker } from "./CustomDatePicker";
import { useServices } from "../hooks/useServices";
import type { DestinoEntry } from "../types/types";

const inputCls =
  "w-full bg-[#f0f0f0] rounded-xl px-4 py-2.5 text-[14px] font-medium text-[#1D1D1F] outline-none focus:ring-2 focus:ring-black/10 transition-all placeholder:text-gray-400 border-none";
const labelCls =
  "block text-[12px] text-gray-400 font-medium mb-1.5 select-none";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (destino: DestinoEntry) => void;
};

export const DestinationModal = ({ isOpen, onClose, onSave }: Props) => {
  const { data: services } = useServices();

  const [newDestino, setNewDestino] = useState<DestinoEntry>({
    destino: "",
    fecha_ida: "",
    fecha_vuelta: "",
    servicios: [],
  });
  
  const [selectedServiceIds, setSelectedServiceIds] = useState<number[]>([]);

  useEffect(() => {
    if (isOpen) {
      setNewDestino({ destino: "", fecha_ida: "", fecha_vuelta: "", servicios: [] });
      setSelectedServiceIds([]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleDestinoServicio = (serviceId: number) => {
    setSelectedServiceIds((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleSave = () => {
    if (!newDestino.destino) return;
    
    const detailedServicios = selectedServiceIds.map((id) => {
      const serviceDef = services?.data?.find((s) => s.id === id);
      return {
        id,
        valor: 0,
        moneda: serviceDef?.moneda?.toLowerCase() === "usd" ? 2 : 1,
        cotizacion: null,
        pagado_por: "pendiente" as const,
        observacion: ""
      };
    });
    
    onSave({ ...newDestino, servicios: detailedServicios });
    onClose();
  };

  return (
    <section
      className="fixed inset-0 bg-black/40 z-[1000] flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[520px] bg-white rounded-[20px] shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5">
          <h2 className="text-[20px] font-semibold text-[#1D1D1F]">
            Añadir destino
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-black transition-colors"
          >
            <IoCloseOutline size={22} />
          </button>
        </div>

        <div className="border-t border-gray-100" />

        {/* Body */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col">
              <label className={labelCls}>Destino</label>
              <input
                type="text"
                value={newDestino.destino}
                onChange={(e) => setNewDestino((p) => ({ ...p, destino: e.target.value }))}
                placeholder="Ej: Madrid"
                className={inputCls}
                autoFocus
              />
            </div>
            <div className="flex flex-col">
              <label className={labelCls}>Fecha Ida</label>
              <CustomDatePicker
                value={newDestino.fecha_ida}
                onChange={(val) => setNewDestino((p) => ({ ...p, fecha_ida: val }))}
              />
            </div>
            <div className="flex flex-col">
              <label className={labelCls}>Fecha Vuelta</label>
              <CustomDatePicker
                value={newDestino.fecha_vuelta}
                onChange={(val) => setNewDestino((p) => ({ ...p, fecha_vuelta: val }))}
              />
            </div>
          </div>

          <div className="flex flex-col">
            <label className={labelCls}>Servicios</label>
            <div className="flex flex-col gap-2.5 mt-1">
              {services?.data?.map((service) => (
                <label
                  key={service.id}
                  className="flex items-center gap-2.5 cursor-pointer select-none group"
                >
                  <input
                    type="checkbox"
                    checked={selectedServiceIds.includes(service.id)}
                    onChange={() => toggleDestinoServicio(service.id)}
                    className="form-checkbox h-4 w-4 rounded border-gray-300 text-black focus:ring-black cursor-pointer"
                  />
                  <span className="text-[13px] font-medium text-black capitalize transition-colors">
                    {service.nombre}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-6 py-5">
          <button
            type="button"
            onClick={handleSave}
            disabled={!newDestino.destino}
            className="w-full bg-black hover:bg-gray-900 text-white font-semibold text-[14px] rounded-full py-3 transition-colors active:scale-[0.98] disabled:cursor-not-allowed select-none"
          >
            Guardar
          </button>
        </div>
      </div>
    </section>
  );
};
