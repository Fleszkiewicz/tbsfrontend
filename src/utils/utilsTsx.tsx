export const renderEstado = (estado: string) => {
  const displayEstado = estado.toLowerCase();

  const base =
    "text-[12px] font-light px-2 py-0.5 rounded-full capitalize text-center whitespace-nowrap";
  const colores: Record<string, string> = {
    pendiente: "text-orange-600 bg-orange-100",
    "en espera": "text-yellow-600 bg-yellow-100",
    "en curso": "text-blue-600 bg-blue-100",
    finalizado: "text-green-600 bg-green-100",
    cancelado: "text-red-600 bg-red-100",
  };
  return (
    <span className={`${base} ${colores[displayEstado] || ""}`}>
      {displayEstado}
    </span>
  );
};