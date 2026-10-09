import { create } from "zustand";
import type { Branch } from "../types/types";

interface ExpensesStore {
    year: number;
    month: number | null;
    currency: "ARS" | "USD" | null;
    sucursal: Branch | null;
    page: number;
    setYear: (year: number | null) => void;
    setMonth: (month: number | null) => void;
    setCurrency: (currency: "ARS" | "USD" | null) => void;
    setSucursal: (sucursal: Branch | null) => void;
    setPage: (page: number | ((prev: number) => number)) => void;
    resetFilters: () => void;
}

export const expensesStore = create<ExpensesStore>((set) => ({
    year: 2026,
    month: null,
    currency: null,
    sucursal: null,
    page: 1,
    setYear: (year) => set({ year: year ?? 2026 }),
    setMonth: (month) => set({ month }),
    setCurrency: (currency) => set({ currency }),
    setSucursal: (sucursal) => set({ sucursal }),
    setPage: (page) =>
        set((state) => ({
            page: typeof page === "function" ? page(state.page) : page,
        })),
    resetFilters: () =>
        set({ year: 2026, month: null, currency: null, sucursal: null, page: 1 }),
}));