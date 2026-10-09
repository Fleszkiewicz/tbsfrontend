import { create } from "zustand";
import type { User } from "../types/types";

interface UserStore {
  accessToken: string | undefined;
  user: User | null;
  setUser: (user: User | null) => void;
  setAccessToken: (token: string | undefined) => void;
  clearUser: () => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export const userStore = create<UserStore>((set) => ({
  user: null,
  accessToken: undefined,
  loading: true,
  setLoading: (loading) => set({ loading }),
  setUser: (user) => {
    if (user) {
      sessionStorage.setItem("user", JSON.stringify(user));
    } else {
      sessionStorage.removeItem("user");
    }

    set({ user });
  },
  clearUser: () => {
    set({ user: null, accessToken: undefined });
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");
  },
  setAccessToken: (accessToken: string | undefined) => {
    if (accessToken) {
      sessionStorage.setItem("token", accessToken);
      set({ accessToken });
    } else {
      sessionStorage.removeItem("token");
    }
  },
}));
