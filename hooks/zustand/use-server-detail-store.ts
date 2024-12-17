import { create } from 'zustand';
import { ServerWithMembersWithProfiles } from "@/types";

interface ServerDetailStore {
  server: ServerWithMembersWithProfiles | null;
  setServer: (server: ServerWithMembersWithProfiles) => void;
  clearServer: () => void;
}

export const useServerDetailStore = create<ServerDetailStore>((set) => ({
  server: null,
  setServer: (server) => set({ server}),
  clearServer: () => set({ server: null }),
}))