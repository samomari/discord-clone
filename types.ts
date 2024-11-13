import { SelectMember, SelectProfile, SelectServer } from "./db/schema";

export type ServerWithMembersWithProfiles = SelectServer & {
  members: (SelectMember & { profile: SelectProfile;})[];
};

export enum ChannelType {
  TEXT = 'TEXT',
  VOICE = 'VOICE'
}

export enum MemberRole {
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR',
  GUEST = 'GUEST',
} 