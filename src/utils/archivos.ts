export const ARCHIVO_MAX_BYTES = 10 * 1024 * 1024;

export const ARCHIVO_ACCEPT = "application/pdf,image/jpeg,image/png,image/webp";
const ALLOWED = ARCHIVO_ACCEPT.split(",");

export const ARCHIVO_CATEGORIAS = [
  { label: "Pasajeros", value: "Pasajeros" },
  { label: "Servicios", value: "Servicios" },
  { label: "Cobranza", value: "Cobranza" },
  { label: "Otros", value: "Otros" },
];

/** Devuelve el motivo del rechazo, o null si el archivo es valido */
export function archivoError(file: File): string | null {
  if (!ALLOWED.includes(file.type)) {
    return `"${file.name}": solo se permiten PDF e imágenes (JPG, PNG o WEBP).`;
  }
  if (file.size > ARCHIVO_MAX_BYTES) {
    return `"${file.name}" supera los 10 MB.`;
  }
  if (file.size === 0) {
    return `"${file.name}" está vacío.`;
  }
  return null;
}
