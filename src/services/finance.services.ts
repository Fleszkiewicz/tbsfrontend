import { api, API_URL } from "../config/axios";
import type { FinanceApiResponse } from "../types/types";

const API_ENDPOINT = `${API_URL}/finance`;

export async function getSummary(
  year: number | null,
  month: number | null,
  currency: "ARS" | "USD" | null
): Promise<FinanceApiResponse | null> {
  try {
    const { data } = await api.get<FinanceApiResponse>(API_ENDPOINT, {
      params: {
        anio: year ?? "",
        mes: month ?? "",
        moneda: currency ?? "",
      },
    });

    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
}
