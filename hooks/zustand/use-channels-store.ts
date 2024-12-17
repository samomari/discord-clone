import { create } from 'zustand';
import { SelectChannel } from '@/db/schema';

interface ChannelsStore {
  channels: SelectChannel[];
  setChannels: (channels: SelectChannel[]) => void;
  addChannel: (channel: SelectChannel) => void;
  removeChannel: (channelId: string) => void; 
  updateChannel: (updatedChannel: SelectChannel) => void;
};

export const useChannelsStore = create<ChannelsStore>((set) => ({
  channels: [],
  setChannels: (channels) => set({ channels: channels }),
  addChannel: (channel) => set((state) => ({ channels: [...state.channels, channel] })),
  removeChannel: (channelId) =>
    set((state) => ({
      channels: state.channels.filter((channel) => channel.id !== channelId),
    })),
  updateChannel: (updatedChannel) =>
    set((state) => ({
      channels: state.channels.map((channel) =>
        channel.id === updatedChannel.id ? updatedChannel : channel
      ),
    })),
}));