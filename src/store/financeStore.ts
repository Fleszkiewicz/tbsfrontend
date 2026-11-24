import { create } from "zustand";

type FinanceStore = {
  year: number | null;
  setYear: (year: number | null) => void;
  month: number | null;
  setMonthFinance: (month: number | null) => void;
  currency: "ARS" | "USD" | null;
  setCurrency: (currency: "ARS" | "USD" | null) => void;
  resetFilters: () => void;
};

export const financeStore = create<FinanceStore>((set) => ({
  year: new Date().getFullYear(), // por defecto, el año actual
  setYear: (year) => set({ year }),
  month: null,
  setMonthFinance: (month) => set({ month }),
  currency: null,
  setCurrency: (currency) => set({ currency }),
  resetFilters: () => set({ year: new Date().getFullYear(), month: null, currency: null }),
}));
