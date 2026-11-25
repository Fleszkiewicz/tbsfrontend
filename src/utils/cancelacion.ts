// Categorías fijas de cancelación (códigos de la base, migración 025) y sus textos
export const CATEGORIAS_CANCELACION = [
  { value: "economicos", label: "Económicos" },
  { value: "problemas_familiares", label: "Problemas familiares" },
  { value: "sin_respuesta", label: "Sin respuesta del cliente" },
  { value: "otra_agencia", label: "Eligió otra agencia" },
  { value: "cambio_planes", label: "Cambio de fechas o planes" },
  { value: "salud", label: "Problemas de salud" },
  { value: "otro", label: "Otro motivo" },
] as const;

export type CategoriaCancelacion = (typeof CATEGORIAS_CANCELACION)[number]["value"];

export const categoriaCancelacionLabel = (value?: string | null): string | null =>
  CATEGORIAS_CANCELACION.find((c) => c.value === value)?.label ?? null;
