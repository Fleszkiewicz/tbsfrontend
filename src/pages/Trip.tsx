import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm, useStore } from "@tanstack/react-form";
import { toast } from "sonner";
import {
  IoArrowBack,
  IoLocationOutline,
  IoPeopleOutline,
  IoCashOutline,
  IoCheckmark,
  IoTicketOutline,
} from "react-icons/io5";
import { PasajerosSection } from "../components/common/ui/PasajerosSection";
import { toPayload, getPasajerosError, findDniConflict, fromApi } from "../utils/pasajeros";
import type { PasajeroForm } from "../types/types";
import { formattedAmount, toDateInput } from "../utils/utils";
import { renderEstado } from "../utils/utilsTsx";
import { categoriaCancelacionLabel } from "../utils/cancelacion";
import { useTrip, useSaveTrip, useCancelTrip, useRevertCancelTrip } from "../hooks/useTrips";
import { CustomDatePicker } from "../components/common/ui/CustomDatePicker";
import { CustomSelect } from "../components/common/ui/CustomSelect";
import { TripSkeleton } from "../components/common/ui/Skeleton";
import { DestinationModal } from "../components/common/modals/DestinationModal";
import { DestinationEditModal } from "../components/common/modals/DestinationEditModal";
import { DestinationsTable } from "../components/common/tables/DestinationsTable";
import { ArchiveTable } from "../components/common/tables/ArchiveTable";
import { FileUploadModal } from "../components/common/modals/FileUploadModal";
import { CancelTripModal } from "../components/common/modals/CancelTripModal";
import { useArchivos, useUploadArchivos, useDeleteArchivo } from "../hooks/useArchivos";
import { getArchivoUrl } from "../services/archivos.services";
import { MSG_CAMPOS_OBLIGATORIOS } from "../utils/messages";
import { confirmLeaveUnsaved } from "../utils/dialogs";
import { useDistribucion, useToggleSocio } from "../hooks/useDistribucion";
import type { DestinoEntry, DestinoServiceDetail, TripFile, UpdateTripRequest } from "../types/types";
import {
  destinosFromApi,
  serviciosSinDestinoFromApi,
  destinoToPayload,
  servicioToPayload,
  getDestinoDateError,
} from "../utils/destinos";
import { SUCURSALES, PAGOS } from "../utils/constants";
import { isEmpty, hasMissingTripFields, getTripDateError } from "../utils/tripValidation";
import { FieldLabel } from "../components/common/ui/FieldLabel";
import { BiDollarCircle } from "react-icons/bi";
import { FiPaperclip } from "react-icons/fi";



// ─── Shared style tokens ──────────────────────────────────────────────────────
const inputCls =
  "w-full bg-[#f0f0f0] rounded-xl px-3 md:px-4 py-2 md:py-2.5 text-[13px] md:text-[14px] font-medium text-[#1D1D1F] outline-none focus:ring-2 focus:ring-black/10 transition-all placeholder:text-gray-400 border-none";
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
  const { data: tripResponse, isLoading } = useTrip(id!);

  const tripData = tripResponse?.data;

  const [showErrors, setShowErrors] = useState(false);
  const [dateError, setDateError] = useState<string | null>(null);
  // Punto de comparación para detectar cambios sin guardar
  const [baseline, setBaseline] = useState<string | null>(null);
  const [rebase, setRebase] = useState(false);

  // ── Local state: destinos ──
  const [selectedMoneda, setSelectedMoneda] = useState<number>(0);
  const [destinos, setDestinos] = useState<DestinoEntry[]>([]);
  const [showDestinoModal, setShowDestinoModal] = useState(false);
  const [editingDestinoIndex, setEditingDestinoIndex] = useState<number | null>(null);
  const [serviciosSinDestino, setServiciosSinDestino] = useState<DestinoServiceDetail[]>([]);
  const [editingSinDestino, setEditingSinDestino] = useState(false);
  const sinDestinoInitial = useMemo<DestinoEntry>(
    () => ({ destino: "", fecha_desde: "", fecha_hasta: "", servicios: serviciosSinDestino }),
    [serviciosSinDestino],
  );

  const handleSaveDestino = (destino: DestinoEntry) => {
    if (editingDestinoIndex !== null) {
      setDestinos((prev) => {
        const updated = [...prev];
        updated[editingDestinoIndex] = destino;
        return updated;
      });
      toast.success("Destino actualizado.", { id: "destino" });
    } else {
      setDestinos((prev) => [...prev, destino]);
      toast.success("Destino añadido.", { id: "destino" });
    }
  };

  const handleSaveSinDestino = (d: DestinoEntry) => {
    setServiciosSinDestino(d.servicios);
    toast.success("Servicios actualizados.", { id: "destino" });
  };

  const handleEditDestino = (idx: number) => {
    setEditingDestinoIndex(idx);
  };

  const handleRemoveDestino = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setDestinos((prev) => prev.filter((_, i) => i !== idx));
    toast.success("Destino eliminado.", { id: "destino" });
  };

  // ── Archivos adjuntos (guardados en el bucket) ──
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const { data: archivosApi = [] } = useArchivos(id);
  const { mutateAsync: uploadArchivos } = useUploadArchivos(id ?? "");
  const { mutateAsync: removeArchivo } = useDeleteArchivo(id ?? "");

  const files: TripFile[] = archivosApi.map((a) => ({
    id: String(a.id),
    nombre: a.nombre,
    categoria: a.categoria,
    fecha: a.fecha.split("-").reverse().join("/"),
    url: "",
  }));

  const handleFileUpload = async (newFiles: File[], category: string) => {
    const t = toast.loading(`Subiendo ${newFiles.length} archivo(s)...`);
    try {
      const { failed } = await uploadArchivos(newFiles.map((file) => ({ file, categoria: category })));
      if (failed.length) toast.error(`No se pudieron subir: ${failed.join(", ")}`, { id: t });
      else toast.success("Archivos subidos correctamente.", { id: t });
    } catch {
      toast.error("No se pudieron subir los archivos.", { id: t });
    }
  };

  const handleFileDelete = async (fileId: string) => {
    try {
      await removeArchivo(fileId);
      toast.success("Archivo eliminado.", { id: "archivo" });
    } catch {
      toast.error("No se pudo eliminar el archivo.", { id: "archivo" });
    }
  };

  // ── Distribución de ganancias: qué socio ya cobró este legajo (guardado en la base) ──
  const { data: pagosSocios = [] } = useDistribucion(id);
  const { mutate: toggleSocio } = useToggleSocio(id ?? "");

  const togglePartnerPayout = (partner: "pablo" | "soledad" | "mariana") => {
    const abonado = !pagosSocios.some((p) => p.socio === partner);
    toggleSocio(
      { socio: partner, abonado },
      { onError: () => toast.error("No se pudo actualizar el pago del socio.", { id: "socio" }) },
    );
  };

  const [pasajeros, setPasajeros] = useState<PasajeroForm[]>([]);
  const { mutateAsync: saveTrip, isPending } = useSaveTrip();

  // Form initialization
  const form = useForm({
    defaultValues: {
      fecha: "",
      fecha_ida: "",
      fecha_vuelta: "",
      destino: "",
      pago: "",
      moneda: 0,
      valor_total: null,
      valor_total_usd: null,
      cotizacion: null,
      sucursal_id: 0,
    } as any,
    onSubmit: async ({ value }) => {
      if (!id) return;

      const dataUpdated: UpdateTripRequest = {
        pasajeros: toPayload(pasajeros),
        destino: value.destino,
        fecha: toDateInput(value.fecha),
        fecha_ida: toDateInput(value.fecha_ida),
        fecha_vuelta: toDateInput(value.fecha_vuelta),
        pago: value.pago || undefined,
        moneda: value.moneda,
        valor_total: value.moneda === 2 ? 0 : value.valor_total,
        valor_total_usd: value.moneda === 1 ? 0 : value.valor_total_usd,
        cotizacion: value.moneda === 1 ? null : value.cotizacion,
        destinos: destinos.map(destinoToPayload),
        servicios_sin_destino: serviciosSinDestino.map(servicioToPayload),
      };

      try {
        await saveTrip({ tripId: id!, dataUpdated });
        setRebase(true); // lo guardado pasa a ser el nuevo punto de comparación
      } catch {
        // el aviso de error ya lo muestra useSaveTrip
      }
    },
  });

  // Fechas globales de la reserva (reactivas) para validar los destinos
  const viajeDesde: string = useStore(form.store, (s) => s.values.fecha_ida) || "";
  const viajeHasta: string = useStore(form.store, (s) => s.values.fecha_vuelta) || "";

  // ── Cambios sin guardar ──
  const formValues = useStore(form.store, (s) => s.values);
  const snapshot = JSON.stringify({ formValues, pasajeros, destinos, serviciosSinDestino });
  const isDirty = baseline !== null && snapshot !== baseline;

  useEffect(() => {
    if (rebase) {
      setBaseline(snapshot);
      setRebase(false);
    }
  }, [rebase, snapshot]);

  useEffect(() => {
    if (!isDirty) return;
    const warn = (ev: BeforeUnloadEvent) => {
      ev.preventDefault();
      ev.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [isDirty]);

  const handleBack = async () => {
    if (isDirty && !(await confirmLeaveUnsaved())) return;
    navigate("/home");
  };

  // Load tripData into form
  useEffect(() => {
    if (tripData) {
      setPasajeros(fromApi(tripData.pasajeros));
      setDestinos(destinosFromApi(tripData.destinos));
      setServiciosSinDestino(serviciosSinDestinoFromApi(tripData.servicios_sin_destino));
      form.setFieldValue("fecha", tripData.fecha ? tripData.fecha.split("T")[0] : "");
      form.setFieldValue("fecha_ida", tripData.fecha_ida ? tripData.fecha_ida.split("T")[0] : "");
      form.setFieldValue("fecha_vuelta", tripData.fecha_vuelta ? tripData.fecha_vuelta.split("T")[0] : "");
      form.setFieldValue("destino", tripData.destino?.toLowerCase() || "");
      form.setFieldValue("pago", tripData.pago ?? "");
      form.setFieldValue("sucursal_id", tripData.sucursal_id ?? 0);

      const monedaMap: Record<string, number> = { ars: 1, usd: 2, mixto: 3 };
      const numMoneda = tripData.moneda ? (monedaMap[tripData.moneda.toLowerCase()] || 0) : 0;
      form.setFieldValue("moneda", numMoneda);
      setSelectedMoneda(numMoneda);

      form.setFieldValue("valor_total", Number(tripData.valor_total) || null);
      form.setFieldValue("valor_total_usd", Number(tripData.valor_total_usd) || null);
      form.setFieldValue("cotizacion", Number(tripData.cotizacion) || null);
      setRebase(true);
    }
  }, [tripData, form]);

  const handleSave = async () => {
    const values = form.state.values;
    const pasajerosError = getPasajerosError(pasajeros, false);
    const faltanCampos = hasMissingTripFields(values, false);
    if (faltanCampos || pasajerosError) {
      setShowErrors(true);
      const soloDniRepetido = !faltanCampos && !!pasajerosError && /repetido/i.test(pasajerosError);
      toast.error(soloDniRepetido ? pasajerosError! : MSG_CAMPOS_OBLIGATORIOS, { id: "validacion" });
      return;
    }
    const err = getTripDateError(values);
    setDateError(err);
    if (err) {
      toast.error(err, { id: "validacion" });
      return;
    }
    const destinoFuera = destinos.find((d) => getDestinoDateError(d, toDateInput(values.fecha_ida), toDateInput(values.fecha_vuelta)));
    if (destinoFuera) {
      toast.error(`Destino "${destinoFuera.destino}": ${getDestinoDateError(destinoFuera, toDateInput(values.fecha_ida), toDateInput(values.fecha_vuelta))}`, { id: "validacion" });
      return;
    }
    const conflicto = await findDniConflict(pasajeros);
    if (conflicto) {
      toast.error(conflicto, { id: "validacion" });
      return;
    }
    toast.dismiss("validacion"); // el aviso de validación no queda debajo del de guardado
    form.handleSubmit();
  };

  // ── Cancelación de legajo ──
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const { mutate: cancelTrip, isPending: isCancelling } = useCancelTrip();
  const { mutate: revertCancel, isPending: isReverting } = useRevertCancelTrip();
  const isCanceled = tripData?.cancelado === 1;

  if (isLoading) return <TripSkeleton />;

  // ── Cálculos de liquidación a socios (visual) ──
  const monedaTrip = tripData?.moneda?.toLowerCase() || "ars";
  const isUsdTrip = monedaTrip === "usd";
  const isMixtoTrip = monedaTrip === "mixto";
  const isArsTrip = monedaTrip === "ars" || (!isUsdTrip && !isMixtoTrip);

  const gananciaArs = Number(tripData?.ganancia) || 0;
  const gananciaUsd = Number(tripData?.ganancia_usd) || 0;
  const cuotaArs = gananciaArs / 3;
  const cuotaUsd = gananciaUsd / 3;

  return (
    <div className="max-w-[900px] mx-auto px-4 pt-24 md:pt-28 pb-16">
      {/* ── Header ── */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-8">
        <div>
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 text-gray-400 hover:text-black transition-colors text-[13px] font-medium mb-3 select-none"
          >
            <IoArrowBack size={15} />
            Volver
          </button>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <h1 className="text-[29px] md:text-[32px] lg:text-[35px] font-bold text-[#1D1D1F] tracking-tight select-none cursor-default">
              Legajo {id}
            </h1>
            {tripData?.estado && renderEstado(tripData.estado)}
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsCancelModalOpen(true)}
            disabled={isCancelling || isReverting}
            className="h-10 px-4 rounded-full bg-gray-200/70 text-gray-600 hover:text-black hover:bg-gray-300/50 flex items-center gap-2 text-[12px] md:text-[14px] font-normal transition-all active:scale-[0.96] select-none disabled:opacity-50"
          >
            {isCanceled ? "Anular cancelación" : "Cancelar"}
          </button>

          <button
            type="button"
            onClick={() => handleSave()}
            disabled={isPending}
            className="bg-black text-white font-semibold text-[12px] md:text-[14px] px-4 md:px-6 py-2 md:py-2.5 rounded-full hover:bg-gray-800 active:scale-[0.97] transition-all shadow-sm select-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
        className="flex flex-col gap-4"
      >
        {/* ══ SECCIÓN 1: Información de viaje ══ */}
        <SectionCard
          icon={
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
              <IoTicketOutline size={18} className="text-black" />
            </div>
          }
          title="Información de viaje"
        >
          <div className="grid grid-cols-2 md:grid-cols-6 gap-5">
            {/* Creación de reserva */}
            <form.Field name="fecha">
              {(field) => (
                <div className="flex flex-col col-span-1 md:col-span-2">
                  <FieldLabel
                    text="Creación de reserva"
                    invalid={showErrors && isEmpty(field.state.value)}
                  />
                  <CustomDatePicker
                    value={field.state.value || ""}
                    onChange={(val) => field.handleChange(val)}
                  />
                </div>
              )}
            </form.Field>

            {/* Fecha inicio */}
            <form.Field name="fecha_ida">
              {(field) => (
                <div className="flex flex-col col-span-1 md:col-span-2">
                  <FieldLabel
                    text="Fecha de inicio"
                    invalid={showErrors && isEmpty(field.state.value)}
                  />
                  <CustomDatePicker
                    value={field.state.value || ""}
                    onChange={(val) => {
                      field.handleChange(val);
                      if (setDateError) setDateError(null);
                    }}
                  />
                </div>
              )}
            </form.Field>

            {/* Fecha fin */}
            <form.Field name="fecha_vuelta">
              {(field) => (
                <div className="flex flex-col col-span-1 md:col-span-2">
                  <FieldLabel
                    text="Fecha de fin"
                    invalid={showErrors && isEmpty(field.state.value)}
                  />
                  <CustomDatePicker
                    value={field.state.value || ""}
                    onChange={(val) => {
                      field.handleChange(val);
                      if (setDateError) setDateError(null);
                    }}
                  />
                  {dateError && (
                    <em className="text-red-500 text-[12px] mt-1 font-medium not-italic block">
                      {dateError}
                    </em>
                  )}
                </div>
              )}
            </form.Field>

            {/* Tipo de destino */}
            <form.Field name="destino">
              {(field) => (
                <div className="flex flex-col col-span-1 md:col-span-2">
                  <FieldLabel
                    text="Tipo de destino"
                    invalid={showErrors && isEmpty(field.state.value)}
                  />
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

            {/* Sucursal deshabilitada */}
            <form.Field name="sucursal_id">
              {(field) => (
                <div className="flex flex-col col-span-1 md:col-span-2">
                  <FieldLabel
                    text="Sucursal"
                    invalid={showErrors && isEmpty(field.state.value)}
                  />
                  <CustomSelect
                    value={field.state.value ?? 0}
                    onChange={() => { }}
                    disabled
                    options={SUCURSALES}
                  />
                </div>
              )}
            </form.Field>

            {/* Pago */}
            <form.Field name="pago">
              {(field) => (
                <div className="flex flex-col col-span-1 md:col-span-2">
                  <label className={labelCls}>Pago</label>
                  <CustomSelect
                    value={field.state.value ?? ""}
                    onChange={(val) => field.handleChange(String(val))}
                    options={PAGOS}
                  />
                </div>
              )}
            </form.Field>

            {/* Detalle económico */}
            <form.Field name="moneda">
              {(field) => (
                <div className="flex flex-col col-span-1 md:col-span-3">
                  <FieldLabel
                    text="Tipo de moneda"
                    invalid={showErrors && isEmpty(field.state.value)}
                  />
                  <CustomSelect
                    value={field.state.value ?? 0}
                    onChange={(val) => {
                      const numVal = Number(val) as 0 | 1 | 2 | 3;
                      field.handleChange(numVal);
                      setSelectedMoneda(numVal);
                    }}
                    options={[
                      { label: "Seleccionar", value: 0 },
                      { label: "ARS", value: 1 },
                      { label: "USD", value: 2 },
                      { label: "Mixto", value: 3 },
                    ]}
                  />
                </div>
              )}
            </form.Field>

            {(selectedMoneda === 1 || selectedMoneda === 3) ? (
              <form.Field name="valor_total">
                {(field) => (
                  <div className="flex flex-col col-span-1 md:col-span-3">
                    <FieldLabel
                      text="Valor total ARS"
                      invalid={showErrors && isEmpty(field.state.value)}
                    />
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
                  </div>
                )}
              </form.Field>
            ) : (
              <div className="hidden md:block col-span-1 md:col-span-3"></div>
            )}

            {(selectedMoneda === 2 || selectedMoneda === 3) ? (
              <form.Field name="cotizacion">
                {(field) => (
                  <div className="flex flex-col col-span-1 md:col-span-3">
                    <FieldLabel
                      text="Cotización USD / ARS"
                      invalid={showErrors && isEmpty(field.state.value)}
                    />
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
                  </div>
                )}
              </form.Field>
            ) : (
              <div className="hidden md:block col-span-1 md:col-span-3"></div>
            )}

            {(selectedMoneda === 2 || selectedMoneda === 3) && (
              <form.Field name="valor_total_usd">
                {(field) => (
                  <div className="flex flex-col col-span-1 md:col-span-3">
                    <FieldLabel
                      text="Valor total USD"
                      invalid={showErrors && isEmpty(field.state.value)}
                    />
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
                  <BiDollarCircle size={18} className="text-black" />
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
                  <BiDollarCircle size={18} className="text-black" />
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
                <div className="flex justify-between items-center text-[14px]">
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
          <div className="mb-4">
            <DestinationsTable
              destinos={destinos}
              onAdd={() => {
                setEditingDestinoIndex(null);
                setShowDestinoModal(true);
              }}
              onEdit={handleEditDestino}
              onRemove={handleRemoveDestino}
              sinDestino={serviciosSinDestino}
              onEditSinDestino={() => setEditingSinDestino(true)}
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
          <PasajerosSection pasajeros={pasajeros} onChange={setPasajeros} showErrors={showErrors} fechaFin={viajeHasta} />        </SectionCard>

        {/* ══ SECCIÓN 4: Archivos ══ */}
        <SectionCard
          icon={
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
              <FiPaperclip size={15} className="text-black" />
            </div>
          }
          title="Archivos adjuntos"
        >
          <ArchiveTable
            files={files}
            onUpload={() => setIsUploadModalOpen(true)}
            onDelete={handleFileDelete}
            resolveUrl={(f, disposition) => getArchivoUrl(id!, f.id, disposition)}
          />
        </SectionCard>

        {/* ══ SECCIÓN 5: Liquidación a Socios ══ */}
        <SectionCard
          icon={
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
              <IoCashOutline size={18} className="text-black" />
            </div>
          }
          title="Distribución de ganancias"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="grid grid-cols-2 gap-3 md:flex md:flex-col">
              <div className="border border-gray-200 rounded-2xl p-3 md:p-4 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[12px] text-gray-500 font-medium block">Ganancia total del viaje</span>
                  <div className="mt-1.5">
                    {(isArsTrip || isMixtoTrip) && (
                      <span className="text-[17px] md:text-[20px] font-bold text-[#1D1D1F]">
                        ${formattedAmount(gananciaArs)}
                      </span>
                    )}
                    {isMixtoTrip && <span className="mx-2 text-gray-300 text-[17px] md:text-[20px]">&</span>}
                    {(isUsdTrip || isMixtoTrip) && (
                      <span className="text-[17px] md:text-[20px] font-bold text-[#1D1D1F]">
                        USD {formattedAmount(gananciaUsd)}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-[11px] text-gray-400 mt-2">Margen neto generado</span>
              </div>

              <div className="border border-gray-200 rounded-2xl p-3 md:p-4 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[12px] text-gray-500 font-medium block">Monto a abonar a cada socio</span>
                  <div className="mt-1.5">
                    {(isArsTrip || isMixtoTrip) && (
                      <span className="text-[17px] md:text-[20px] font-bold text-emerald-600">
                        ${formattedAmount(cuotaArs)}
                      </span>
                    )}
                    {isMixtoTrip && <span className="mx-2 text-gray-300 text-[17px] md:text-[20px] direction-horizontal">&</span>}
                    {(isUsdTrip || isMixtoTrip) && (
                      <span className="text-[17px] md:text-[20px] font-bold text-emerald-600">
                        USD {formattedAmount(cuotaUsd)}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-[11px] text-gray-400 mt-2">División proporcional entre los 3 socios</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {(
                [
                  { key: "pablo", name: "Pablo" },
                  { key: "soledad", name: "Soledad" },
                  { key: "mariana", name: "Mariana" },
                ] as const
              ).map(({ key, name }) => {
                const pago = pagosSocios.find((p) => p.socio === key);
                const isPaid = !!pago;
                const montoCambio =
                  !!pago &&
                  pago.fecha !== "" &&
                  (Math.abs(pago.monto_ars - cuotaArs) > 0.01 || Math.abs(pago.monto_usd - cuotaUsd) > 0.01);
                return (
                  <div
                    key={key}
                    onClick={() => togglePartnerPayout(key)}
                    className={`group cursor-pointer rounded-2xl px-4 py-4 border transition-all duration-200 select-none flex items-center justify-between ${isPaid
                      ? "bg-emerald-50/30 border-green-500 shadow-xs"
                      : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"
                      }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${isPaid
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "border-2 border-gray-300 group-hover:border-gray-400 bg-white"
                          }`}
                      >
                        {isPaid && <IoCheckmark size={14} className="stroke-2" />}
                      </div>

                      <div>
                        <div className="text-[14px] font-semibold text-[#1D1D1F] leading-tight">
                          {name}
                        </div>
                        <div className="text-[12px] text-gray-500 font-medium mt-0.5">
                          {(isArsTrip || isMixtoTrip) && (
                            <span>${formattedAmount(cuotaArs)}</span>
                          )}
                          {isMixtoTrip && <span className="mx-2 text-gray-300 text-[14px]">&</span>}
                          {(isUsdTrip || isMixtoTrip) && (
                            <span>USD {formattedAmount(cuotaUsd)}</span>
                          )}
                        </div>
                        {pago?.fecha && (
                          <div className="text-[11px] text-gray-400 font-medium mt-0.5">
                            Abonado el {pago.fecha.split("-").reverse().join("/")}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <span
                        className={`text-[12px] font-semibold px-1.5 py-0.5 rounded-full flex items-center gap-1.5 transition-all ${isPaid
                          ? "bg-green-100 text-emerald-700"
                          : "bg-gray-100 text-gray-600 group-hover:bg-gray-200"
                          }`}
                      >
                        {isPaid ? "Abonado" : "Pendiente"}
                      </span>
                      {montoCambio && (
                        <span className="block text-[10px] text-amber-600 font-medium mt-1 text-right">
                          La ganancia cambió desde el pago
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </SectionCard>
      </form>

      <DestinationModal
        isOpen={showDestinoModal}
        onClose={() => setShowDestinoModal(false)}
        onSave={handleSaveDestino}
        viajeDesde={viajeDesde}
        viajeHasta={viajeHasta}
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
          viajeDesde={viajeDesde}
          viajeHasta={viajeHasta}
        />
      )}

      {editingSinDestino && (
        <DestinationEditModal
          isOpen={true}
          sinDestino
          onClose={() => setEditingSinDestino(false)}
          onSave={handleSaveSinDestino}
          initialData={sinDestinoInitial}
          viajeDesde={viajeDesde}
          viajeHasta={viajeHasta}
        />
      )}

      <CancelTripModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        tripId={id}
        isCanceled={isCanceled}
        currentMotivo={
          categoriaCancelacionLabel(tripData?.categoria_cancelacion) ??
          tripData?.motivo_cancelacion ??
          undefined
        }
        currentFecha={tripData?.fecha_cancelacion ?? undefined}
        isLoading={isCancelling || isReverting}
        onConfirm={(categoria) => {
          cancelTrip(
            { tripId: id!, categoria },
            { onSuccess: () => setIsCancelModalOpen(false) },
          );
        }}
        onRevert={() => {
          revertCancel(id!, { onSuccess: () => setIsCancelModalOpen(false) });
        }}
      />
    </div>
  );
}

export default Trip;