import { useState, useEffect } from "react";
import { IoCloseOutline, IoAlertCircleOutline } from "react-icons/io5";
import { CustomSelect } from "../ui/CustomSelect";
import { toast } from "sonner";

type CancelTripModalProps = {
  isOpen: boolean;
  onClose: () => void;
  tripId?: string;
  currentMotivo?: string;
  onConfirm: (motivo: string) => void;
};

const CANCELLATION_REASONS = [
  { label: "Seleccionar motivo", value: "" },
  { label: "Económico", value: "Económico" },
  { label: "Problemas familiares", value: "Problemas familiares" },
  { label: "Sin respuesta del cliente", value: "Sin respuesta del cliente" },
  { label: "Eligió otra agencia / competidor", value: "Eligió otra agencia / competidor" },
  { label: "Cambio de fechas o planes", value: "Cambio de fechas o planes" },
  { label: "Problemas de salud", value: "Problemas de salud" },
  { label: "Otro motivo", value: "Otro motivo" },
];

export const CancelTripModal = ({
  isOpen,
  onClose,
  tripId,
  currentMotivo = "",
  onConfirm,
}: CancelTripModalProps) => {
  const [motivo, setMotivo] = useState(currentMotivo);

  useEffect(() => {
    if (isOpen) {
      setMotivo(currentMotivo);
    }
  }, [isOpen, currentMotivo]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!motivo) {
      toast.error("Por favor, selecciona un motivo de cancelación.");
      return;
    }
    onConfirm(motivo);
    onClose();
  };

  return (
    <section
      className="fixed inset-0 bg-black/40 z-[1000] flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[450px] bg-white rounded-[24px] shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center shrink-0">
              <IoAlertCircleOutline size={22} />
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-[#1D1D1F] leading-snug">
                ¿Deseas cancelar el legajo?
              </h2>
              {tripId && (
                <span className="text-[12px] text-gray-400 font-medium">
                  Legajo {tripId}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-black transition-colors p-1"
          >
            <IoCloseOutline size={22} />
          </button>
        </div>

        <div className="border-t border-gray-100" />

        {/* Body */}
        <div className="p-6 flex flex-col gap-4">
          <p className="text-[13px] text-gray-500 leading-relaxed">
            Esta acción registrará el legajo como cancelado. Selecciona el motivo correspondiente para mantener el registro de la cotización:
          </p>

          <div className="flex flex-col mt-1">
            <label className="block text-[12px] text-gray-400 font-medium mb-1.5 select-none">
              Motivo de cancelación <span className="text-red-500">*</span>
            </label>
            <CustomSelect
              value={motivo}
              onChange={(val) => setMotivo(String(val))}
              options={CANCELLATION_REASONS}
            />
          </div>
        </div>

        <div className="border-t border-gray-100" />

        {/* Footer */}
        <div className="px-6 py-4 flex items-center justify-end gap-3 bg-[#FAFAFA]">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-full text-[13px] font-semibold text-gray-600 hover:text-black hover:bg-gray-200/60 transition-all select-none"
          >
            Volver
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white font-semibold text-[13px] px-6 py-2.5 rounded-full transition-all shadow-sm select-none"
          >
            Confirmar cancelación
          </button>
        </div>
      </div>
    </section>
  );
};
