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
            <div className="max-w-[1000px] mx-auto mt-28 mb-4 px-4">
                <h1 className="text-[35px] font-semibold text-black select-none cursor-default mb-8">
                    Expensas
                </h1>

                <div className="flex items-center gap-4 mb-8 select-none flex-wrap">
                    <button
                        className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white flex-shrink-0 hover:bg-gray-800 transition-colors shadow-[0_4px_10px_rgba(0,0,0,0.15)]"
                        onClick={() => setIsCreateModalOpen(true)}
                    >
                        <IoAdd size={26} />
                    </button>

                    <div className="relative w-[280px] group flex-shrink-0">
                        <IoSearch size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Buscar por legajo o nombre"
                            value={searchTerm}
                            onChange={searchHandleChange}
                            className="w-full pl-[38px] pr-4 py-2.5 bg-[#e8e8e8] rounded-full border border-transparent focus:ring-1 focus:ring-gray-400 focus:outline-none transition-all text-[14px] font-medium text-[#1D1D1F] placeholder:text-gray-500"
                        />
                    </div>



                    <div className="flex-grow"></div>

                    <div className="flex items-center gap-2 text-xs">
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
