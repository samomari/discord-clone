import { create } from 'zustand';
import { SelectServer } from "@/db/schema"

export type ModalType = 'createServer' | 'invite' | 'editServer' |
'members' | 'createChannel';

interface ModalData {
  server?: SelectServer;
}

interface ModalStore {
  type: ModalType | null;
  data: ModalData;
  isOpen: boolean;
  onOpen: (type: ModalType, data?: ModalData) => void;
  onClose: () => void;
}

export const useModal = create<ModalStore>((set) => ({
  type: null,
  data: {},
  isOpen: false,
  onOpen: (type, data = {}) => set({ isOpen: true, type, data }),
  onClose: () => set({ type: null, isOpen: false}),
}))