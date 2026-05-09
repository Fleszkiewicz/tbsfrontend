import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import {
  IoArrowBack,
  IoAirplaneOutline,
  IoLocationOutline,
  IoPeopleOutline,
  IoAddOutline,
} from "react-icons/io5";
import { LuTrash2 } from "react-icons/lu";

import { isIsoDate, toDateInput } from "../utils/utils";
import { useServices } from "../hooks/useServices";
import { useCreateTrip } from "../hooks/useTrips";
import { CustomDatePicker } from "../common/CustomDatePicker";
import { CustomSelect } from "../common/CustomSelect";
import { DestinationModal } from "../common/DestinationModal";
import { DestinationEditModal } from "../common/DestinationEditModal";
import { Table } from "../layout/Table";
import type { CreateTripRequest, DestinoEntry } from "../types/types";

// ─── Shared style tokens ──────────────────────────────────────────────────────
const inputCls =
  "w-full bg-[#f0f0f0] rounded-xl px-4 py-2.5 text-[14px] font-medium text-[#1D1D1F] outline-none focus:ring-2 focus:ring-black/10 transition-all placeholder:text-gray-400 border-none";
const selectCls =
  "w-full bg-[#f0f0f0] rounded-xl px-4 py-2.5 text-[14px] font-medium text-[#1D1D1F] outline-none focus:ring-2 focus:ring-black/10 transition-all appearance-none cursor-pointer border-none";
const labelCls =
  "block text-[12px] text-gray-400 font-medium mb-1.5 select-none";
const errorCls = "text-red-500 text-[12px] mt-1 font-medium";

// ─── Section Card wrapper ─────────────────────────────────────────────────────
function SectionCard({
  icon,
  title,
  action,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <span className="text-gray-400">{icon}</span>
          <h2 className="text-[15px] font-semibold text-[#1D1D1F]">{title}</h2>
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}



// ─── Component ────────────────────────────────────────────────────────────────
function CreateTrip() {
  const navigate = useNavigate();
  const { data: services } = useServices();
  const { mutateAsync: createTrip } = useCreateTrip();

  // ── Local state: destinos ──
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

  // ── Local state: pasajeros adicionales (UI only) ──
  const [extraPasajeros, setExtraPasajeros] = useState<number[]>([]);
  const addPasajero = () => {
    setExtraPasajeros((p) => [...p, Date.now()]);
    toast.success("Pasajero añadido.");
  };
  const removePasajero = (id: number) => {
    setExtraPasajeros((p) => p.filter((x) => x !== id));
    setPassengerDates((prev) => {
      const copy = { ...prev };
      delete copy[id.toString()];
      return copy;
    });
    toast.success("Pasajero eliminado.");
  };

  const [passengerDates, setPassengerDates] = useState<Record<string, { dni: string; pasaporte: string }>>({});
  const handleDateChange = (id: string, field: "dni" | "pasaporte", value: string) => {
    setPassengerDates((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] || { dni: "", pasaporte: "" }),
        [field]: value,
      },
    }));
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

  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  const form = useForm({
    defaultValues: {
      moneda: 0,
      valor_total: 0,
      valor_total_usd: 0,
      destino: "",
      apellido: "",
      fecha: today,
      fecha_ida: "",
      fecha_vuelta: "",
      servicios: [],
      cotizacion: null,
    } as CreateTripRequest,
    onSubmit: async ({ value, formApi }) => {
      const trip: CreateTripRequest = {
        fecha_ida: toDateInput(value.fecha_ida),
        fecha_vuelta: toDateInput(value.fecha_vuelta),
        fecha: toDateInput(value.fecha),
        moneda: value.moneda,
        destino: value.destino,
        apellido: value.apellido,
        valor_total: value.moneda === 2 ? 0 : value.valor_total,
        valor_total_usd:
          value.moneda === 2 || value.moneda === 3
            ? value.valor_total_usd || (value.moneda === 2 ? value.valor_total : 0)
            : 0,
        cotizacion:
          value.moneda === 2 || value.moneda === 3 ? value.cotizacion : null,
        servicios: value.servicios.map((s) => {
          const originalService = services?.data?.find((os) => os.id === s.id);
          const isUSD = originalService?.moneda?.toLowerCase() === "usd";
          return {
            id: s.id,
            valor: 0,
            pagado_por: "pendiente",
            moneda: isUSD ? 2 : 1,
            cotizacion: isUSD ? (value.cotizacion ?? null) : null,
          };
        }),
      };
      try {
        await createTrip(trip);
        formApi.reset();
        navigate("/home");
      } catch (error: any) {
        const errorMsg =
          error?.response?.data?.message || error?.message || "Error al crear el viaje";
        toast.error(errorMsg);
      }
    },
    onSubmitInvalid: () => {
      toast.error("Por favor revisa los campos requeridos");
    },
  });

  const [selectedMoneda, setSelectedMoneda] = useState<number>(
    form.getFieldValue("moneda") ?? 0
  );

  useEffect(() => {
    setSelectedMoneda(form.getFieldValue("moneda") ?? 0);
  }, []);

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
          <h1 className="text-[32px] font-bold text-[#1D1D1F] tracking-tight select-none cursor-default">
            Nueva Reserva
          </h1>
        </div>

        <form.Subscribe selector={(s) => s.isSubmitting}>
          {(isSubmitting) => (
            <button
              type="button"
              onClick={() => form.handleSubmit()}
              disabled={isSubmitting}
              className="bg-black text-white font-semibold text-[14px] px-6 py-2.5 rounded-full hover:bg-gray-800 active:scale-[0.97] transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed select-none"
            >
              {isSubmitting ? "Guardando..." : "Guardar reserva"}
            </button>
          )}
        </form.Subscribe>
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
          <div className="grid grid-cols-6 gap-5">
            {/* Fila 1: Creación | Inicio | Fin */}
            <form.Field
              name="fecha"
              validators={{
                onSubmit: ({ value }) => {
                  if (!value) return "La fecha es obligatoria";
                  if (!isIsoDate(value)) return "Formato válido: yyyy-mm-dd";
                },
              }}
            >
              {(field) => (
                <div className="flex flex-col col-span-2">
                  <label className={labelCls}>Creación de reserva</label>
                  <CustomDatePicker
                    value={field.state.value || ""}
                    onChange={(val) => field.handleChange(val)}
                  />
                  {field.state.meta.errors.length > 0 && (
                    <em className={errorCls}>{field.state.meta.errors.join(", ")}</em>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field
              name="fecha_ida"
              validators={{
                onSubmit: ({ value }) => {
                  if (!value) return "La fecha de ida es obligatoria";
                  if (!isIsoDate(value)) return "Formato válido: yyyy-mm-dd";
                },
              }}
            >
              {(field) => (
                <div className="flex flex-col col-span-2">
                  <label className={labelCls}>Fecha de inicio</label>
                  <CustomDatePicker
                    value={field.state.value || ""}
                    onChange={(val) => field.handleChange(val)}
                  />
                  {field.state.meta.errors.length > 0 && (
                    <em className={errorCls}>{field.state.meta.errors.join(", ")}</em>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field
              name="fecha_vuelta"
              validators={{
                onSubmit: ({ value, fieldApi }) => {
                  if (!value) return "La fecha de vuelta es obligatoria";
                  if (!isIsoDate(value)) return "Formato válido: yyyy-mm-dd";
                  const fv = toDateInput(value);
                  const fi = toDateInput(fieldApi.form.getFieldValue("fecha_ida"));
                  if (fi && fv < fi) return "La vuelta no puede ser antes que la ida";
                },
              }}
            >
              {(field) => (
                <div className="flex flex-col col-span-2">
                  <label className={labelCls}>Fecha de fin</label>
                  <CustomDatePicker
                    value={field.state.value || ""}
                    onChange={(val) => field.handleChange(val)}
                  />
                  {field.state.meta.errors.length > 0 && (
                    <em className={errorCls}>{field.state.meta.errors.join(", ")}</em>
                  )}
                </div>
              )}
            </form.Field>

            {/* Fila 2: Tipo de destino | Sucursal */}
            <form.Field
              name="destino"
              validators={{
                onSubmit: ({ value }) => {
                  if (!value) return "El destino es obligatorio";
                },
              }}
            >
              {(field) => (
                <div className="flex flex-col col-span-2">
                  <label className={labelCls}>Tipo de destino</label>
                  <CustomSelect
                    value={field.state.value}
                    onChange={(val) =>
                      field.handleChange(val as "nacional" | "internacional" | "")
                    }
                    options={[
                      { label: "Seleccionar", value: "" },
                      { label: "Internacional", value: "internacional" },
                      { label: "Nacional", value: "nacional" },
                    ]}
                  />
                  {field.state.meta.errors.length > 0 && (
                    <em className={errorCls}>{field.state.meta.errors.join(", ")}</em>
                  )}
                </div>
              )}
            </form.Field>

            <div className="flex flex-col col-span-2">
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

            <div className="flex flex-col col-span-2">
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
                <div className="flex flex-col col-span-3">
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
                    <em className={errorCls}>{field.state.meta.errors.join(", ")}</em>
                  )}
                </div>
              )}
            </form.Field>

            {(selectedMoneda === 1 || selectedMoneda === 3) && (
              <form.Field
                name="valor_total"
                validators={{
                  onSubmit: ({ value }) => {
                    if (!value) return "El valor total ARS es obligatorio";
                  },
                }}
              >
                {(field) => (
                  <div className="flex flex-col col-span-3">
                    <label className={labelCls}>Valor total ARS</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[14px] font-semibold text-gray-400 -ml-1">
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
                        className={`${inputCls} pl-7`}
                      />
                    </div>
                    {field.state.meta.errors.length > 0 && (
                      <em className={errorCls}>{field.state.meta.errors.join(", ")}</em>
                    )}
                  </div>
                )}
              </form.Field>
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
                  <div className="flex flex-col col-span-3">
                    <label className={labelCls}>Valor total USD</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[14px] font-semibold text-gray-400 -ml-2">
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
                        className={`${inputCls} pl-10`}
                      />
                    </div>
                    {field.state.meta.errors.length > 0 && (
                      <em className={errorCls}>{field.state.meta.errors.join(", ")}</em>
                    )}
                  </div>
                )}
              </form.Field>
            )}

            {(selectedMoneda === 2 || selectedMoneda === 3) && (
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
                  <div className="flex flex-col col-span-3">
                    <label className={labelCls}>Cotización USD / ARS</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[14px] font-semibold text-gray-400 -ml-1">
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
                        className={`${inputCls} pl-7`}
                      />
                    </div>
                    {field.state.meta.errors.length > 0 && (
                      <em className={errorCls}>{field.state.meta.errors.join(", ")}</em>
                    )}
                  </div>
                )}
              </form.Field>
            )}
          </div>
        </SectionCard>

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
            <Table
              headers={[
                { label: "Destino", key: "destino" },
                { label: "Desde", key: "inicio" },
                { label: "Hasta", key: "fin" },
                { label: "Servicios", key: "servicios" },
                { label: "Estado", key: "estado" },
                { label: "Acciones", key: "acciones" },
              ]}
              data={destinos}
              noDataMessage="No hay destinos agregados aún."
              footerAction={
                <button
                  type="button"
                  onClick={() => {
                    setEditingDestinoIndex(null);
                    setShowDestinoModal(true);
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-3 text-[13px] font-medium text-gray-500 hover:bg-gray-100 hover:text-black transition-colors"
                >
                  <IoAddOutline size={18} />
                  Añadir destino
                </button>
              }
              renderRow={(d, idx) => (
                <tr
                  key={idx}
                  onClick={() => handleEditDestino(idx)}
                  className="border-b border-gray-250 hover:bg-gray-100 transition-colors group cursor-pointer"
                >
                  <td className="py-3 px-2 md:px-4 text-[12px] md:text-[13px] font-bold text-gray-700 capitalize text-center">
                    {d.destino}
                  </td>
                  <td className="py-3 px-2 md:px-4 text-[12px] md:text-[13px] font-medium text-gray-600 text-center">
                    {d.fecha_ida ? new Date(d.fecha_ida + "T00:00:00").toLocaleDateString("es-AR") : "-"}
                  </td>
                  <td className="py-3 px-2 md:px-4 text-[12px] md:text-[13px] font-medium text-gray-600 text-center">
                    {d.fecha_vuelta ? new Date(d.fecha_vuelta + "T00:00:00").toLocaleDateString("es-AR") : "-"}
                  </td>
                  <td className="py-3 px-2 md:px-4 text-[12px] md:text-[13px] font-medium text-gray-600 text-center">
                    {d.servicios.length > 0 ? d.servicios.length : "-"}
                  </td>
                  <td className="py-3 px-2 md:px-4 text-[12px] md:text-[13px] font-medium text-gray-400 text-center">
                    -
                  </td>
                  <td className="py-3 px-1 md:px-3 text-center">
                    <div className="flex justify-center">
                      <button
                        type="button"
                        className="text-gray-500 hover:text-red-600 transition-colors p-1.5 rounded-lg"
                        onClick={(e) => handleRemoveDestino(idx, e)}
                        title="Eliminar destino"
                      >
                        <LuTrash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            />
          </div>
        </SectionCard>

        {/* ══ SECCIÓN 3: Información de pasajeros (Apellido con lógica + resto UI) ══ */}
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
              <div className="grid grid-cols-6 gap-4">
                {/* Fila 1: Nombre | Apellido | Tipo */}
                <div className="flex flex-col col-span-2">
                  <label className={labelCls}>Nombre</label>
                  <input type="text" placeholder="Nombre" className={inputCls} />
                </div>

                <form.Field
                  name="apellido"
                  validators={{
                    onSubmit: ({ value }) => {
                      if (!value) return "El apellido es obligatorio";
                    },
                  }}
                >
                  {(field) => (
                    <div className="flex flex-col col-span-2">
                      <label className={labelCls}>Apellido</label>
                      <input
                        type="text"
                        placeholder="Apellido"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className={inputCls}
                      />
                      {field.state.meta.errors.length > 0 && (
                        <em className={errorCls}>{field.state.meta.errors.join(", ")}</em>
                      )}
                    </div>
                  )}
                </form.Field>

                <div className="flex flex-col col-span-2">
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

                {/* Fila 2: DNI | Vencimiento DNI */}
                <div className="flex flex-col col-span-3">
                  <label className={labelCls}>DNI</label>
                  <input type="text" placeholder="00.000.000" className={inputCls} />
                </div>
                <div className="flex flex-col col-span-3">
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
                <div className="flex flex-col col-span-3">
                  <label className={labelCls}>Pasaporte</label>
                  <input type="text" placeholder="AAA000000" className={inputCls} />
                </div>
                <div className="flex flex-col col-span-3">
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
                <div className="flex flex-col col-span-3">
                  <label className={labelCls}>Email</label>
                  <input type="email" placeholder="correo@email.com" className={inputCls} />
                </div>
                <div className="flex flex-col col-span-3">
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
                <div className="grid grid-cols-6 gap-4">
                  {/* Fila 1: Nombre | Apellido | Tipo */}
                  <div className="flex flex-col col-span-2">
                    <label className={labelCls}>Nombre</label>
                    <input type="text" placeholder="Nombre" className={inputCls} />
                  </div>
                  <div className="flex flex-col col-span-2">
                    <label className={labelCls}>Apellido</label>
                    <input type="text" placeholder="Apellido" className={inputCls} />
                  </div>
                  <div className="flex flex-col col-span-2">
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
                  {/* Fila 2: DNI | Vencimiento DNI */}
                  <div className="flex flex-col col-span-3">
                    <label className={labelCls}>DNI</label>
                    <input type="text" placeholder="00.000.000" className={inputCls} />
                  </div>
                  <div className="flex flex-col col-span-3">
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
                  <div className="flex flex-col col-span-3">
                    <label className={labelCls}>Pasaporte</label>
                    <input type="text" placeholder="AAA000000" className={inputCls} />
                  </div>
                  <div className="flex flex-col col-span-3">
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
                  <div className="flex flex-col col-span-3">
                    <label className={labelCls}>Email</label>
                    <input type="email" placeholder="correo@email.com" className={inputCls} />
                  </div>
                  <div className="flex flex-col col-span-3">
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
              <IoAddOutline size={18} />
              Añadir pasajero
            </button>

          </div>
        </SectionCard>


      </form>

      <DestinationModal
        isOpen={showDestinoModal}
        onClose={() => setShowDestinoModal(false)}
        onSave={handleSaveDestino}
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

export default CreateTrip;