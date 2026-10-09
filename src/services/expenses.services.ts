import { api, API_URL } from "../config/axios";
import type {
    CreateExpenseRequest,
    ExpensesApiResponse,
    Branch,
} from "../types/types";

const API_ENDPOINT = `${API_URL}/expenses`;

export async function getExpenses(
    year: number,
    month: number | null,
    currency: "ARS" | "USD" | null,
    sucursal: Branch | null,
): Promise<ExpensesApiResponse> {
    // El backend espera el id de la moneda (1 o 2), no el texto.
    // Axios descarta los params que valen null, así que "sin filtro" no se envía.
    const moneda = currency === "ARS" ? 1 : currency === "USD" ? 2 : null;

    const { data } = await api.get<ExpensesApiResponse>(API_ENDPOINT, {
        params: { year, month, moneda, sucursal },
    });
    return data;
}

export async function createExpense(expenseData: CreateExpenseRequest) {
    const { data } = await api.post(API_ENDPOINT, expenseData);
    return data;
}

export async function deleteExpense(id: number) {
    const { data } = await api.delete(`${API_ENDPOINT}/${id}`);
    return data;
}