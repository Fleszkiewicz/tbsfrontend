import {
    keepPreviousData,
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import { expensesStore } from "../store/expensesStore";
import {
    createExpense,
    deleteExpense,
    getExpenses,
} from "../services/expenses.services";

const getErrorMessage = (error: unknown, fallback: string) => {
    if (isAxiosError(error) && typeof error.response?.data?.error === "string") {
        return error.response.data.error;
    }
    return fallback;
};

export const useExpenses = () => {
    const { year, month, currency, sucursal } = expensesStore();

    return useQuery({
        queryKey: ["expenses", year, month, currency, sucursal],
        queryFn: () => getExpenses(year, month, currency, sucursal),
        placeholderData: keepPreviousData,
    });
};

export const useCreateExpense = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createExpense,
        onSuccess: () => {
            toast.success("Gasto añadido correctamente");
            queryClient.invalidateQueries({ queryKey: ["expenses"] });
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, "Error al crear el gasto"));
        },
    });
};

export const useDeleteExpense = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteExpense,
        onSuccess: () => {
            toast.success("Gasto eliminado correctamente");
            queryClient.invalidateQueries({ queryKey: ["expenses"] });
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, "Error al eliminar el gasto"));
        },
    });
};