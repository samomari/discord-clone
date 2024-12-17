import { create } from "zustand";
import { currentProfile as fetchCurrentProfile } from "@/lib/current-profile";
import { SelectProfile } from "@/db/schema";

interface ProfileState {
  profile: SelectProfile | null;
  setProfile: (profile: SelectProfile) => void;
}

export const useCurrentProfile = create<ProfileState>((set) => ({
  profile: null,
  setProfile: (profile) => set({ profile }),
}));
