import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import {
  IoArrowBack,
  IoAirplaneOutline,
  IoLocationOutline,
  IoPeopleOutline,
  IoAddOutline,
  IoAttach
} from "react-icons/io5";
import { LuTrash2, LuFileText } from "react-icons/lu";


import { formattedAmount } from "../utils/utils";
import { useServices } from "../hooks/useServices";
import { useTrip } from "../hooks/useTrips";
import { CustomDatePicker } from "../common/ui/CustomDatePicker";
import { CustomSelect } from "../common/ui/CustomSelect";
import { Spinner } from "../common/ui/widget/Spinner";
import { Table } from "../layout/Table";
import { DestinationModal } from "../common/modals/DestinationModal";
import { DestinationEditModal } from "../common/modals/DestinationEditModal";
import { DestinationsTable } from "../common/tables/DestinationsTable";
import { ArchiveTable } from "../common/tables/ArchiveTable";
import { FileUploadModal } from "../common/modals/FileUploadModal";
import type { DestinoEntry, TripFile } from "../types/types";

// ─── Shared style tokens ──────────────────────────────────────────────────────
const inputCls =
  "w-full bg-[#f0f0f0] rounded-xl px-3 md:px-4 py-2 md:py-2.5 text-[13px] md:text-[14px] font-medium text-[#1D1D1F] outline-none focus:ring-2 focus:ring-black/10 transition-all placeholder:text-gray-400 border-none";
const selectCls =
  "w-full bg-[#f0f0f0] rounded-xl px-3 md:px-4 py-2 md:py-2.5 text-[13px] md:text-[14px] font-medium text-[#1D1D1F] outline-none focus:ring-2 focus:ring-black/10 transition-all appearance-none cursor-pointer border-none";
const labelCls =
  "block text-[11px] md:text-[12px] text-gray-400 font-medium mb-1 md:mb-1.5 select-none";

// ─── Section Card wrapper ─────────────────────────────────────────────────────
function SectionCard({
  icon,
  title,
  action,
  children,
  className = "",
  bodyClassName = "",
}: {
  icon: React.ReactNode;
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col ${className}`}>
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-2.5">
          <span className="text-gray-400">{icon}</span>
          <h2 className="text-[15px] font-semibold text-[#1D1D1F]">{title}</h2>
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className={`p-6 flex-1 ${bodyClassName}`}>{children}</div>
    </div>
  );
}



function Trip() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: services } = useServices();
  const { data: tripResponse, isLoading } = useTrip(id!);

  const tripData = tripResponse?.data;

  // ── Local state: destinos ──
  const [selectedMoneda, setSelectedMoneda] = useState<number>(0);
  const [destinos, setDestinos] = useState<DestinoEntry[]>([]);
  const [showDestinoModal, setShowDestinoModal] = useState(false);
  const [editingDestinoIndex, setEditingDestinoIndex] = useState<number | null>(null);

  const handleSaveDestino = (destino: DestinoEntry) => {
    if (editingDestinoIndex !== null) {
      setDestinos((prev) => {
        const updated = [...prev];
        updated[editingDestinoIndex] = destino;
        return updated;
      });
      toast.success("Destino actualizado.");
    } else {
      setDestinos((prev) => [...prev, destino]);
      toast.success("Destino añadido.");
    }
  };

  const handleEditDestino = (idx: number) => {
    setEditingDestinoIndex(idx);
  };

  const handleRemoveDestino = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setDestinos((prev) => prev.filter((_, i) => i !== idx));
    toast.success("Destino eliminado.");
  };

  // ── Local state: pasajeros ──
  const [extraPasajeros, setExtraPasajeros] = useState<number[]>([]);
  const addPasajero = () => {
    setExtraPasajeros((p) => [...p, Date.now()]);
    toast.success("Pasajero añadido.");
  };
  const removePasajero = (passengerId: number) => {
    setExtraPasajeros((p) => p.filter((x) => x !== passengerId));
    setPassengerDates((prev) => {
      const copy = { ...prev };
      delete copy[passengerId.toString()];
      return copy;
    });
    toast.success("Pasajero eliminado.");
  };

  const [passengerDates, setPassengerDates] = useState<Record<string, { dni: string; pasaporte: string }>>({});
  const handleDateChange = (passengerId: string, field: "dni" | "pasaporte", value: string) => {
    setPassengerDates((prev) => ({
      ...prev,
      [passengerId]: {
        ...(prev[passengerId] || { dni: "", pasaporte: "" }),
        [field]: value,
      },
    }));
  };

  const [files, setFiles] = useState<TripFile[]>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const handleFileUpload = (newFiles: File[], category: string) => {
    const mappedFiles: TripFile[] = newFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      nombre: file.name,
      categoria: category,
      url: URL.createObjectURL(file),
      fecha: new Date().toLocaleDateString("es-AR")
    }));
    setFiles(prev => [...prev, ...mappedFiles]);
    toast.success(`${newFiles.length} archivos subidos correctamente.`);
  };
  const handleFileDelete = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    toast.success("Archivo eliminado.");
  };

  const getExpirationBadge = (dateStr: string | undefined) => {
    if (!dateStr) return null;
    const expDate = new Date(dateStr + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (expDate < today) {
      return (
        <span className="ml-2 text-[10px] font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
          Vencido
        </span>
      );
    }

    const twoMonthsFromNow = new Date(today);
    twoMonthsFromNow.setMonth(today.getMonth() + 2);

    if (expDate <= twoMonthsFromNow) {
      return (
        <span className="ml-2 text-[10px] font-bold text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
          Por expirar
        </span>
      );
    }

    return null;
  };



  // Set default form values once tripData is loaded
  const form = useForm({
    defaultValues: {
      fecha: "",
      fecha_ida: "",
      fecha_vuelta: "",
      destino: "",
      apellido: "",
      moneda: 0,
      valor_total: null,
      valor_total_usd: null,
      cotizacion: null,
    } as any,
    onSubmit: async () => {
      // Logic for saving modifications later
      toast.info("Función de guardar en desarrollo");
    },
  });

  // Force re-initialization of form values when tripData loads
  useEffect(() => {
    if (tripData) {
      form.setFieldValue("fecha", tripData.fecha ? tripData.fecha.split("T")[0] : "");
      form.setFieldValue("fecha_ida", tripData.fecha_ida ? tripData.fecha_ida.split("T")[0] : "");
      form.setFieldValue("fecha_vuelta", tripData.fecha_vuelta ? tripData.fecha_vuelta.split("T")[0] : "");
      form.setFieldValue("destino", tripData.destino?.toLowerCase() || "");
      form.setFieldValue("apellido", tripData.apellido || "");

      const monedaMap: Record<string, number> = { "ars": 1, "usd": 2, "mixto": 3 };
      const numMoneda = tripData.moneda ? (monedaMap[tripData.moneda.toLowerCase()] || 0) : 0;
      form.setFieldValue("moneda", numMoneda);
      setSelectedMoneda(numMoneda);

      form.setFieldValue("valor_total", tripData.valor_total || null);
      form.setFieldValue("valor_total_usd", tripData.valor_total_usd || null);
      form.setFieldValue("cotizacion", tripData.cotizacion || null);
    }
  }, [tripData, form]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-100px)]">
        <Spinner size={50} text="Cargando detalles..." />
      </div>
    );
  }

  return (
    <div className="max-w-[900px] mx-auto px-4 pt-24 md:pt-28 pb-16">
      {/* ── Header ── */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <button
            onClick={() => navigate("/home")}
            className="flex items-center gap-1.5 text-gray-400 hover:text-black transition-colors text-[13px] font-medium mb-3 select-none"
          >
            <IoArrowBack size={15} />
            Volver
          </button>
          <h1 className="text-[29px] md:text-[32px] lg:text-[35px] font-bold text-[#1D1D1F] tracking-tight select-none cursor-default">
            Legajo {id}
          </h1>
        </div>

        <button
          type="button"
          onClick={() => form.handleSubmit()}
          className="bg-black text-white font-semibold text-[12px] md:text-[14px] px-4 md:px-6 py-2 md:py-2.5 rounded-full hover:bg-gray-800 active:scale-[0.97] transition-all shadow-sm select-none"
        >
          Guardar cambios
        </button>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        className="flex flex-col gap-4"
      >
        {/* ══ SECCIÓN 1: Información de viaje ══ */}
        <SectionCard
          icon={
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
              <IoAirplaneOutline size={18} className="text-black" />
            </div>
          }
          title="Información de viaje"
        >
          <div className="grid grid-cols-2 md:grid-cols-6 gap-5">
            {/* Fila 1: Creación | Inicio | Fin */}
            <form.Field name="fecha">
              {(field) => (
                <div className="flex flex-col col-span-1 md:col-span-2">
                  <label className={labelCls}>Creación de reserva</label>
                  <CustomDatePicker
                    value={field.state.value || ""}
                    onChange={(val) => field.handleChange(val)}
                  />
                </div>
              )}
            </form.Field>

            <form.Field name="fecha_ida">
              {(field) => (
                <div className="flex flex-col col-span-1 md:col-span-2">
                  <label className={labelCls}>Fecha de inicio</label>
                  <CustomDatePicker
                    value={field.state.value || ""}
                    onChange={(val) => field.handleChange(val)}
                  />
                </div>
              )}
            </form.Field>

            <form.Field name="fecha_vuelta">
              {(field) => (
                <div className="flex flex-col col-span-1 md:col-span-2">
                  <label className={labelCls}>Fecha de fin</label>
                  <CustomDatePicker
                    value={field.state.value || ""}
                    onChange={(val) => field.handleChange(val)}
                  />
                </div>
              )}
            </form.Field>

            {/* Fila 2: Tipo de destino | Sucursal | Pago */}
            <form.Field name="destino">
              {(field) => (
                <div className="flex flex-col col-span-1 md:col-span-2">
                  <label className={labelCls}>Tipo de destino</label>
                  <CustomSelect
                    value={field.state.value || ""}
                    onChange={(val) => field.handleChange(val)}
                    options={[
                      { label: "Seleccionar", value: "" },
                      { label: "Internacional", value: "internacional" },
                      { label: "Nacional", value: "nacional" },
                    ]}
                  />
                </div>
              )}
            </form.Field>

            <div className="flex flex-col col-span-1 md:col-span-2">
              <label className={labelCls}>Sucursal</label>
              <CustomSelect
                value=""
                onChange={() => { }}
                options={[
                  { label: "Seleccionar", value: "" },
                  { label: "Baradero", value: "Baradero" },
                  { label: "Hurlingham", value: "Hurlingham" },
                ]}
              />
            </div>

            <div className="flex flex-col col-span-1 md:col-span-2">
              <label className={labelCls}>Pago</label>
              <CustomSelect
                value=""
                onChange={() => { }}
                options={[
                  { label: "Seleccionar", value: "" },
                  { label: "Contado", value: "Contado" },
                  { label: "Cuotas", value: "Cuotas" },
                  { label: "Financiacion", value: "Financiacion" },
                ]}
              />
            </div>

            {/* Fila 3+: Detalle económico */}
            <form.Field
              name="moneda"
              validators={{
                onSubmit: ({ value }) => {
                  if (!value) return "La moneda es obligatoria";
                },
              }}
            >
              {(field) => (
                <div className="flex flex-col col-span-1 md:col-span-3">
                  <label className={labelCls}>Tipo de moneda</label>
                  <CustomSelect
                    value={field.state.value ?? 0}
                    onChange={(val) => {
                      const numVal = Number(val) as 0 | 1 | 2 | 3;
                      field.handleChange(numVal);
                      setSelectedMoneda(numVal);
                      if (numVal === 2 || numVal === 3) {
                        form.setFieldValue("cotizacion", 0);
                      } else {
                        form.setFieldValue("cotizacion", null);
                      }
                    }}
                    options={[
                      { label: "Seleccionar", value: 0 },
                      { label: "ARS", value: 1 },
                      { label: "USD", value: 2 },
                      { label: "Mixto", value: 3 },
                    ]}
                  />
                  {field.state.meta.errors.length > 0 && (
                    <em className="text-red-500 text-[12px] mt-1 font-medium">{field.state.meta.errors.join(", ")}</em>
                  )}
                </div>
              )}
            </form.Field>

            {(selectedMoneda === 1 || selectedMoneda === 3) ? (
              <form.Field
                name="valor_total"
                validators={{
                  onSubmit: ({ value }) => {
                    if (!value) return "El valor total ARS es obligatorio";
                  },
                }}
              >
                {(field) => (
                  <div className="flex flex-col col-span-1 md:col-span-3">
                    <label className={labelCls}>Valor total ARS</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[14px] font-semibold text-gray-400">
                        $
                      </span>
                      <input
                        type="text"
                        value={
                          field.state.value
                            ? new Intl.NumberFormat("es-AR", {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0,
                            }).format(field.state.value)
                            : ""
                        }
                        onChange={(e) => {
                          const soloNumeros = e.target.value.replace(/\D/g, "");
                          field.handleChange(Number(soloNumeros));
                        }}
                        placeholder="0"
                        className={`${inputCls} !pl-8`}
                      />
                    </div>
                    {field.state.meta.errors.length > 0 && (
                      <em className="text-red-500 text-[12px] mt-1 font-medium">{field.state.meta.errors.join(", ")}</em>
                    )}
                  </div>
                )}
              </form.Field>
            ) : (
              <div className="hidden md:block col-span-1 md:col-span-3"></div>
            )}

            {(selectedMoneda === 2 || selectedMoneda === 3) ? (
              <form.Field
                name="cotizacion"
                validators={{
                  onChange: ({ value }) => {
                    if (!value || Number(value) <= 0) return "La cotización debe ser mayor a 0";
                  },
                  onSubmit: ({ value }) => {
                    if (!value || Number(value) <= 0) return "La cotización es obligatoria y debe ser mayor a 0";
                  },
                }}
              >
                {(field) => (
                  <div className="flex flex-col col-span-1 md:col-span-3">
                    <label className={labelCls}>Cotización USD / ARS</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[14px] font-semibold text-gray-400">
                        $
                      </span>
                      <input
                        type="text"
                        value={
                          typeof field.state.value === "number"
                            ? new Intl.NumberFormat("es-AR", {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0,
                            }).format(field.state.value)
                            : ""
                        }
                        onChange={(e) => {
                          const soloNumeros = e.target.value.replace(/\D/g, "");
                          field.handleChange(Number(soloNumeros));
                        }}
                        placeholder="0"
                        className={`${inputCls} !pl-8`}
                      />
                    </div>
                    {field.state.meta.errors.length > 0 && (
                      <em className="text-red-500 text-[12px] mt-1 font-medium">{field.state.meta.errors.join(", ")}</em>
                    )}
                  </div>
                )}
              </form.Field>
            ) : (
              <div className="hidden md:block col-span-1 md:col-span-3"></div>
            )}

            {(selectedMoneda === 2 || selectedMoneda === 3) && (
              <form.Field
                name="valor_total_usd"
                validators={{
                  onSubmit: ({ value }) => {
                    if (!value) return "El valor total USD es obligatorio";
                  },
                }}
              >
                {(field) => (
                  <div className="flex flex-col col-span-1 md:col-span-3">
                    <label className={labelCls}>Valor total USD</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[14px] font-semibold text-gray-400">
                        US$
                      </span>
                      <input
                        type="text"
                        value={
                          field.state.value
                            ? new Intl.NumberFormat("es-AR", {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0,
                            }).format(field.state.value)
                            : ""
                        }
                        onChange={(e) => {
                          const soloNumeros = e.target.value.replace(/\D/g, "");
                          field.handleChange(Number(soloNumeros));
                        }}
                        placeholder="0"
                        className={`${inputCls} !pl-12`}
                      />
                    </div>
                    {field.state.meta.errors.length > 0 && (
                      <em className="text-red-500 text-[12px] mt-1 font-medium">{field.state.meta.errors.join(", ")}</em>
                    )}
                  </div>
                )}
              </form.Field>
            )}

          </div>
        </SectionCard>

        {/* ══ SECCIÓN: Detalles económicos (Lectura) ══ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tarjeta ARS */}
          {(tripData?.moneda === "ars" || tripData?.moneda === "mixto") && (
            <SectionCard
              className="h-full"
              bodyClassName="flex flex-col"
              icon={
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <span className="font-bold text-black text-[13px]">$</span>
                </div>
              }
              title="Detalle económico ARS"
            >
              <div className="flex flex-col gap-5 mb-3">
                <div className="flex justify-between items-center -mb-3 -mt-2">
                  <span className="text-gray-500 font-medium text-[14px]">Moneda</span>
                  <span className="font-bold text-[#1D1D1F] uppercase text-[14px]">ARS</span>
                </div>
                <div className="flex justify-between items-center -mb-3">
                  <span className="text-gray-500 font-medium text-[14px]">Valor total</span>
                  <span className="font-bold text-[#1D1D1F] text-[14px]">
                    ${tripData?.valor_total != null ? formattedAmount(tripData.valor_total) : 0}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[14px]">
                  <span className="text-gray-500 font-medium">Costo</span>
                  <span className="font-bold text-[#1D1D1F]">
                    ${tripData?.costo != null ? formattedAmount(tripData.costo) : 0}
                  </span>
                </div>
              </div>

              <div className="mt-auto flex justify-between items-center text-[14px] pt-4 border-t border-gray-100 -mb-2">
                <span className="text-gray-500 font-medium">Ganancia</span>
                <span className={`font-bold ${(tripData?.ganancia ?? 0) < 0 ? "text-red-500" : "text-green-500"}`}>
                  ${tripData?.ganancia != null ? formattedAmount(tripData.ganancia) : 0}
                </span>
              </div>
            </SectionCard>
          )}

          {/* Tarjeta USD */}
          {(tripData?.moneda === "usd" || tripData?.moneda === "mixto") && (
            <SectionCard
              className="h-full"
              bodyClassName="flex flex-col"
              icon={
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <span className="font-bold text-black text-[15px]">$</span>
                </div>
              }
              title="Detalle económico USD"
            >
              <div className="flex flex-col gap-5 mb-3">
                <div className="flex justify-between items-center text-[14px] -mb-3 -mt-2">
                  <span className="text-gray-500 font-medium">Moneda</span>
                  <span className="font-bold text-[#1D1D1F] uppercase">USD</span>
                </div>
                {tripData?.moneda === "mixto" && tripData?.cotizacion && (
                  <div className="flex justify-between items-center text-[14px] -mb-3">
                    <span className="text-gray-500 font-medium">Cambio USD/ARS</span>
                    <span className="font-bold text-[#1D1D1F]">
                      ${formattedAmount(tripData.cotizacion)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center text-[14px] -mb-3">
                  <span className="text-gray-500 font-medium">Valor total</span>
                  <span className="font-bold text-[#1D1D1F]">
                    USD {tripData?.valor_total_usd != null ? formattedAmount(tripData.valor_total_usd) : 0}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[14px] ">
                  <span className="text-gray-500 font-medium">Costo</span>
                  <span className="font-bold text-[#1D1D1F]">
                    USD {tripData?.costo_usd != null ? formattedAmount(tripData.costo_usd) : 0}
                  </span>
                </div>
              </div>

              <div className="mt-auto flex justify-between items-center text-[14px] pt-4 border-t border-gray-100 -mb-2">
                <span className="text-gray-500 font-medium">Ganancia</span>
                <span className={`font-bold ${(tripData?.ganancia_usd ?? 0) < 0 ? "text-red-500" : "text-[#4F86F7]"}`}>
                  USD {tripData?.ganancia_usd != null ? formattedAmount(tripData.ganancia_usd) : 0}
                </span>
              </div>
            </SectionCard>
          )}
        </div>

        {/* ══ SECCIÓN 2: Información de destino ══ */}
        <SectionCard
          icon={
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
              <IoLocationOutline size={18} className="text-black" />
            </div>
          }
          title="Información de destino"
        >
          {/* Tabla de destinos */}
          <div className="mb-4">
            <DestinationsTable
              destinos={destinos}
              onAdd={() => {
                setEditingDestinoIndex(null);
                setShowDestinoModal(true);
              }}
              onEdit={handleEditDestino}
              onRemove={handleRemoveDestino}
            />
          </div>
        </SectionCard>

        {/* ══ SECCIÓN 3: Información de pasajeros ══ */}
        <SectionCard
          icon={
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
              <IoPeopleOutline size={18} className="text-black" />
            </div>
          }
          title="Información de pasajeros"
        >
          <div className="flex flex-col gap-4">

            {/* ── Pasajero 1 ── */}
            <div className="border border-gray-200 rounded-2xl p-5">
              <p className="text-[14px] font-semibold text-[#1D1D1F] mb-4 select-none">
                Pasajero 1  -  Titular de la reserva
              </p>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                {/* Fila 1: Nombre | Apellido | Tipo */}
                <div className="flex flex-col col-span-1 md:col-span-2">
                  <label className={labelCls}>Nombre</label>
                  <input type="text" placeholder="Nombre" className={inputCls} />
                </div>

                <form.Field name="apellido">
                  {(field) => (
                    <div className="flex flex-col col-span-1 md:col-span-2">
                      <label className={labelCls}>Apellido</label>
                      <input
                        type="text"
                        placeholder="Apellido"
                        value={field.state.value || ""}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className={inputCls}
                      />
                    </div>
                  )}
                </form.Field>

                <div className="flex flex-col col-span-1 md:col-span-2">
                  <label className={labelCls}>Edad</label>
                  <CustomSelect
                    value=""
                    onChange={() => { }}
                    options={[
                      { label: "Seleccionar", value: "" },
                      { label: "Infante (0-2)", value: "infante" },
                      { label: "Menor (2-11)", value: "menor" },
                      { label: "Adulto (+12)", value: "adulto" },
                      { label: "Adulto mayor (+65)", value: "mayor" },
                    ]}
                  />
                </div>
                <div className="flex flex-col md:hidden"></div>

                {/* Fila 2: DNI | Vencimiento DNI */}
                <div className="flex flex-col col-span-1 md:col-span-3">
                  <label className={labelCls}>DNI</label>
                  <input type="text" placeholder="00.000.000" className={inputCls} />
                </div>
                <div className="flex flex-col col-span-1 md:col-span-3">
                  <label className={labelCls}>
                    Vencimiento DNI
                    {getExpirationBadge(passengerDates["p1"]?.dni)}
                  </label>
                  <CustomDatePicker
                    value={passengerDates["p1"]?.dni || ""}
                    onChange={(val) => handleDateChange("p1", "dni", val)}
                  />
                </div>

                {/* Fila 3: Pasaporte | Vencimiento Pasaporte */}
                <div className="flex flex-col col-span-1 md:col-span-3">
                  <label className={labelCls}>Pasaporte</label>
                  <input type="text" placeholder="AAA000000" className={inputCls} />
                </div>
                <div className="flex flex-col col-span-1 md:col-span-3">
                  <label className={labelCls}>
                    Vencimiento Pasaporte
                    {getExpirationBadge(passengerDates["p1"]?.pasaporte)}
                  </label>
                  <CustomDatePicker
                    value={passengerDates["p1"]?.pasaporte || ""}
                    onChange={(val) => handleDateChange("p1", "pasaporte", val)}
                  />
                </div>

                {/* Fila 4: Email | Contacto */}
                <div className="flex flex-col col-span-1 md:col-span-3">
                  <label className={labelCls}>Email</label>
                  <input type="email" placeholder="correo@email.com" className={inputCls} />
                </div>
                <div className="flex flex-col col-span-1 md:col-span-3">
                  <label className={labelCls}>Contacto</label>
                  <input type="text" placeholder="+54 11 0000-0000" className={inputCls} />
                </div>
              </div>
            </div>

            {/* ── Pasajeros adicionales (UI only) ── */}
            {extraPasajeros.map((id, idx) => (
              <div key={id} className="border border-gray-200 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[14px] font-semibold text-[#1D1D1F] select-none">
                    Pasajero {idx + 2}
                  </p>
                  <button
                    type="button"
                    onClick={() => removePasajero(id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                    title="Eliminar pasajero"
                  >
                    <LuTrash2 size={16} />
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                  {/* Fila 1: Nombre | Apellido | Tipo */}
                  <div className="flex flex-col col-span-1 md:col-span-2">
                    <label className={labelCls}>Nombre</label>
                    <input type="text" placeholder="Nombre" className={inputCls} />
                  </div>
                  <div className="flex flex-col col-span-1 md:col-span-2">
                    <label className={labelCls}>Apellido</label>
                    <input type="text" placeholder="Apellido" className={inputCls} />
                  </div>
                  <div className="flex flex-col col-span-1 md:col-span-2">
                    <label className={labelCls}>Tipo de pasajero</label>
                    <CustomSelect
                      value=""
                      onChange={() => { }}
                      options={[
                        { label: "Seleccionar", value: "" },
                        { label: "Adulto (12+)", value: "adulto" },
                        { label: "Menor (2-11)", value: "menor" },
                        { label: "Infante (0-2)", value: "infante" },
                        { label: "Adulto mayor (65+)", value: "mayor" },
                      ]}
                    />
                  </div>
                  <div className="flex flex-col md:hidden"></div>
                  {/* Fila 2: DNI | Vencimiento DNI */}
                  <div className="flex flex-col col-span-1 md:col-span-3">
                    <label className={labelCls}>DNI</label>
                    <input type="text" placeholder="00.000.000" className={inputCls} />
                  </div>
                  <div className="flex flex-col col-span-1 md:col-span-3">
                    <label className={labelCls}>
                      Vencimiento DNI
                      {getExpirationBadge(passengerDates[id.toString()]?.dni)}
                    </label>
                    <CustomDatePicker
                      value={passengerDates[id.toString()]?.dni || ""}
                      onChange={(val) => handleDateChange(id.toString(), "dni", val)}
                    />
                  </div>
                  {/* Fila 3: Pasaporte | Vencimiento Pasaporte */}
                  <div className="flex flex-col col-span-1 md:col-span-3">
                    <label className={labelCls}>Pasaporte</label>
                    <input type="text" placeholder="AAA000000" className={inputCls} />
                  </div>
                  <div className="flex flex-col col-span-1 md:col-span-3">
                    <label className={labelCls}>
                      Vencimiento Pasaporte
                      {getExpirationBadge(passengerDates[id.toString()]?.pasaporte)}
                    </label>
                    <CustomDatePicker
                      value={passengerDates[id.toString()]?.pasaporte || ""}
                      onChange={(val) => handleDateChange(id.toString(), "pasaporte", val)}
                    />
                  </div>
                  {/* Fila 4: Email | Contacto */}
                  <div className="flex flex-col col-span-1 md:col-span-3">
                    <label className={labelCls}>Email</label>
                    <input type="email" placeholder="correo@email.com" className={inputCls} />
                  </div>
                  <div className="flex flex-col col-span-1 md:col-span-3">
                    <label className={labelCls}>Contacto</label>
                    <input type="text" placeholder="+54 11 0000-0000" className={inputCls} />
                  </div>
                </div>
              </div>
            ))}

            {/* ── Botón Añadir pasajero ── */}
            <button
              type="button"
              onClick={addPasajero}
              className="flex items-center justify-center gap-2 w-full py-3 text-[13px] font-medium text-gray-500 hover:text-black hover:bg-gray-100 rounded-2xl transition-all select-none"
            >
              <IoAddOutline size={16} />
              Añadir pasajero
            </button>

          </div>
        </SectionCard>

        {/* ══ SECCIÓN 4: Archivos ══ */}
        <div className="">
          <SectionCard
            icon={
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <IoAttach size={18} className="text-black" />
              </div>
            }
            title="Archivos adjuntos"
          >
            <ArchiveTable
              files={files}
              onUpload={() => setIsUploadModalOpen(true)}
              onDelete={handleFileDelete}
            />
          </SectionCard>
        </div>
      </form>

      <DestinationModal
        isOpen={showDestinoModal}
        onClose={() => setShowDestinoModal(false)}
        onSave={handleSaveDestino}
      />

      <FileUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleFileUpload}
      />

      {editingDestinoIndex !== null && (
        <DestinationEditModal
          isOpen={true}
          onClose={() => setEditingDestinoIndex(null)}
          onSave={handleSaveDestino}
          initialData={destinos[editingDestinoIndex]}
        />
      )}
    </div>
  );
}

export default Trip;
