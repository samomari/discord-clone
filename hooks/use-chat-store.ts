import { create } from "zustand";
import { MessageWithMemberWithProfile } from "@/types";

interface ChatState {
  messages: MessageWithMemberWithProfile[];
  setMessages: (messages: MessageWithMemberWithProfile[]) => void;
  addMessage: (message: MessageWithMemberWithProfile) => void;
  updateMessage: (updatedMessage: MessageWithMemberWithProfile) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((state) => ({ 
    messages: [message, ...state.messages] 
  })),
  updateMessage: (updatedMessage) => set((state) => ({
    messages: state.messages.map((message) =>
      message.messages.id === updatedMessage.messages.id
        ? { ...message, ...updatedMessage } 
        : message
    ),
  })),
}));