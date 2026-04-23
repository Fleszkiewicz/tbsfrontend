import type { FinanceData } from "../types/types";
import { formattedAmount } from "../utils/utils";
import { FiTrendingDown, FiTrendingUp } from "react-icons/fi";


export function FinanceTable({ financeData, viewMode = null }: { financeData: FinanceData; viewMode?: "ARS" | "USD" | null }) {
  // viewMode comes from parent. null = 'all'.

  const showArs = viewMode === null || viewMode === "ARS";
  const showUsd = viewMode === null || viewMode === "USD";

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full border-collapse bg-white">
          <thead>
            <tr className="bg-black text-white">
              <th rowSpan={2} className="py-4 px-6 text-left text-[14px] font-semibold align-middle text-center border-l border-white/20">
                Mes
              </th>
              {showArs && (
                <th colSpan={3} className="py-3 px-4 text-[14px] font-bold text-center border-l  border-white/20">
                  ARS
                </th>
              )}
              {showUsd && (
                <th colSpan={3} className="py-3 px-4 text-[14px] font-bold text-center border-l border-white/20">
                  USD
                </th>
              )}
            </tr>
            <tr className="bg-black text-white">
              {showArs && (
                <>
                  <th className="py-2 px-4 text-[12px] font-light text-center border-l border-white/20 text-gray-300">Ingreso</th>
                  <th className="py-2 px-4 text-[12px] font-light text-center text-gray-300">Egreso</th>
                  <th className="py-2 px-4 text-[12px] font-semibold text-center text-white">Ganancia</th>
                </>
              )}
              {showUsd && (
                <>
                  <th className="py-2 px-4 text-[12px] font-light text-center border-l border-white/20 text-gray-300">Ingreso</th>
                  <th className="py-2 px-4 text-[12px] font-light text-center text-gray-300">Egreso</th>
                  <th className="py-2 px-4 text-[12px] font-semibold text-center text-white">Ganancia</th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {financeData?.map((item) => {
              const ars = item.resumen.find((r) => r.moneda === "ars") || {
                ingreso: 0,
                egreso: 0,
                ganancia: 0,
              };
              const usd = item.resumen.find((r) => r.moneda === "usd") || {
                ingreso: 0,
                egreso: 0,
                ganancia: 0,
              };

              return (
                <tr key={item.mes_num} className="group hover:bg-gray-50 transition-colors">
                  <td className="whitespace-nowrap py-4 px-6 text-[14px] font-semibold text-[#1D1D1F]">
                    {item.mes}
                  </td>

                  {showArs && (
                    <>
                      <td className="whitespace-nowrap px-4 py-4 text-[14px] text-gray-600 text-center">
                        ${formattedAmount(Number(ars.ingreso))}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-[14px] text-gray-600 text-center">
                        ${formattedAmount(Number(ars.egreso))}
                      </td>
                      <td className={`whitespace-nowrap px-4 py-4 text-[14px] font-semibold text-center ${Number(ars.ganancia) >= 0 ? 'text-[#34C759]' : 'text-[#FF3B30]'}`}>
                        {Number(ars.ganancia) >= 0 ? <FiTrendingUp size={14} className="inline-block mr-2" /> : <FiTrendingDown size={14} className="inline-block mr-2" />}
                        ${formattedAmount(Number(ars.ganancia))}
                      </td>
                    </>
                  )}

                  {showUsd && (
                    <>
                      <td className="whitespace-nowrap px-4 py-4 text-[14px] text-gray-600 text-center border-l border-gray-100">
                        ${formattedAmount(Number(usd.ingreso))}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-[14px] text-gray-600 text-center">
                        ${formattedAmount(Number(usd.egreso))}
                      </td>
                      <td className={`whitespace-nowrap px-4 py-4 text-[14px] font-semibold text-center ${Number(usd.ganancia) >= 0 ? 'text-[#34C759]' : 'text-[#FF3B30]'}`}>
                        {Number(usd.ganancia) >= 0 ? <FiTrendingUp size={14} className="inline-block mr-2" /> : <FiTrendingDown size={14} className="inline-block mr-2" />}
                        ${formattedAmount(Number(usd.ganancia))}
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
            {(!financeData || financeData.length === 0) && (
              <tr>
                <td colSpan={viewMode === null ? 7 : 4} className="p-8 text-center text-[14px] font-light text-gray-600 ">
                  No hay datos financieros disponibles para este período.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

