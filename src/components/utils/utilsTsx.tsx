export const renderEstado = (estado: string) => {
  const base =
    "text-[12px] font-light px-1.5 py-0.5 rounded-full capitalize text-center";
  const colores: Record<string, string> = {
    cancelado: "text-red-500 bg-red-100",
    pendiente: "text-yellow-500 bg-yellow-100",
    finalizado: "text-green-500 bg-green-100",
  };
  return <span className={`${base} ${colores[estado] || ""}`}>{estado}</span>;
};
