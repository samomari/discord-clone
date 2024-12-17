import { create } from 'zustand';
import { MemberWithProfile } from '@/types'; 

interface MembersStore {
  members: MemberWithProfile[];
  setMembers: (members: MemberWithProfile[]) => void;
  addMember: (member: MemberWithProfile) => void;
  removeMember: (memberId: string) => void;
  updateMember: (updatedMember: MemberWithProfile) => void;
}

export const useMembersStore = create<MembersStore>((set) => ({
  members: [],
  setMembers: (members) => set({ members }),
  addMember: (member) => set((state) => ({ members: [...state.members, member] })),
  removeMember: (memberId) =>
    set((state) => ({
      members: state.members.filter((member) => member.id !== memberId),
    })),
  updateMember: (updatedMember) =>
    set((state) => ({
      members: state.members.map((member) =>
        member.id === updatedMember.id ? updatedMember : member
      ),
    })),
}));
