import { useEffect, useRef, useState } from "react";
import {
  IoChevronBack,
  IoChevronForward,
  IoReloadOutline,
} from "react-icons/io5";
import { Filter } from "../components/common/ui/Filter";
import { dashboardStore } from "../store/dashboardStore";
import { ExpedientesView } from "../components/common/dashboard/ExpedientesView";
import { ProductosView } from "../components/common/dashboard/ProductosView";
import { FinanzasView } from "../components/common/dashboard/FinanzasView";
import { ExpensasView } from "../components/common/dashboard/ExpensasView";

const VISTAS = [
  { key: "expedientes", title: "Expedientes", View: ExpedientesView },
  { key: "productos", title: "Destinos y Servicios", View: ProductosView },
  { key: "finanzas", title: "Finanzas", View: FinanzasView },
  { key: "expensas", title: "Expensas", View: ExpensasView },
] as const;

const Dashboard = () => {
  const { year, setYear, month, setMonth, sucursal, setSucursal, vista, setVista, resetFilters } =
    dashboardStore();
  // Dirección del último cambio, para animar la entrada desde el lado correcto
  const [direction, setDirection] = useState<"left" | "right">("right");
  const vistaRef = useRef(vista);
  vistaRef.current = vista;

  const goTo = (index: number) => {
    const next = (index + VISTAS.length) % VISTAS.length;
    if (next === vistaRef.current) return;
    setDirection(index > vistaRef.current ? "right" : "left");
    setVista(next);
  };

  // Flechas del teclado para pasar de vista (salvo mientras se escribe en un campo)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.key === "ArrowRight") goTo(vistaRef.current + 1);
      if (e.key === "ArrowLeft") goTo(vistaRef.current - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const actual = VISTAS[vista] ?? VISTAS[0];
  const { View } = actual;

  return (
    <div className="max-w-[1000px] mx-auto px-4 pt-24 md:pt-28 pb-16">
      <div className="mb-4 md:mb-6">
        <h1 className="text-[29px] md:text-[32px] lg:text-[35px] font-bold text-[#1D1D1F] tracking-tight select-none cursor-default">
          Estadísticas
        </h1>
      </div>

      {/* Filtros globales: afectan a la vista activa */}
      <div className="flex items-center gap-3 text-xs mb-4 md:mb-6 select-none flex-wrap">
        <Filter
          year={year}
          setYear={setYear}
          month={month}
          setMonth={setMonth}
          sucursal={sucursal}
          setSucursal={setSucursal}
        />
        <button
          className="text-gray-400 font-medium hover:text-black hover:bg-gray-100 hover:rotate-180 transition-all duration-300 ml-1 p-1 rounded-full"
          onClick={() => resetFilters()}
          title="Limpiar todos los filtros"
        >
          <IoReloadOutline size={20} />
        </button>
      </div>

      {/* Card carrusel */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between gap-2 px-3 md:px-6 py-3 md:py-4 border-b border-gray-100">
          <button
            type="button"
            onClick={() => goTo(vista - 1)}
            className="w-9 h-9 rounded-full flex items-center justify-center text-gray-500 hover:text-black hover:bg-gray-100 transition-colors shrink-0"
            title={`Anterior: ${VISTAS[(vista - 1 + VISTAS.length) % VISTAS.length].title}`}
          >
            <IoChevronBack size={18} />
          </button>

          <div className="flex flex-col items-center min-w-0">
            <h2 className="text-[16px] md:text-[18px] font-semibold text-[#1D1D1F] select-none truncate">
              {actual.title}
            </h2>
            <div className="flex items-center gap-1.5 mt-2">
              {VISTAS.map((v, i) => (
                <button
                  key={v.key}
                  type="button"
                  onClick={() => goTo(i)}
                  title={v.title}
                  aria-label={v.title}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === vista ? "w-5 bg-[#1D1D1F]" : "w-1.5 bg-gray-300 hover:bg-gray-400"
                  }`}
                />
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => goTo(vista + 1)}
            className="w-9 h-9 rounded-full flex items-center justify-center text-gray-500 hover:text-black hover:bg-gray-100 transition-colors shrink-0"
            title={`Siguiente: ${VISTAS[(vista + 1) % VISTAS.length].title}`}
          >
            <IoChevronForward size={18} />
          </button>
        </div>

        <div
          key={actual.key}
          className={`p-4 md:p-6 ${direction === "right" ? "animate-slide-in-right" : "animate-slide-in-left"}`}
        >
          <View />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
