import { Server as NetServer, Socket } from "net";
import { NextApiResponse } from "next";
import { Server as SocketIOServer } from "socket.io";
import { SelectMember, SelectProfile, SelectServer } from "./db/schema";

export type ServerWithMembersWithProfiles = SelectServer & {
  members: (SelectMember & { profile: SelectProfile;})[];
};

export enum ChannelType {
  TEXT = 'TEXT',
  VOICE = 'VOICE'
};

export enum MemberRole {
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR',
  GUEST = 'GUEST',
};

export type NextApiResponseServerIO = NextApiResponse & {
  socket: Socket & {
    server: NetServer & {
      io: SocketIOServer;
    };
  };
};