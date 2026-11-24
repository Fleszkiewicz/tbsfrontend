import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, useStore } from "@tanstack/react-form";
import { toast } from "sonner";
import {
  IoArrowBack,
  IoAirplaneOutline,
  IoLocationOutline,
  IoPeopleOutline,
} from "react-icons/io5";
import { toDateInput } from "../utils/utils";
import { useCreateTrip } from "../hooks/useTrips";
import { CustomDatePicker } from "../components/common/ui/CustomDatePicker";
import { CustomSelect } from "../components/common/ui/CustomSelect";
import { DestinationModal } from "../components/common/modals/DestinationModal";
import { DestinationEditModal } from "../components/common/modals/DestinationEditModal";
import { DestinationsTable } from "../components/common/tables/DestinationsTable";
import { ArchiveTable } from "../components/common/tables/ArchiveTable";
import { FileUploadModal } from "../components/common/modals/FileUploadModal";
import type { CreateTripRequest, DestinoEntry, TripFile } from "../types/types";
import { destinoToPayload, getDestinoDateError } from "../utils/destinos";
import { SUCURSALES, PAGOS } from "../utils/constants";
import { isEmpty, hasMissingTripFields, getTripDateError } from "../utils/tripValidation";
import { FieldLabel } from "../components/common/ui/FieldLabel";
import { PasajerosSection } from "../components/common/ui/PasajerosSection";
import { emptyPasajero, toPayload, getPasajerosError, findDniConflict } from "../utils/pasajeros";
import type { PasajeroForm } from "../types/types";
import { FiPaperclip } from "react-icons/fi";
import { uploadArchivos } from "../services/archivos.services";
import { MSG_CAMPOS_OBLIGATORIOS } from "../utils/messages";
import { confirmLeaveUnsaved } from "../utils/dialogs";


// ─── Shared style tokens ──────────────────────────────────────────────────────
const inputCls =
  "w-full bg-[#f0f0f0] rounded-xl px-3 md:px-4 py-2 md:py-2.5 text-[13px] md:text-[14px] font-medium text-[#1D1D1F] outline-none focus:ring-2 focus:ring-black/10 transition-all placeholder:text-gray-400 border-none";












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
  const { mutateAsync: createTrip } = useCreateTrip();
  const [showErrors, setShowErrors] = useState(false);

  const [dateError, setDateError] = useState<string | null>(null);


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
      toast.success("Destino actualizado.", { id: "destino" });
    } else {
      setDestinos((prev) => [...prev, destino]);
      toast.success("Destino añadido.", { id: "destino" });
    }
  };

  const handleEditDestino = (idx: number) => {
    setEditingDestinoIndex(idx);
  };

  const handleRemoveDestino = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setDestinos((prev) => prev.filter((_, i) => i !== idx));
    toast.success("Destino eliminado.", { id: "destino" });
  };

  const [pasajeros, setPasajeros] = useState<PasajeroForm[]>(() => [emptyPasajero(true)]);

  // ── Archivos: esperan en memoria y se suben una vez creado el legajo ──
  type PendingItem = { id: string; file: File; categoria: string; url: string; fecha: string };
  const [pending, setPending] = useState<PendingItem[]>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const files: TripFile[] = pending.map(({ id, file, categoria, url, fecha }) => ({
    id,
    nombre: file.name,
    categoria,
    url,
    fecha,
  }));

  const handleFileUpload = (newFiles: File[], category: string) => {
    setPending((prev) => [
      ...prev,
      ...newFiles.map((file) => ({
        id: crypto.randomUUID(),
        file,
        categoria: category,
        url: URL.createObjectURL(file),
        fecha: new Date().toLocaleDateString("es-AR"),
      })),
    ]);
    toast.success(`${newFiles.length} archivo(s) agregados. Se subirán al guardar el expediente.`, { id: "archivo" });
  };

  const handleFileDelete = (fileId: string) => {
    setPending((prev) => {
      const f = prev.find((x) => x.id === fileId);
      if (f) URL.revokeObjectURL(f.url);
      return prev.filter((x) => x.id !== fileId);
    });
    toast.success("Archivo eliminado.", { id: "archivo" });
  };

  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  const form = useForm({
    defaultValues: {
      moneda: 0,
      valor_total: 0,
      valor_total_usd: 0,
      sucursal_id: 0,
      pago: "",
      destino: "",
      fecha: today,
      fecha_ida: "",
      fecha_vuelta: "",
      cotizacion: null,
    } as Omit<CreateTripRequest, "pasajeros">,
    onSubmit: async ({ value, formApi }) => {
      const trip: CreateTripRequest = {
        fecha_ida: toDateInput(value.fecha_ida),
        fecha_vuelta: toDateInput(value.fecha_vuelta),
        fecha: toDateInput(value.fecha),
        moneda: value.moneda,
        destino: value.destino,
        sucursal_id: value.sucursal_id,
        pago: value.pago,
        pasajeros: toPayload(pasajeros),
        valor_total: value.moneda === 2 ? 0 : value.valor_total,
        valor_total_usd:
          value.moneda === 2 || value.moneda === 3
            ? value.valor_total_usd || (value.moneda === 2 ? value.valor_total : 0)
            : 0,
        cotizacion:
          value.moneda === 2 || value.moneda === 3 ? value.cotizacion : null,
        destinos: destinos.map(destinoToPayload),
      };
      try {
        // ✅ 2. OBTENER EL ID SIN LLAMAR DOS VECES A LA API
        const newId = await createTrip(trip);

        if (pending.length > 0) {
          toast.loading(`Subiendo ${pending.length} archivo(s)...`, { id: "trip-create" });
          const { failed } = await uploadArchivos(
            String(newId),
            pending.map(({ file, categoria }) => ({ file, categoria })),
          );
          if (failed.length) {
            toast.warning(
              `El expediente se creó, pero no se pudieron subir: ${failed.join(", ")}. Súbelos desde el legajo.`,
              { id: "trip-create", duration: 8000 },
            );
          } else {
            toast.success("Expediente creado y archivos subidos correctamente", { id: "trip-create" });
          }
          pending.forEach((p) => URL.revokeObjectURL(p.url));
        }

        formApi.reset();
        navigate(`/trip/${newId}`);
      } catch (error: any) {
        const errorMsg =
          error?.response?.data?.error || error?.message || "No se pudo crear el expediente";
        toast.error(errorMsg, { id: "trip-create" });
      }
    },
  });

  // ✅ ÚNICO handleSave (con validación de campos requeridos y fechas)
  const handleSave = async () => {
    const values = form.state.values;
    const pasajerosError = getPasajerosError(pasajeros, true);
    const faltanCampos = hasMissingTripFields(values, true);
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

  // Fechas globales de la reserva (reactivas) para validar los destinos
  const viajeDesde: string = useStore(form.store, (s) => s.values.fecha_ida) || "";
  const viajeHasta: string = useStore(form.store, (s) => s.values.fecha_vuelta) || "";

  // ── Cambios sin guardar: se compara contra el estado inicial del formulario ──
  const formValues = useStore(form.store, (s) => s.values);
  const snapshot = JSON.stringify({ formValues, pasajeros, destinos, archivos: pending.map((p) => p.id) });
  const initialSnapshot = useRef<string | null>(null);
  if (initialSnapshot.current === null) initialSnapshot.current = snapshot;
  const isDirty = snapshot !== initialSnapshot.current;

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
            onClick={handleBack}
            className="flex items-center gap-1.5 text-gray-400 hover:text-black transition-colors text-[13px] font-medium mb-3 select-none"
          >
            <IoArrowBack size={15} />
            Volver
          </button>
          <h1 className="text-[29px] md:text-[32px] lg:text-[35px] font-bold text-[#1D1D1F] tracking-tight select-none cursor-default">
            Nuevo Expediente
          </h1>
        </div>

        <form.Subscribe selector={(s) => s.isSubmitting}>
          {(isSubmitting) => (
            <button
              type="button"
              onClick={handleSave}
              disabled={isSubmitting}
              className="bg-black text-white font-semibold text-[12px] md:text-[14px] px-4 md:px-6 py-2 md:py-2.5 rounded-full hover:bg-gray-800 active:scale-[0.97] transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed select-none"
            >
              {isSubmitting ? "Guardando..." : "Guardar Expediente"}
            </button>
          )}
        </form.Subscribe>
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
              <IoAirplaneOutline size={18} className="text-black" />
            </div>
          }
          title="Información de viaje"
        >
          <div className="grid grid-cols-2 md:grid-cols-6 gap-5">
            {/* Creación de reserva */}
            <form.Field name="fecha">
              {(field) => (
                <div className="flex flex-col col-span-1 md:col-span-2">
                  <FieldLabel text="Creación de reserva" invalid={showErrors && isEmpty(field.state.value)} />
                  <CustomDatePicker
                    value={field.state.value || ""}
                    onChange={(val) => { field.handleChange(val); setDateError(null); }}
                  />
                </div>
              )}
            </form.Field>

            {/* Fecha inicio */}
            <form.Field name="fecha_ida">
              {(field) => (
                <div className="flex flex-col col-span-1 md:col-span-2">
                  <FieldLabel text="Fecha de inicio" invalid={showErrors && isEmpty(field.state.value)} />
                  <CustomDatePicker
                    value={field.state.value || ""}
                    onChange={(val) => { field.handleChange(val); setDateError(null); }}
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
                  <FieldLabel text="Tipo de destino" invalid={showErrors && isEmpty(field.state.value)} />
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
                </div>
              )}
            </form.Field>

            {/* Sucursal conectada al Form */}
            <form.Field name="sucursal_id">
              {(field) => (
                <div className="flex flex-col col-span-1 md:col-span-2">
                  <FieldLabel text="Sucursal" invalid={showErrors && isEmpty(field.state.value)} />
                  <CustomSelect
                    value={field.state.value}
                    onChange={(val) => field.handleChange(Number(val))}
                    options={SUCURSALES}
                  />
                </div>
              )}
            </form.Field>

            {/* Pago conectado al Form */}
            <form.Field name="pago">
              {(field) => (
                <div className="flex flex-col col-span-1 md:col-span-2">
                  <FieldLabel text="Pago" invalid={showErrors && isEmpty(field.state.value)} />
                  <CustomSelect
                    value={field.state.value ?? null}
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
                  <FieldLabel text="Tipo de moneda" invalid={showErrors && isEmpty(field.state.value)} />
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
                </div>
              )}
            </form.Field>

            {(selectedMoneda === 1 || selectedMoneda === 3) ? (
              <form.Field name="valor_total">
                {(field) => (
                  <div className="flex flex-col col-span-1 md:col-span-3">
                    <FieldLabel text="Valor total ARS" invalid={showErrors && isEmpty(field.state.value)} />
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
                    <FieldLabel text="Cotización USD / ARS" invalid={showErrors && isEmpty(field.state.value)} />
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
                    <FieldLabel text="Valor total USD" invalid={showErrors && isEmpty(field.state.value)} />
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
          <PasajerosSection pasajeros={pasajeros} onChange={setPasajeros} showErrors={showErrors} requireNombreTitular fechaFin={viajeHasta} />        </SectionCard>

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
          />
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
    </div>
  );
}

export default CreateTrip;