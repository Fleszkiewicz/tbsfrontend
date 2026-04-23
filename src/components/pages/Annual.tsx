import { useFinance } from "../hooks/useFinance";
import { financeStore } from "../store/financeStore";
import { Filter } from "../common/Filter";
import { FinanceTable } from "../common/FinanceTable";
import { IoReloadOutline } from "react-icons/io5";

function Annual() {
  const { year, month, currency, setYear, setMonthFinance, setCurrency, resetFilters } =
    financeStore();
  const { data: finance, isLoading } = useFinance();

  return (
    <>

      <div className="max-w-[1000px] mx-auto mt-28 mb-4 px-4">
        <h1 className="text-[35px] font-semibold text-black select-none cursor-default mb-8">
          Resumen de finanzas
        </h1>

        <div className="flex items-center gap-3 text-xs mb-8 select-none flex-wrap justify-start">
          <Filter
            year={year}
            setYear={setYear}
            month={month}
            setMonth={setMonthFinance}
            currency={currency}
            setCurrency={setCurrency}
          />

          <button
            className="text-gray-400 font-medium hover:text-black hover:bg-gray-100 hover:rotate-180 transition-all duration-300 ml-1 p-1 rounded-full"
            onClick={() => resetFilters()}
            title="Limpiar todos los filtros"
          >
            <IoReloadOutline size={20} />
          </button>
        </div>

        <div className="mb-4">
          {isLoading ? (
            <div className="flex justify-center p-20">
              <p className="text-gray-400 font-medium animate-pulse">Cargando finanzas...</p>
            </div>
          ) : finance ? (
            <FinanceTable financeData={finance.data} viewMode={currency} />
          ) : (
            <div className="p-20 text-center text-gray-400 font-medium">
              No se encontraron resultados
            </div>
          )}
        </div>
      </div>

    </>
  );
}

export default Annual;
