export const renderEstado = (
  estado: string,
  fechaIda?: string | null,
  fechaVuelta?: string | null
) => {
  let displayEstado = estado.toLowerCase();
  
  if (displayEstado === "finalizado" && fechaIda && fechaVuelta) {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const ida = new Date(fechaIda + "T00:00:00");
    const vuelta = new Date(fechaVuelta + "T00:00:00");

    if (hoy >= ida && hoy <= vuelta) {
      displayEstado = "en curso";
    }
  }

  const base =
    "text-[12px] font-light px-2 py-0.5 rounded-full capitalize text-center whitespace-nowrap";
  const colores: Record<string, string> = {
    cancelado: "text-red-600 bg-red-100",
    pendiente: "text-yellow-600 bg-yellow-100",
    finalizado: "text-green-600 bg-green-100",
    "en curso": "text-blue-600 bg-blue-100",
  };
  return <span className={`${base} ${colores[displayEstado] || ""}`}>{displayEstado}</span>;
};
