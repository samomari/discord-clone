import { create } from 'zustand';
import { SelectServer } from '@/db/schema';

interface ServersStore {
  servers: SelectServer[];
  isLoading: boolean;
  setServers: (servers: SelectServer[]) => void;
  addServer: (server: SelectServer) => void;
  removeServer: (serverId: string) => void;
  updateServer: (updatedServer: SelectServer) => void;
  setIsLoading: (isLoading: boolean) => void;
}

export const useServersStore = create<ServersStore>((set) => ({
  servers: [],
  isLoading: false,
  setServers: (servers) => set({ servers }),
  addServer: (server) => set((state) => ({ servers: [...state.servers, server] })),
  updateServer: (updatedServer) => set((state) => ({
    servers: state.servers.map((server) =>
      server.id === updatedServer.id ? updatedServer : server
    ),
  })),
  removeServer: (serverId) => set((state) => ({
    servers: state.servers.filter((server) => server.id !== serverId),
  })),
  setIsLoading: (isLoading) => set({ isLoading }),
}));
