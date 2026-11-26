import type { FinanceData } from "../../../types/types";
import { formattedAmount } from "../../../utils/utils";
import { FiTrendingDown, FiTrendingUp } from "react-icons/fi";

// Nombres de los meses armados en el front: el SP los devuelve con MONTHNAME() (en inglés)
const MESES = Array.from({ length: 12 }, (_, i) =>
  new Date(2000, i, 1).toLocaleString("es-AR", { month: "long" })
);

const EMPTY_RESUMEN = { ingreso: 0, egreso: 0, ganancia: 0 };

// Ancho de las celdas fantasmas por moneda: ingreso, egreso, ganancia
const skeletonCells = ["w-20", "w-20", "w-24"];

export function FinanceTable({
  financeData,
  viewMode = null,
  month = null,
  isLoading = false,
}: {
  financeData: FinanceData | undefined;
  viewMode?: "ARS" | "USD" | null;
  month?: number | null;
  /** Mientras carga: misma cabecera y filas fantasmas */
  isLoading?: boolean;
}) {
  const isAll = viewMode === null;
  const showArs = viewMode === "ARS" || isAll;
  const showUsd = viewMode === "USD" || isAll;

  const getUsdClass = (base: string) => isAll ? `${base} hidden md:table-cell` : base;

  // Siempre los 12 meses del año elegido (o solo el mes filtrado); los meses sin movimiento van con guion
  const meses = month ? [month] : Array.from({ length: 12 }, (_, i) => i + 1);
  const filas = meses.map((mesNum) => ({
    mesNum,
    item: financeData?.find((f) => Number(f.mes_num) === mesNum),
  }));

  const emptyCell = <span className="text-gray-300">-</span>;

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full border-collapse bg-white">
          <thead>
            <tr className="bg-black text-white">
              <th rowSpan={2} className="py-4 px-3 md:px-6 text-left text-[14px] font-semibold align-middle text-center border-l border-white/20">
                Mes
              </th>
              {showArs && (
                <th colSpan={3} className="py-3 px-1 md:px-4 text-[14px] font-bold text-center border-l border-white/20">
                  ARS
                </th>
              )}
              {showUsd && (
                <th colSpan={3} className={getUsdClass("py-3 px-1 md:px-4 text-[14px] font-bold text-center border-l border-white/20")}>
                  USD
                </th>
              )}
            </tr>
            <tr className="bg-black text-white">
              {showArs && (
                <>
                  <th className="py-2 px-1 md:px-4 text-[11px] md:text-[12px] font-light text-center border-l border-white/20 text-gray-300">Ingreso</th>
                  <th className="py-2 px-1 md:px-4 text-[11px] md:text-[12px] font-light text-center text-gray-300">Egreso</th>
                  <th className="py-2 px-1 md:px-4 text-[11px] md:text-[12px] font-semibold text-center text-white">Ganancia</th>
                </>
              )}
              {showUsd && (
                <>
                  <th className={getUsdClass("py-2 px-1 md:px-4 text-[11px] md:text-[12px] font-light text-center border-l border-white/20 text-gray-300")}>Ingreso</th>
                  <th className={getUsdClass("py-2 px-1 md:px-4 text-[11px] md:text-[12px] font-light text-center text-gray-300")}>Egreso</th>
                  <th className={getUsdClass("py-2 px-1 md:px-4 text-[11px] md:text-[12px] font-semibold text-center text-white")}>Ganancia</th>
                </>
              )}
            </tr>
          </thead>
          <tbody className={`divide-y divide-gray-100 ${isLoading ? "animate-pulse" : ""}`} aria-busy={isLoading || undefined}>
            {isLoading && meses.map((mesNum) => (
              <tr key={mesNum}>
                <td className="py-4 px-3 md:px-6">
                  <div className="h-3.5 w-9 bg-gray-200 rounded-md" />
                </td>
                {showArs && skeletonCells.map((w, i) => (
                  <td key={`ars-${i}`} className="px-1 md:px-4 py-4">
                    <div className={`h-3.5 ${w} bg-gray-200 rounded-md mx-auto`} />
                  </td>
                ))}
                {showUsd && skeletonCells.map((w, i) => (
                  <td key={`usd-${i}`} className={getUsdClass(`px-1 md:px-4 py-4 ${i === 0 ? "border-l border-gray-100" : ""}`)}>
                    <div className={`h-3.5 ${w} bg-gray-200 rounded-md mx-auto`} />
                  </td>
                ))}
              </tr>
            ))}
            {!isLoading && filas.map(({ mesNum, item }) => {
              const sinMovimiento = !item;
              const ars = item?.resumen.find((r) => r.moneda === "ars") || EMPTY_RESUMEN;
              const usd = item?.resumen.find((r) => r.moneda === "usd") || EMPTY_RESUMEN;

              return (
                <tr key={mesNum} className="group hover:bg-gray-50 transition-colors">
                  <td className="whitespace-nowrap py-4 px-3 md:px-6 text-[13px] md:text-[14px] font-semibold text-[#1D1D1F] capitalize">
                    {MESES[mesNum - 1].slice(0, 3)}
                  </td>

                  {showArs && (
                    <>
                      <td className="whitespace-nowrap px-1 md:px-4 py-4 text-[12px] md:text-[14px] text-gray-600 text-center">
                        {sinMovimiento ? emptyCell : `$${formattedAmount(Number(ars.ingreso))}`}
                      </td>
                      <td className="whitespace-nowrap px-1 md:px-4 py-4 text-[12px] md:text-[14px] text-gray-600 text-center">
                        {sinMovimiento ? emptyCell : `$${formattedAmount(Number(ars.egreso))}`}
                      </td>
                      <td className={`whitespace-nowrap px-1 md:px-4 py-4 text-[12px] md:text-[14px] font-semibold text-center ${Number(ars.ganancia) >= 0 ? 'text-[#34C759]' : 'text-[#FF3B30]'}`}>
                        {sinMovimiento ? emptyCell : (
                          <>
                            {Number(ars.ganancia) >= 0 ? <FiTrendingUp size={14} className="inline-block mr-1 md:mr-2" /> : <FiTrendingDown size={14} className="inline-block mr-1 md:mr-2" />}
                            ${formattedAmount(Number(ars.ganancia))}
                          </>
                        )}
                      </td>
                    </>
                  )}

                  {showUsd && (
                    <>
                      <td className={getUsdClass("whitespace-nowrap px-1 md:px-4 py-4 text-[12px] md:text-[14px] text-gray-600 text-center border-l border-gray-100")}>
                        {sinMovimiento ? emptyCell : `$${formattedAmount(Number(usd.ingreso))}`}
                      </td>
                      <td className={getUsdClass("whitespace-nowrap px-1 md:px-4 py-4 text-[12px] md:text-[14px] text-gray-600 text-center")}>
                        {sinMovimiento ? emptyCell : `$${formattedAmount(Number(usd.egreso))}`}
                      </td>
                      <td className={getUsdClass(`whitespace-nowrap px-1 md:px-4 py-4 text-[12px] md:text-[14px] font-semibold text-center ${Number(usd.ganancia) >= 0 ? 'text-[#34C759]' : 'text-[#FF3B30]'}`)}>
                        {sinMovimiento ? emptyCell : (
                          <>
                            {Number(usd.ganancia) >= 0 ? <FiTrendingUp size={14} className="inline-block mr-1 md:mr-2" /> : <FiTrendingDown size={14} className="inline-block mr-1 md:mr-2" />}
                            ${formattedAmount(Number(usd.ganancia))}
                          </>
                        )}
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
