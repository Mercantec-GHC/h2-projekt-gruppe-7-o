// authModalStore.ts
import { create } from "zustand";

interface AuthModalState {
  open: boolean;
  openModal: () => void;
  closeModal: () => void;
}

const useAuthModalStore = create<AuthModalState>((set) => ({
  open: false,
  openModal: () => set({ open: true }),
  closeModal: () => set({ open: false }),
}));

export default useAuthModalStore;
