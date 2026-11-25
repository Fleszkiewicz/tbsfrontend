// Paleta, formatos y helpers del Dashboard (separados de los componentes por Fast Refresh)

// ─── Paleta (coherente con los badges de estado de la app) ───────────────────
export const C = {
  ink: "#1D1D1F",
  gray: "#9CA3AF",
  grayLight: "#E5E7EB",
  grid: "#F0F0F0",
  emerald: "#10B981",
  blue: "#3B82F6",
  amber: "#F59E0B",
  orange: "#F97316",
  yellow: "#EAB308",
  red: "#EF4444",
  violet: "#8B5CF6",
  pink: "#EC4899",
  cyan: "#06B6D4",
  teal: "#14B8A6",
  indigo: "#6366F1",
};

// Colores vivos (misma saturación que Estados de expedientes) para series con muchas categorías
export const VIVOS = [C.blue, C.emerald, C.orange, C.violet, C.pink, C.cyan, C.yellow, C.red, C.teal, C.indigo, C.amber];

export const SUCURSAL_COLORS: Record<string, string> = { Baradero: C.blue, Hurlingham: C.violet, "Sin sucursal": C.cyan };


export const AXIS_TICK = { fontSize: 12, fill: C.gray };

// ─── Formatos ────────────────────────────────────────────────────────────────
export type Moneda = "ARS" | "USD";

export const fmtNum = (n: number) => Number(n || 0).toLocaleString("es-AR", { maximumFractionDigits: 0 });

export const fmtMoney = (n: number, moneda: Moneda) =>
  `${n < 0 ? "-" : ""}${moneda === "ARS" ? "$" : "USD"} ${fmtNum(Math.abs(n))}`;

export const fmtCompact = (n: number) =>
  Number(n || 0).toLocaleString("es-AR", { notation: "compact", maximumFractionDigits: 1 });

export const fmtPct = (n: number) => `${Number(n || 0).toLocaleString("es-AR", { maximumFractionDigits: 1 })} %`;

export const pct = (part: number, total: number) => (total > 0 ? (part / total) * 100 : 0);

export const capitalize = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

const MESES_CORTOS = Array.from({ length: 12 }, (_, i) =>
  capitalize(new Date(2000, i, 1).toLocaleString("es-AR", { month: "short" }).replace(".", "")),
);

const MESES_LARGOS = Array.from({ length: 12 }, (_, i) =>
  capitalize(new Date(2000, i, 1).toLocaleString("es-AR", { month: "long" })),
);

export const mesCorto = (mes: number) => MESES_CORTOS[mes - 1] ?? String(mes);
export const mesLargo = (mes: number) => MESES_LARGOS[mes - 1] ?? String(mes);

/** Completa los 12 meses del año (los que no vienen del backend quedan en 0) */
export function fillMonths<T extends { mes_num: number }>(
  rows: T[],
  empty: Omit<T, "mes_num">,
): (T & { mes: string })[] {
  return Array.from({ length: 12 }, (_, i) => {
    const found = rows.find((r) => r.mes_num === i + 1);
    return { ...(empty as T), ...(found ?? {}), mes_num: i + 1, mes: mesCorto(i + 1) };
  });
}

