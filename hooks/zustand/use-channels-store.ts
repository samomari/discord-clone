import { create } from 'zustand';
import { SelectChannel } from '@/db/schema';

interface ChannelsStore {
  textChannels: SelectChannel[];
  voiceChannels: SelectChannel[];
  setTextChannels: (channels: SelectChannel[]) => void;
  setVoiceChannels: (channels: SelectChannel[]) => void;
  addTextChannel: (channel: SelectChannel) => void;
  addVoiceChannel: (channel: SelectChannel) => void;
  removeChannel: (channelId: string) => void; 
  updateChannel: (updatedChannel: SelectChannel) => void;
};

export const useChannelsStore = create<ChannelsStore>((set) => ({
  textChannels: [],
  voiceChannels: [],
  setTextChannels: (channels) => set({ textChannels: channels }),
  setVoiceChannels: (channels) => set({ voiceChannels: channels }),
  addTextChannel: (channel) => set((state) => ({ textChannels: [...state.textChannels, channel] })),
  addVoiceChannel: (channel) => set((state) => ({ voiceChannels: [...state.voiceChannels, channel] })),
  removeChannel: (channelId) =>
    set((state) => ({
      textChannels: state.textChannels.filter((channel) => channel.id !== channelId),
      voiceChannels: state.voiceChannels.filter((channel) => channel.id !== channelId),
    })),
  updateChannel: (updatedChannel) =>
    set((state) => ({
      textChannels: state.textChannels.map((channel) =>
        channel.id === updatedChannel.id ? updatedChannel : channel
      ),
      voiceChannels: state.voiceChannels.map((channel) =>
        channel.id === updatedChannel.id ? updatedChannel : channel
      ),
    })),
}));