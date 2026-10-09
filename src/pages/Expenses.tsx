import { useState } from "react";
import { Filter } from "../components/common/ui/Filter";
import { Spinner } from "../components/common/ui/widget/Spinner";
import { ExpensesTable } from "../components/common/tables/ExpensesTable";
import { expensesStore } from "../store/expensesStore";
import { useExpenses, useDeleteExpense } from "../hooks/useExpenses";
import { IoSearch, IoAdd, IoReloadOutline } from "react-icons/io5";
import { ExpenseCreateModal } from "../components/common/modals/ExpenseCreateModal";

function Expenses() {
    const { year, setYear, month, setMonth, currency, setCurrency, resetFilters, sucursal, setSucursal } =
        expensesStore();
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const { data: expensesResponse, isLoading, isError } = useExpenses();
    const { mutate: deleteExpense } = useDeleteExpense();

    const searchHandleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    // Año, mes y moneda los filtra el backend. La búsqueda por motivo,
    // al ser una lista corta, se hace acá.
    const filteredExpenses = (expensesResponse?.data ?? []).filter((exp) =>
        exp.motivo.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    return (
        <>
            <div className="max-w-[1000px] mx-auto mt-24 md:mt-28 mb-4 px-4">
                <h1 className="lg:text-[35px] text-[29px] font-semibold text-black select-none cursor-default mb-4 md:mb-8">
                    Gestionar Expensas
                </h1>

                <div className="flex items-center gap-4 mb-4 md:mb-8 select-none flex-wrap">
                    <button
                        className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-black flex items-center justify-center text-white flex-shrink-0 hover:bg-gray-800 transition-colors shadow-[0_4px_10px_rgba(0,0,0,0.15)]"
                        onClick={() => setIsCreateModalOpen(true)}
                    >
                        <IoAdd className="w-5 h-5 md:w-[26px] md:h-[26px]" />
                    </button>

                    <div className="relative w-[220px] md:w-[280px] group flex-shrink-0">
                        <IoSearch className="w-4 h-4 md:w-[18px] md:h-[18px] absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Buscar por motivo"
                            value={searchTerm}
                            onChange={searchHandleChange}
                            className="w-full pl-9 md:pl-[38px] pr-3 md:pr-4 py-1.5 md:py-2.5 bg-[#e8e8e8] rounded-full border border-transparent focus:ring-1 focus:ring-gray-400 focus:outline-none transition-all text-[12px] md:text-[14px] font-medium text-[#1D1D1F] placeholder:text-gray-500"
                        />
                    </div>

                    <div className="flex-grow"></div>

                    <div className="flex items-center gap-2 text-xs ml-1">
                        <button
                            className="text-gray-400 font-medium hover:text-black hover:rotate-180 transition-all duration-300 mr-2 p-1 rounded-full hover:bg-gray-100"
                            onClick={() => {
                                resetFilters();
                                setSearchTerm("");
                            }}
                            title="Deshacer todos los filtros"
                        >
                            <IoReloadOutline size={20} />
                        </button>
                        <Filter
                            year={year}
                            setYear={setYear}
                            month={month}
                            setMonth={setMonth}
                            currency={currency}
                            setCurrency={setCurrency}
                            sucursal={sucursal}
                            setSucursal={setSucursal}
                        />
                    </div>
                </div>

                {/* Tabla */}
                <div className="mb-2">
                    {isLoading ? (
                        <div className="flex justify-center p-20">
                            <Spinner text="Cargando gastos..." />
                        </div>
                    ) : isError ? (
                        <div className="p-20 text-center text-gray-400 font-medium">
                            No se pudieron cargar los gastos.
                        </div>
                    ) : (
                        <ExpensesTable expenses={filteredExpenses} onDelete={deleteExpense} />
                    )}
                </div>
            </div>

            <ExpenseCreateModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />
        </>
    );
}

export default Expenses;