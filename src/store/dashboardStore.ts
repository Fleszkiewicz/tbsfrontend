import { create } from "zustand";
import type { DashboardSucursal } from "../types/dashboard";

type DashboardStore = {
  year: number;
  setYear: (year: number | null) => void;
  month: number | null;
  setMonth: (month: number | null) => void;
  sucursal: DashboardSucursal | null;
  setSucursal: (sucursal: DashboardSucursal | null) => void;
  /** Índice de la vista activa del carrusel */
  vista: number;
  setVista: (vista: number) => void;
  resetFilters: () => void;
};

export const dashboardStore = create<DashboardStore>((set) => ({
  year: new Date().getFullYear(),
  setYear: (year) => set({ year: year ?? new Date().getFullYear() }),
  month: null,
  setMonth: (month) => set({ month }),
  sucursal: null,
  setSucursal: (sucursal) => set({ sucursal }),
  vista: 0,
  setVista: (vista) => set({ vista }),
  resetFilters: () => set({ year: new Date().getFullYear(), month: null, sucursal: null }),
}));
