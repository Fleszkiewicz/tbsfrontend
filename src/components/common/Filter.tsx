import { IoFunnelOutline } from "react-icons/io5";

type Props = {
  filter?: string;
  setFilter?: (filter: string) => void;
  year?: number | null;
  setYear?: (year: number | null) => void;
  month?: number | null;
  setMonth?: (month: number | null) => void;
  currency?: "ARS" | "USD" | null;
  setCurrency?: (currency: "ARS" | "USD" | null) => void;
};

export const Filter = ({
  filter,
  year,
  month,
  currency,
  setFilter,
  setYear,
  setMonth,
  setCurrency,
}: Props) => {
  return (
    <div className="flex gap-3 items-center">
      <IoFunnelOutline size={30} className="text-gray-400 mr-2 ml-6" />
      {setFilter && (
        <div className="flex flex-col">
          <span className="font-semibold">Tipo:</span>
          <select
            name="filtro"
            id="filtro"
            onChange={(e) => {
              setFilter(e.target.value);
            }}
            value={filter ?? "desc"}
            className="w-[120px] border border-gray-300 rounded px-2 py-1 shadow-sm"
          >
            <option value="asc">Antiguos</option>
            <option value="desc">Recientes</option>
            <option value="pendiente">Pendiente</option>
            <option value="finalizado">Finalizado</option>
          </select>
        </div>
      )}

      {/* Año */}
      {setYear && (
        <div className="flex flex-col">
          <span className="font-semibold">Año:</span>
          <select
            onChange={(e) => {
              const val = e.target.value;
              setYear(val === "" ? null : Number(val));
            }}
            value={year ?? ""}
            className="w-[90px] border border-gray-300 rounded px-2 py-1 shadow-sm"
          >
            <option value={""}>Todos</option>
            {Array.from(
              { length: new Date().getFullYear() - 2024 + 1 },
              (_, i) => {
                const y = new Date().getFullYear() - i;
                return (
                  <option key={y} value={y}>
                    {y}
                  </option>
                );
              }
            )}
          </select>
        </div>
      )}

      {/* Mes */}
      {setMonth && (
        <div className="flex flex-col">
          <span className="font-semibold">Mes:</span>
          <select
            value={month ?? ""}
            onChange={(e) => {
              const val = e.target.value;
              setMonth(val === "" ? null : Number(val));
            }}
            className="w-[100px] border border-gray-300 rounded px-2 py-1 shadow-sm capitalize"
          >
            <option value={""}>Mes</option>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(0, i).toLocaleString("es-AR", { month: "long" })}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Moneda */}
      {setCurrency && (
        <div className="flex flex-col">
          <span className="font-semibold mb-1">Moneda:</span>
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              type="button"
              onClick={() => setCurrency(null)}
              className={`px-3 py-1 text-sm font-medium border border-gray-300 rounded-l-md hover:bg-gray-50 focus:z-10 focus:ring-2 focus:ring-gray-500 focus:text-gray-700 ${!currency
                ? "bg-gray-100 text-gray-900 z-10 font-bold"
                : "bg-white text-gray-700"
                }`}
            >
              Todos
            </button>
            <button
              type="button"
              onClick={() => setCurrency("ARS")}
              className={`px-3 py-1 text-sm font-medium border-t border-b border-gray-300 hover:bg-gray-50 focus:z-10 focus:ring-2 focus:ring-blue-500 focus:text-blue-700 ${currency === "ARS"
                ? "bg-blue-50 text-blue-700 z-10 font-bold"
                : "bg-white text-gray-700"
                }`}
            >
              ARS
            </button>
            <button
              type="button"
              onClick={() => setCurrency("USD")}
              className={`px-3 py-1 text-sm font-medium border border-gray-300 rounded-r-md hover:bg-gray-50 focus:z-10 focus:ring-2 focus:ring-green-500 focus:text-green-700 ${currency === "USD"
                ? "bg-green-50 text-green-700 z-10 font-bold"
                : "bg-white text-gray-700"
                }`}
            >
              USD
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
