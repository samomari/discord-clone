import { create } from 'zustand';
import { SelectServer } from '@/db/schema';

interface ServersStore {
  servers: SelectServer[];
  setServers: (servers: SelectServer[]) => void;
  addServer: (server: SelectServer) => void;
  removeServer: (serverId: string) => void;
  updateServer: (updatedServer: SelectServer) => void;
}

export const useServersStore = create<ServersStore>((set) => ({
  servers: [], 
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
}));
