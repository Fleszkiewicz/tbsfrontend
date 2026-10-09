import { create } from "zustand";

interface ModalStore {
  isOpen: boolean;
  isCreate: boolean;
  isEdit: boolean;
  setIsCreate: (isCreate: boolean) => void;
  setIsEdit: (isEdit: boolean) => void;
  setIsOpen: (isOpen: boolean) => void;
}

export const modalStore = create<ModalStore>((set) => ({
  isOpen: false,
  isCreate: false,
  isEdit: false,
  setIsEdit: (isEdit) => set({ isEdit }),
  setIsCreate: (isCreate) => set({ isCreate }),
  setIsOpen: (isOpen) => set({ isOpen }),
}));
