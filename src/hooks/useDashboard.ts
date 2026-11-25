import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { dashboardStore } from "../store/dashboardStore";
import { getDashboard } from "../services/dashboard.services";
import type { DashboardVista } from "../types/dashboard";

/** Datos de una vista del Dashboard; solo se pide la vista visible del carrusel */
export function useDashboard<V extends DashboardVista>(vista: V) {
  const { year, month, sucursal } = dashboardStore();

  return useQuery({
    queryKey: ["dashboard", vista, year, month, sucursal],
    queryFn: () => getDashboard(vista, year, month, sucursal),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
}
