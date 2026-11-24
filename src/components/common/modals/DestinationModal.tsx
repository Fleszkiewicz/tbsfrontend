import { useState, useEffect } from "react";
import { IoCloseOutline } from "react-icons/io5";
import Swal from "sweetalert2";
import { toast } from "sonner";
import { CustomDatePicker } from "../ui/CustomDatePicker";
import { FieldLabel } from "../ui/FieldLabel";
import { MSG_CAMPOS_OBLIGATORIOS } from "../../../utils/messages";
import { useServices } from "../../../hooks/useServices";
import type { DestinoEntry } from "../../../types/types";
import { getDestinoDateError } from "../../../utils/destinos";

const inputCls =
  "w-full bg-[#f0f0f0] rounded-xl px-4 py-2.5 text-[14px] font-medium text-[#1D1D1F] outline-none focus:ring-2 focus:ring-black/10 transition-all placeholder:text-gray-400 border-none";
const labelCls =
  "block text-[12px] text-gray-400 font-medium mb-1.5 select-none";

const EMPTY: DestinoEntry = {
  destino: "",
  fecha_desde: "",
  fecha_hasta: "",
  servicios: [],
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (destino: DestinoEntry) => void;
  /** Fechas globales de la reserva (YYYY-MM-DD) para validar el rango */
  viajeDesde: string;
  viajeHasta: string;
};

export const DestinationModal = ({
  isOpen,
  onClose,
  onSave,
  viajeDesde,
  viajeHasta,
}: Props) => {
  const { data: services } = useServices();

  const [newDestino, setNewDestino] = useState<DestinoEntry>(EMPTY);
  const [selectedServiceIds, setSelectedServiceIds] = useState<number[]>([]);
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setNewDestino(EMPTY);
      setSelectedServiceIds([]);
      setShowErrors(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const dateError = getDestinoDateError(newDestino, viajeDesde, viajeHasta);
  const nombreVacio = newDestino.destino.trim() === "";

  const toggleDestinoServicio = (serviceId: number) => {
    setSelectedServiceIds((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId],
    );
  };

  const handleSafeClose = () => {
    const hasChanges =
      newDestino.destino !== "" ||
      newDestino.fecha_desde !== "" ||
      newDestino.fecha_hasta !== "" ||
      selectedServiceIds.length > 0;

    if (hasChanges) {
      Swal.fire({
        title: "¿Cerrar formulario?",
        text: "Se perderán todos los datos ingresados para este destino.",
        width: "300px",
        showCancelButton: true,
        confirmButtonText: "Sí, cerrar",
        cancelButtonText: "Cancelar",
        reverseButtons: true,
        backdrop: `rgba(0,0,0,0.3)`,
        color: "#1D1D1F",
        background: "#ffffff",
        customClass: {
          popup:
            "rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 py-5 px-3",
          title: "text-[16px] font-semibold text-black mt-0",
          htmlContainer: "text-[13px] text-gray-500 font-medium mt-1 mb-6 mx-0",
          actions: "flex w-full gap-2 px-3 m-0",
          confirmButton:
            "flex-1 bg-[#FF3B30] hover:bg-[#E3342B] text-white font-semibold py-2.5 rounded-xl transition-colors text-[13px] m-0",
          cancelButton:
            "flex-1 bg-[#e8e8e8] hover:bg-[#dcdcdc] text-black font-semibold py-2.5 rounded-xl transition-colors text-[13px] m-0",
        },
      }).then((result) => {
        if (result.isConfirmed) onClose();
      });
    } else {
      onClose();
    }
  };

  const handleSave = () => {
    if (nombreVacio) {
      setShowErrors(true);
      toast.error(MSG_CAMPOS_OBLIGATORIOS, { id: "validacion" });
      return;
    }
    if (dateError) {
      toast.error(dateError, { id: "validacion" });
      return;
    }

    const detailedServicios = selectedServiceIds.map((id) => {
      const serviceDef = services?.data?.find((s) => s.id === id);
      return {
        servicio_tipo_id: id,
        nombre: serviceDef?.nombre,
        valor: 0,
        moneda_id: serviceDef?.moneda?.toLowerCase() === "usd" ? 2 : 1,
        cotizacion: null,
        pagado_por: "pendiente" as const,
        observacion: null,
      };
    });

    onSave({ ...newDestino, destino: newDestino.destino.trim(), servicios: detailedServicios });
    onClose();
  };

  return (
    <section
      className="fixed inset-0 bg-black/40 z-[1000] flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={handleSafeClose}
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
            onClick={handleSafeClose}
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
              <FieldLabel text="Destino" invalid={showErrors && nombreVacio} />
              <input
                type="text"
                value={newDestino.destino}
                onChange={(e) =>
                  setNewDestino((p) => ({ ...p, destino: e.target.value }))
                }
                placeholder="Ej: Madrid"
                className={inputCls}
                autoFocus
              />
            </div>
            <div className="flex flex-col">
              <label className={labelCls}>Desde</label>
              <CustomDatePicker
                value={newDestino.fecha_desde}
                minDate={viajeDesde || undefined}
                maxDate={viajeHasta || undefined}
                rangeStart={viajeDesde || undefined}
                rangeEnd={viajeHasta || undefined}
                onChange={(val) =>
                  setNewDestino((p) => ({ ...p, fecha_desde: val }))
                }
              />
            </div>
            <div className="flex flex-col">
              <label className={labelCls}>Hasta</label>
              <CustomDatePicker
                value={newDestino.fecha_hasta}
                minDate={viajeDesde || undefined}
                maxDate={viajeHasta || undefined}
                rangeStart={viajeDesde || undefined}
                rangeEnd={viajeHasta || undefined}
                onChange={(val) =>
                  setNewDestino((p) => ({ ...p, fecha_hasta: val }))
                }
              />
            </div>
            {dateError && (
              <p className="text-red-500 text-[12px] font-medium -mt-1">
                {dateError}
              </p>
            )}
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
            className="w-full bg-black hover:bg-gray-900 text-white font-semibold text-[14px] rounded-full py-3 transition-colors active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed select-none"
          >
            Guardar
          </button>
        </div>
      </div>
    </section>
  );
};
