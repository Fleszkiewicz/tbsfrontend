import { useState, useEffect } from "react";
import { toast } from "sonner";
import { IoCloseOutline, IoLocationOutline } from "react-icons/io5";
import { IoIosAdd } from "react-icons/io";
import { CustomDatePicker } from "./CustomDatePicker";
import { CustomSelect } from "./CustomSelect";
import { useServices } from "../hooks/useServices";
import type { DestinoEntry, DestinoServiceDetail } from "../types/types";

const inputCls =
  "w-full bg-[#f0f0f0] rounded-xl px-4 py-2.5 text-[14px] font-medium text-[#1D1D1F] outline-none focus:ring-2 focus:ring-black/10 transition-all placeholder:text-gray-400 border-none";
const labelCls =
  "block text-[12px] text-gray-400 font-medium mb-1.5 select-none";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (destino: DestinoEntry) => void;
  initialData: DestinoEntry;
};

export const DestinationEditModal = ({ isOpen, onClose, onSave, initialData }: Props) => {
  const { data: services } = useServices();
  const [newDestino, setNewDestino] = useState<DestinoEntry>(initialData);

  useEffect(() => {
    if (isOpen && initialData) {
      // Compatibility mapping if it comes from an older version that stored numbers
      const mappedServicios: DestinoServiceDetail[] = initialData.servicios.map((s: any) => {
        if (typeof s === "number") {
          const serviceDef = services?.data?.find(x => x.id === s);
          return {
            id: s,
            valor: 0,
            moneda: serviceDef?.moneda?.toLowerCase() === "usd" ? 2 : 1,
            cotizacion: null,
            pagado_por: "pendiente",
            observacion: ""
          };
        }
        return s;
      });
      setNewDestino({ ...initialData, servicios: mappedServicios });
    }
  }, [isOpen, initialData, services]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(newDestino);
    onClose();
  };

  const addService = () => {
    setNewDestino(prev => ({
      ...prev,
      servicios: [
        ...prev.servicios,
        {
          id: services?.data?.[0]?.id ?? 0,
          valor: 0,
          moneda: 1,
          cotizacion: null,
          pagado_por: "pendiente",
          observacion: ""
        }
      ]
    }));
    toast.success("Servicio añadido.");
  };

  const updateService = (index: number, field: keyof DestinoServiceDetail, value: any) => {
    setNewDestino(prev => {
      const newServicios = [...prev.servicios];
      newServicios[index] = { ...newServicios[index], [field]: value };
      return { ...prev, servicios: newServicios };
    });
  };

  return (
    <section
      className="fixed inset-0 bg-black/40 z-[1000] flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[1250px] bg-white rounded-[20px] shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 shrink-0 rounded-t-[20px]">
          <h2 className="text-[20px] font-semibold text-[#1D1D1F] capitalize flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
              <IoLocationOutline size={18} className="text-black" />
            </div>
            Destino: {newDestino.destino}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-black transition-colors"
          >
            <IoCloseOutline size={22} />
          </button>
        </div>

        <div className="border-t border-gray-100 shrink-0" />

        <div className="p-6 md:p-8 overflow-y-auto flex-1 pb-40" style={{ scrollbarWidth: "none" }}>
          {/* Dates */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-6">
              <div className="flex flex-col w-[200px]">
                <label className={labelCls}>Desde</label>
                <CustomDatePicker
                  value={newDestino.fecha_ida}
                  onChange={(val) => setNewDestino(p => ({ ...p, fecha_ida: val }))}
                />
              </div>
              <div className="flex flex-col w-[200px]">
                <label className={labelCls}>Hasta</label>
                <CustomDatePicker
                  value={newDestino.fecha_vuelta}
                  onChange={(val) => setNewDestino(p => ({ ...p, fecha_vuelta: val }))}
                />
              </div>
            </div>
          </div>

          {/* Title Servicios */}
          <div className="mb-2">
            <label className={labelCls}>Servicios</label>
          </div>

          {/* Table */}
          <div className="bg-white border border-gray-200 rounded-2xl mb-4">
            <table className="w-full text-[14px] text-left border-collapse">
              <thead>
                <tr className="bg-[#1D1D1F] text-white">
                  <th className="px-4 py-2.5 font-semibold rounded-tl-2xl">Nombre</th>
                  <th className="px-4 py-2.5 font-semibold">Valor</th>
                  <th className="px-4 py-2.5 font-semibold">Moneda</th>
                  <th className="px-4 py-2.5 font-semibold">Cotización</th>
                  <th className="px-4 py-2.5 font-semibold">Pagado por</th>
                  <th className="px-4 py-2.5 font-semibold">Observación</th>
                  <th className="px-4 py-2.5 font-semibold text-center w-[60px] rounded-tr-2xl">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {newDestino.servicios.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-[13px] text-gray-500 font-medium">
                      No hay servicios agregados aún.
                    </td>
                  </tr>
                ) : (
                  newDestino.servicios.map((s, idx) => (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      {/* NOMBRE */}
                      <td className="px-2 md:px-4 py-3 align-top min-w-[180px]">
                        <CustomSelect
                          size="sm"
                          value={s.id}
                          onChange={(val) => updateService(idx, "id", Number(val))}
                          options={services?.data?.map(serv => ({ label: serv.nombre, value: serv.id })) || []}
                        />
                      </td>
                      {/* VALOR */}
                      <td className="px-2 md:px-4 py-3 align-top w-[120px]">
                        <input
                          type="text"
                          className="w-full bg-[#f0f0f0] rounded-lg px-2.5 py-1 text-[14px] font-medium text-[#1D1D1F] outline-none focus:ring-2 focus:ring-black/10 transition-all border-none"
                          value={s.valor ? new Intl.NumberFormat("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(s.valor) : ""}
                          onChange={(e) => {
                            const num = Number(e.target.value.replace(/\D/g, ""));
                            updateService(idx, "valor", num);
                          }}
                          placeholder="0"
                        />
                      </td>
                      {/* MONEDA */}
                      <td className="px-2 md:px-4 py-3 align-top w-[100px]">
                        <CustomSelect
                          size="sm"
                          value={s.moneda}
                          onChange={(val) => updateService(idx, "moneda", Number(val))}
                          options={[
                            { label: "ARS", value: 1 },
                            { label: "USD", value: 2 },
                          ]}
                        />
                      </td>
                      {/* COTIZACIÓN */}
                      <td className="px-2 md:px-4 py-3 align-top w-[110px]">
                        {s.moneda === 2 ? (
                          <input
                            type="text"
                            className="w-full bg-[#f0f0f0] rounded-lg px-2.5 py-3 text-[14px] font-medium text-[#1D1D1F] outline-none focus:ring-2 focus:ring-black/10 transition-all border-none"
                            value={s.cotizacion ? new Intl.NumberFormat("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(s.cotizacion) : ""}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, "");
                              updateService(idx, "cotizacion", val ? Number(val) : null);
                            }}
                            placeholder="-"
                          />
                        ) : (
                          <div className="py-1 px-2.5 text-gray-400 text-center">-</div>
                        )}
                      </td>
                      {/* PAGO */}
                      <td className="px-2 md:px-4 py-3 align-top w-[120px]">
                        <CustomSelect
                          size="sm"
                          value={s.pagado_por}
                          onChange={(val) => updateService(idx, "pagado_por", val)}
                          options={[
                            { label: "Pendiente", value: "pendiente" },
                            { label: "Pablo", value: "pablo" },
                            { label: "Soledad", value: "soledad" },
                            { label: "Mariana", value: "mariana" },
                            { label: "Mixto", value: "mixto" }
                          ]}
                        />
                      </td>
                      {/* OBS */}
                      <td className="px-2 md:px-4 py-3 align-top min-w-[350px]">
                        <input
                          type="text"
                          className="w-full bg-[#f0f0f0] rounded-lg px-2.5 py-1 text-[13px] font-light text-[#1D1D1F] outline-none focus:ring-2 focus:ring-black/10 transition-all border-none"
                          value={s.observacion ?? ""}
                          onChange={(e) => updateService(idx, "observacion", e.target.value)}
                          placeholder="-"
                        />
                      </td>
                      {/* ACCIONES */}
                      <td className="px-2 md:px-4 py-2.5 align-top text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setNewDestino(prev => {
                              const newServicios = prev.servicios.filter((_, i) => i !== idx);
                              return { ...prev, servicios: newServicios };
                            });
                            toast.success("Servicio eliminado.");
                          }}
                          className="p-1.5 text-gray-500 hover:text-red-600 rounded-lg transition-colors mt-0.5 inline-flex"
                          title="Eliminar servicio"
                        >
                          <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="16" width="16" xmlns="http://www.w3.org/2000/svg"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                        </button>
                      </td>
                    </tr>
                  )))}
              </tbody>
            </table>

            <button
              type="button"
              onClick={addService}
              className="w-full flex items-center justify-center gap-1.5 py-3 text-[13px] font-medium text-gray-500 hover:bg-gray-100 hover:text-black transition-colors border-t border-gray-100"
            >
              <IoIosAdd size={18} />
              Añadir servicio
            </button>
          </div>



        </div>

        <div className="border-t border-gray-100 shrink-0" />
        {/* Botón Guardar */}
        <div className=" flex justify-center py-5 rounded-b-[20px]">
          <button
            type="button"
            onClick={handleSave}
            className="px-10 py-3 rounded-full bg-black hover:bg-gray-900 text-white font-semibold text-[14px] transition-colors active:scale-[0.98] shadow-sm flex items-center gap-2"
          >
            Guardar cambios
          </button>
        </div>
      </div>
    </section>
  );
};
