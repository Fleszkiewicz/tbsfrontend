import { useState } from "react";
import { Filter } from "../common/Filter";
import { Pagination } from "../common/Pagination";
import { ExpensesTable } from "../common/ExpensesTable";
import type { Expense } from "../common/ExpensesTable";
import { expensesStore } from "../store/expensesStore";
import { IoSearch, IoAdd, IoReloadOutline } from "react-icons/io5";
import { ExpenseCreateModal } from "../common/ExpenseCreateModal";

const MOCK_EXPENSES: Expense[] = [
    { id: 1, motivo: "Alquiler Oficina", moneda: "ARS", cotizacion: null, costo: 150000 },
    { id: 2, motivo: "Servicio Cloud", moneda: "USD", cotizacion: 1100, costo: 50 },
    { id: 3, motivo: "Publicidad Meta", moneda: "USD", cotizacion: 1100, costo: 200 },
    { id: 4, motivo: "Insumos Limpieza", moneda: "ARS", cotizacion: null, costo: 12000 },
];

function Expenses() {
    const { year, setYear, month, setMonth, currency, setCurrency, page, setPage, resetFilters } = expensesStore();
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const searchHandleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const filteredExpenses = MOCK_EXPENSES.filter((exp) => {
        const matchesSearch = exp.motivo.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCurrency = currency ? exp.moneda === currency : true;
        return matchesSearch && matchesCurrency;
    });

    return (
        <>
            <div className="max-w-[1000px] mx-auto mt-24 md:mt-28 mb-4 px-4">
                <h1 className="lg:text-[35px] text-[29px] font-semibold text-black select-none cursor-default mb-4 md:mb-8">
                    Expensas
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
                            placeholder="Buscar por legajo o nombre"
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
                        />
                    </div>
                </div>

                {/* Tabla */}
                <div className="mb-2">
                    <ExpensesTable expenses={filteredExpenses} />
                </div>
                {/* Paginación */}
                <div className="flex justify-start mt-4 select-none">
                    <Pagination page={page} setPage={setPage} />
                </div>
            </div>

            {isCreateModalOpen && (
                <section
                    className="fixed inset-0 bg-black/40 z-[1000] flex items-center justify-center p-4 animate-in fade-in duration-200"
                    onClick={() => setIsCreateModalOpen(false)}
                >
                    <ExpenseCreateModal onClose={() => setIsCreateModalOpen(false)} />
                </section>
            )}
        </>
    );
}

export default Expenses;
