import Swal from "sweetalert2";
import { Table } from "../../../layout/Table";
import { formattedAmount, toDateDisplay } from "../../../utils/utils";
import type { Expense } from "../../../types/types";
import { LuTrash2 } from "react-icons/lu";

const headers = [
    { label: "ID", key: "id" },
    { label: "Motivo", key: "motivo" },
    { label: "Fecha", key: "fecha" },
    { label: "Cotización", key: "cotizacion" },
    { label: "Monto", key: "monto" },
    { label: "Acciones", key: "acciones" },
];

export function ExpensesTable({
    expenses,
    onDelete,
}: {
    expenses: Expense[];
    onDelete: (id: number) => void;
}) {
    const handleDelete = (expense: Expense) => {
        Swal.fire({
            title: `Eliminar gasto "${expense.motivo}"`,
            text: "¿Estás seguro? Esta acción es irreversible.",
            width: "300px",
            showCancelButton: true,
            confirmButtonText: "Eliminar",
            cancelButtonText: "Cancelar",
            reverseButtons: true,
            backdrop: `rgba(0,0,0,0.3)`,
            color: "#1D1D1F",
            background: "#ffffff",
            customClass: {
                popup: "rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 py-5 px-3",
                title: "text-[16px] font-semibold text-black mt-0",
                htmlContainer: "text-[13px] text-gray-500 font-medium mt-1 mb-6 mx-0",
                actions: "flex w-full gap-2 px-3 m-0",
                confirmButton: "flex-1 bg-[#FF3B30] hover:bg-[#E3342B] text-white font-semibold py-2.5 rounded-xl transition-colors text-[13px] m-0",
                cancelButton: "flex-1 bg-[#e8e8e8] hover:bg-[#dcdcdc] text-black font-semibold py-2.5 rounded-xl transition-colors text-[13px] m-0",
            },
        }).then((result) => {
            if (result.isConfirmed) {
                onDelete(expense.id);
            }
        });
    };

    return (
        <div className="select-none">
            <Table
                headers={headers}
                data={expenses}
                noDataMessage="No hay expensas disponibles para este período."
                renderRow={(expense) => (
                    <tr
                        key={expense.id}
                        className="border-b border-gray-250 hover:bg-gray-100 transition-colors group"
                    >
                        <td className="py-3 md:py-4 px-2 md:px-4 text-[12px] md:text-sm font-bold text-gray-700 text-center">
                            {expense.id}
                        </td>
                        <td className="py-3 md:py-4 px-2 md:px-4 text-[12px] md:text-sm font-medium text-gray-600 text-center">
                            {expense.motivo}
                        </td>
                        <td className="py-3 md:py-4 px-2 md:px-4 text-[12px] md:text-sm font-medium text-gray-600 text-center">
                            {toDateDisplay(expense.fecha) || "-"}
                        </td>
                        <td className="py-3 md:py-4 px-2 md:px-4 text-[12px] md:text-sm font-bold text-gray-800 text-center">
                            {expense.cotizacion ? `$${formattedAmount(expense.cotizacion)}` : "-"}
                        </td>
                        <td className="py-3 md:py-4 px-2 md:px-4 text-[12px] md:text-sm font-bold text-gray-800 text-center uppercase">
                            {expense.moneda} {formattedAmount(expense.monto)}
                        </td>
                        <td className="py-3 md:py-4 px-1 md:px-4 text-center">
                            <div className="flex justify-center gap-5">
                                <button
                                    className="text-gray-500 hover:text-red-600 transition-colors"
                                    onClick={() => handleDelete(expense)}
                                    title="Eliminar"
                                >
                                    <LuTrash2 size={16} />
                                </button>
                            </div>
                        </td>
                    </tr>
                )}
            />
        </div>
    );
}