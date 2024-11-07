import { SelectMember, SelectProfile, SelectServer } from "./db/schema";

export type ServerWithMembersWithProfiles = SelectServer & {
  members: (SelectMember & { profile: SelectProfile;})[];
};