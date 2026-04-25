import { Table } from "../layout/Table";
import { formattedAmount } from "../utils/utils";
import { FiTrash2 } from "react-icons/fi";

const headers = [
    { label: "ID", key: "id" },
    { label: "Motivo", key: "motivo" },
    { label: "Fecha", key: "fecha" },
    { label: "Monto", key: "monto" },
    { label: "Acciones", key: "acciones" },
];

export interface Expense {
    id: number;
    motivo: string;
    fecha?: string;
    moneda: string;
    cotizacion: number | null;
    costo: number;
}

export function ExpensesTable({
    expenses,
}: {
    expenses: Expense[];
}) {
    return (
        <div className="select-none">
            <Table
                headers={headers}
                data={expenses}
                noDataMessage="No hay expensas disponibles para este período."
                renderRow={(expense) => (
                    <tr
                        key={expense.id}
                        className="border-b border-gray-250 hover:bg-gray-100 transition-colors cursor-pointer group"
                    >
                        <td className="py-3 md:py-4 px-2 md:px-4 text-[12px] md:text-sm font-bold text-gray-700 text-center">
                            {expense.id}
                        </td>
                        <td className="py-3 md:py-4 px-2 md:px-4 text-[12px] md:text-sm font-medium text-gray-600 text-center">
                            {expense.motivo}
                        </td>
                        <td className="py-3 md:py-4 px-2 md:px-4 text-[12px] md:text-sm font-medium text-gray-600 text-center">
                            {expense.fecha ? new Date(expense.fecha).toLocaleDateString("es-AR") : "-"}
                        </td>
                        <td className="py-3 md:py-4 px-2 md:px-4 text-[12px] md:text-sm font-bold text-gray-800 text-center uppercase">
                            {expense.moneda} {formattedAmount(expense.costo)}
                        </td>
                        <td className="py-3 md:py-4 px-1 md:px-4 text-center">
                            <div className="flex justify-center gap-5">
                                <button
                                    className="text-red-400 hover:text-red-600 shadow-sm transition-colors"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        console.log("Eliminar expensa", expense.id);
                                    }}
                                    title="Eliminar"
                                >
                                    <FiTrash2 size={16} />
                                </button>
                            </div>
                        </td>
                    </tr>
                )}
            />
        </div>
    );
}
