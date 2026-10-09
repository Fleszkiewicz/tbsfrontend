import { create } from "zustand";

interface TripsStore {
  estado: string | null; // null = todos los estados
  year: number | null; // null = todos los años
  month: number | null;
  page: number;
  search: string;
  tripId: string | null;
  setTripId: (id: string | null) => void;
  setEstado: (estado: string | null) => void;
  setYear: (year: number | null) => void;
  setMonth: (month: number | null) => void;
  setSearch: (search: string) => void;
  setPage: (page: number | ((prev: number) => number)) => void;
  resetFilters: () => void;
}

export const tripsStore = create<TripsStore>((set) => ({
  estado: null,
  year: 2026,
  month: null,
  page: 1,
  search: "",
  tripId: null,
  setTripId: (tripId) => set({ tripId }),
  setEstado: (estado) => set({ estado, page: 1 }),
  setYear: (year) => set({ year, page: 1 }),
  setMonth: (month) => set({ month, page: 1 }),
  setSearch: (search) => set({ search, page: 1 }),
  setPage: (page) =>
    set((state) => ({
      page: typeof page === "function" ? page(state.page) : page,
    })),
  resetFilters: () =>
    set({ estado: null, year: 2026, month: null, page: 1, search: "" }),
}));