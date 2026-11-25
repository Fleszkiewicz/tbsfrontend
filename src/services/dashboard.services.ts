import { api, API_URL } from "../config/axios";
import type { DashboardDataMap, DashboardSucursal, DashboardVista } from "../types/dashboard";

const API_ENDPOINT = `${API_URL}/dashboard`;

export async function getDashboard<V extends DashboardVista>(
  vista: V,
  year: number,
  month: number | null,
  sucursal: DashboardSucursal | null,
): Promise<DashboardDataMap[V]> {
  const { data } = await api.get<{ data: DashboardDataMap[V] }>(`${API_ENDPOINT}/${vista}`, {
    params: {
      anio: year,
      mes: month ?? "",
      sucursal: sucursal ?? "",
    },
  });
  return data.data;
}
