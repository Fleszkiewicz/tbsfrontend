import { create } from "zustand";

interface ExpensesStore {
    year: number;
    month: number | null;
    currency: "ARS" | "USD" | null;
    page: number;
    setYear: (year: number | null) => void;
    setMonth: (month: number | null) => void;
    setCurrency: (currency: "ARS" | "USD" | null) => void;
    setPage: (page: number | ((prev: number) => number)) => void;
    resetFilters: () => void;
}

export const expensesStore = create<ExpensesStore>((set) => ({
    year: 2026,
    month: null,
    currency: null,
    page: 1,
    setYear: (year) => set({ year: year ?? 2026 }),
    setMonth: (month) => set({ month }),
    setCurrency: (currency) => set({ currency }),
    setPage: (page) =>
        set((state) => ({
            page: typeof page === "function" ? page(state.page) : page,
        })),
    resetFilters: () => set({ year: 2026, month: null, currency: null, page: 1 }),
}));
