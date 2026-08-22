import { create } from "zustand";

interface TripsStore {
  filter: string;
  search: string;
  year: number | null;
  month: number | null;
  page: number;
  tripId: string | null;
  setTripId: (id: string | null) => void;
  setFilter: (filter: string) => void;
  setSearch: (search: string) => void;
  setYear: (year: number | null) => void;
  setMonth: (month: number | null) => void;
  setPage: (page: number | ((prev: number) => number)) => void;
  resetFilters: () => void;
}

export const tripsStore = create<TripsStore>((set) => ({
  filter: "desc",
  search: "",
  year: null,
  month: null,
  page: 1,
  tripId: null,
  setTripId: (tripId) => set({ tripId }),
  setFilter: (filter) => set({ filter }),
  setSearch: (search) => set({ search }),
  setYear: (year) => set({ year }),
  setMonth: (month) => set({ month }),
  setPage: (page) =>
    set((state) => ({
      page: typeof page === "function" ? page(state.page) : page,
    })),
  resetFilters: () => set({ filter: "desc", search: "", year: null, month: null, page: 1 }),
}));
