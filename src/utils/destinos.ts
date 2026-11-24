import type {
    DestinoEntry,
    DestinoPayload,
    DestinoServiceDetail,
    DestinoServicePayload,
} from "../types/types";

const toNum = (v: unknown): number => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
};

const toDay = (v: unknown): string =>
    typeof v === "string" ? v.slice(0, 10) : "";

const ddmmyyyy = (iso: string): string => {
    const [y, m, d] = iso.split("-");
    return `${d}/${m}/${y}`;
};

// ── API → formulario ──────────────────────────────────────────────────────────
export const servicioFromApi = (s: DestinoServiceDetail): DestinoServiceDetail => ({
    servicio_tipo_id: toNum(s.servicio_tipo_id),
    nombre: s.nombre ?? undefined,
    valor: toNum(s.valor),
    moneda_id: toNum(s.moneda_id) === 2 ? 2 : 1,
    cotizacion: s.cotizacion != null ? toNum(s.cotizacion) : null,
    pagado_por: s.pagado_por ?? "pendiente",
    observacion: s.observacion ?? null,
});

export const destinosFromApi = (
    destinos: DestinoEntry[] | null | undefined,
): DestinoEntry[] =>
    (destinos ?? []).map((d) => ({
        destino_id: d.destino_id,
        destino: d.destino ?? "",
        fecha_desde: toDay(d.fecha_desde),
        fecha_hasta: toDay(d.fecha_hasta),
        orden: d.orden,
        servicios: (d.servicios ?? []).map(servicioFromApi),
    }));

export const serviciosSinDestinoFromApi = (
    servicios: DestinoServiceDetail[] | null | undefined,
): DestinoServiceDetail[] => (servicios ?? []).map(servicioFromApi);

// ── formulario → API ──────────────────────────────────────────────────────────
export const servicioToPayload = (
    s: DestinoServiceDetail,
): DestinoServicePayload => ({
    servicio_tipo_id: s.servicio_tipo_id,
    valor: Number(s.valor),
    moneda_id: s.moneda_id,
    cotizacion: s.moneda_id === 2 ? s.cotizacion : null,
    pagado_por: s.pagado_por,
    observacion: s.observacion?.trim() || null,
});

export const destinoToPayload = (d: DestinoEntry): DestinoPayload => ({
    ...(d.destino_id ? { destino_id: d.destino_id } : {}),
    destino: d.destino.trim(),
    fecha_desde: d.fecha_desde,
    fecha_hasta: d.fecha_hasta,
    servicios: d.servicios.map(servicioToPayload),
});

// ── Estado (Pendiente / Confirmado) ───────────────────────────────────────────
// Un servicio está completo si tiene tipo, valor > 0, moneda 1 o 2,
// cotización > 0 cuando es USD y pagado_por distinto de "pendiente".
// La observación (descripción) no es obligatoria.
export const servicioCompleto = (s: DestinoServiceDetail): boolean => {
    if (!s.servicio_tipo_id || s.servicio_tipo_id <= 0) return false;
    if (typeof s.valor !== "number" || s.valor <= 0) return false;
    if (s.moneda_id !== 1 && s.moneda_id !== 2) return false;
    if (s.moneda_id === 2 && (!s.cotizacion || s.cotizacion <= 0)) return false;
    if (!s.pagado_por || s.pagado_por === "pendiente") return false;
    return true;
};

export const serviciosEstado = (
    servicios: DestinoServiceDetail[],
): "pendiente" | "confirmado" =>
    servicios.length > 0 && servicios.every(servicioCompleto)
        ? "confirmado"
        : "pendiente";

export const destinoEstado = (d: DestinoEntry): "pendiente" | "confirmado" => {
    if (!d.fecha_desde || !d.fecha_hasta) return "pendiente";
    return serviciosEstado(d.servicios);
};

// ── Validación bloqueante de fechas ───────────────────────────────────────────
export const getDestinoDateError = (
    d: Pick<DestinoEntry, "fecha_desde" | "fecha_hasta">,
    viajeDesde: string,
    viajeHasta: string,
): string | null => {
    if (d.fecha_desde && d.fecha_hasta && d.fecha_hasta < d.fecha_desde) {
        return "La fecha \"Hasta\" no puede ser anterior a \"Desde\".";
    }
    if (!viajeDesde || !viajeHasta) return null;
    const fuera = (f: string) => !!f && (f < viajeDesde || f > viajeHasta);
    if (fuera(d.fecha_desde) || fuera(d.fecha_hasta)) {
        return `Exceso de fechas: el destino debe estar dentro del expediente (${ddmmyyyy(viajeDesde)} al ${ddmmyyyy(viajeHasta)}).`;
    }
    return null;
};