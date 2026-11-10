import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { IoAddOutline } from "react-icons/io5";
import { LuTrash2 } from "react-icons/lu";
import { toast } from "sonner";
import { CustomSelect } from "./CustomSelect";
import { CustomDatePicker } from "./CustomDatePicker";
import { FieldLabel } from "./FieldLabel";
import { useDebounce } from "../../../hooks/useDebounce";
import { buscarPasajerosPorDni } from "../../../services/pasajeros.services";
import { CATEGORIAS_EDAD } from "../../../utils/constants";
import { emptyPasajero, normalizeDni } from "../../../utils/pasajeros";
import type { PasajeroBusqueda, PasajeroForm } from "../../../types/types";

const inputCls =
    "w-full bg-[#f0f0f0] rounded-xl px-3 md:px-4 py-2 md:py-2.5 text-[13px] md:text-[14px] font-medium text-[#1D1D1F] outline-none focus:ring-2 focus:ring-black/10 transition-all placeholder:text-gray-400 border-none";
const labelCls =
    "block text-[11px] md:text-[12px] text-gray-400 font-medium mb-1 md:mb-1.5 select-none";

const getExpirationBadge = (dateStr: string) => {
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

type CardProps = {
    p: PasajeroForm;
    index: number;
    showErrors: boolean;
    requireNombreTitular: boolean;
    onUpdate: (patch: Partial<PasajeroForm>) => void;
    onRemove: () => void;
};

function PasajeroCard({ p, index, showErrors, requireNombreTitular, onUpdate, onRemove }: CardProps) {
    const [open, setOpen] = useState(false);
    const boxRef = useRef<HTMLDivElement>(null);

    const dni = normalizeDni(p.dni);
    const debouncedDni = useDebounce(dni, 300);

    const { data: sugerencias = [] } = useQuery({
        queryKey: ["pasajeros-dni", debouncedDni],
        queryFn: () => buscarPasajerosPorDni(debouncedDni),
        enabled: debouncedDni.length >= 3,
        staleTime: 30_000,
    });

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (boxRef.current && !boxRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const exacto = debouncedDni === dni ? sugerencias.find((s) => s.dni === dni) : undefined;
    const conflicto = !!exacto && exacto.id !== p.pasajero_id;
    const quienEs = exacto ? [exacto.nombre, exacto.apellido].filter(Boolean).join(" ") : "";

    const handleDni = (value: string) => {
        const patch: Partial<PasajeroForm> = { dni: value };
        // Si se cambia un DNI que ya estaba guardado, se trata de otra persona
        if (p.dni_original && normalizeDni(value) !== p.dni_original) {
            patch.pasajero_id = null;
        }
        onUpdate(patch);
        setOpen(true);
    };

    const handleSelect = (s: PasajeroBusqueda) => {
        onUpdate({
            pasajero_id: s.id,
            dni: s.dni,
            dni_original: s.dni,
            nombre: s.nombre ?? "",
            apellido: s.apellido,
            email: s.email ?? "",
            telefono: s.telefono ?? "",
            pasaporte: s.pasaporte ?? "",
            vencimiento_dni: s.vencimiento_dni ?? "",
            vencimiento_pasaporte: s.vencimiento_pasaporte ?? "",
        });
        setOpen(false);
    };

    const apellidoInvalido = showErrors && !p.apellido.trim();
    const nombreInvalido = showErrors && requireNombreTitular && p.es_titular && !p.nombre.trim();

    return (
        <div className="border border-gray-200 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
                <p className="text-[14px] font-semibold text-[#1D1D1F] select-none">
                    {p.es_titular ? "Pasajero 1  -  Titular de la reserva" : `Pasajero ${index + 1}`}
                </p>
                {!p.es_titular && (
                    <button
                        type="button"
                        onClick={onRemove}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        title="Eliminar pasajero"
                    >
                        <LuTrash2 size={16} />
                    </button>
                )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                {/* ── Fila 1: Nombre, Apellido, Edad ── */}
                <div className="flex flex-col col-span-1 md:col-span-2">
                    <FieldLabel text="Nombre" invalid={nombreInvalido} />
                    <input
                        type="text"
                        placeholder="Nombre"
                        value={p.nombre}
                        onChange={(e) => onUpdate({ nombre: e.target.value })}
                        className={inputCls}
                    />
                </div>

                <div className="flex flex-col col-span-1 md:col-span-2">
                    <FieldLabel text="Apellido" invalid={apellidoInvalido} />
                    <input
                        type="text"
                        placeholder="Apellido"
                        value={p.apellido}
                        onChange={(e) => onUpdate({ apellido: e.target.value })}
                        className={inputCls}
                    />
                </div>

                <div className="flex flex-col col-span-2 md:col-span-2">
                    <label className={labelCls}>Edad</label>
                    <CustomSelect
                        value={p.categoria_edad}
                        onChange={(val) => onUpdate({ categoria_edad: val })}
                        options={CATEGORIAS_EDAD}
                    />
                </div>

                {/* ── Fila 2: DNI, Vencimiento DNI ── */}
                {/* DNI con autocompletado */}
                <div className="flex flex-col col-span-1 md:col-span-3 relative" ref={boxRef}>
                    <label className={labelCls}>DNI</label>
                    <input
                        type="text"
                        placeholder="00000000"
                        value={p.dni}
                        onChange={(e) => handleDni(e.target.value)}
                        onFocus={() => setOpen(true)}
                        autoComplete="off"
                        className={`${inputCls} ${conflicto ? "ring-2 ring-red-300" : ""}`}
                    />
                    {open && dni.length >= 3 && sugerencias.length > 0 && (
                        <div className="absolute top-[calc(100%+6px)] left-0 w-full min-w-[260px] bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.15)] p-1.5 z-[100] border border-gray-100/50">
                            <div className="max-h-[220px] overflow-y-auto flex flex-col gap-0.5">
                                {sugerencias.map((s) => (
                                    <button
                                        key={s.id}
                                        type="button"
                                        onClick={() => handleSelect(s)}
                                        className="text-left px-3 py-2 text-[13px] font-medium text-gray-700 hover:bg-[#f5f5f5] rounded-lg transition-colors"
                                    >
                                        {s.dni} - {[s.nombre, s.apellido].filter(Boolean).join(" ")}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    {conflicto && (
                        <em className="text-red-500 text-[12px] mt-1 font-medium not-italic">
                            DNI guardado anteriormente. Seleccionelo de las sugerencias.
                        </em>
                    )}
                </div>

                <div className="flex flex-col col-span-1 md:col-span-3">
                    <label className={labelCls}>
                        Vto DNI
                        {getExpirationBadge(p.vencimiento_dni)}
                    </label>
                    <CustomDatePicker
                        value={p.vencimiento_dni}
                        onChange={(val) => onUpdate({ vencimiento_dni: val })}
                    />
                </div>

                {/* ── Fila 3: Pasaporte, Vencimiento Pasaporte ── */}
                <div className="flex flex-col col-span-1 md:col-span-3">
                    <label className={labelCls}>Pasaporte</label>
                    <input
                        type="text"
                        placeholder="AAA000000"
                        value={p.pasaporte}
                        onChange={(e) => onUpdate({ pasaporte: e.target.value })}
                        className={inputCls}
                    />
                </div>

                <div className="flex flex-col col-span-1 md:col-span-3">
                    <label className={labelCls}>
                        Vto Pasaporte
                        {getExpirationBadge(p.vencimiento_pasaporte)}
                    </label>
                    <CustomDatePicker
                        value={p.vencimiento_pasaporte}
                        onChange={(val) => onUpdate({ vencimiento_pasaporte: val })}
                    />
                </div>

                {/* ── Fila 4: Email, Contacto ── */}
                <div className="flex flex-col col-span-1 md:col-span-3">
                    <label className={labelCls}>Email</label>
                    <input
                        type="email"
                        placeholder="correo@email.com"
                        value={p.email}
                        onChange={(e) => onUpdate({ email: e.target.value })}
                        className={inputCls}
                    />
                </div>

                <div className="flex flex-col col-span-1 md:col-span-3">
                    <label className={labelCls}>Contacto</label>
                    <input
                        type="text"
                        placeholder="+54 11 0000-0000"
                        value={p.telefono}
                        onChange={(e) => onUpdate({ telefono: e.target.value })}
                        className={inputCls}
                    />
                </div>
            </div>
        </div>
    );
}

type Props = {
    pasajeros: PasajeroForm[];
    onChange: (list: PasajeroForm[]) => void;
    showErrors?: boolean;
    requireNombreTitular?: boolean;
};

export function PasajerosSection({
    pasajeros,
    onChange,
    showErrors = false,
    requireNombreTitular = false,
}: Props) {
    const updateAt = (key: string, patch: Partial<PasajeroForm>) =>
        onChange(pasajeros.map((p) => (p.key === key ? { ...p, ...patch } : p)));

    const removeAt = (key: string) => {
        onChange(pasajeros.filter((p) => p.key !== key));
        toast.success("Pasajero eliminado.");
    };

    const add = () => {
        onChange([...pasajeros, emptyPasajero(false)]);
        toast.success("Pasajero añadido.");
    };

    return (
        <div className="flex flex-col gap-4">
            {pasajeros.map((p, index) => (
                <PasajeroCard
                    key={p.key}
                    p={p}
                    index={index}
                    showErrors={showErrors}
                    requireNombreTitular={requireNombreTitular}
                    onUpdate={(patch) => updateAt(p.key, patch)}
                    onRemove={() => removeAt(p.key)}
                />
            ))}

            <button
                type="button"
                onClick={add}
                className="flex items-center justify-center gap-2 w-full py-3 text-[13px] font-medium text-gray-500 hover:text-black hover:bg-gray-100 rounded-2xl transition-all select-none"
            >
                <IoAddOutline size={18} />
                Añadir pasajero
            </button>
        </div>
    );
}
