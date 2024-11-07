import { currentProfile } from "@/lib/current-profile";
import { redirect } from "next/navigation";
import { db } from "@/db/db";
import { server, member, channel, profile, ChannelTypeEnum } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { ServerHeader } from "./server-header";
import { ServerWithMembersWithProfiles } from "@/types";

interface ServerSidebarProps {
  serverId: string;
}

export const ServerSidebar = async ({
  serverId
}: ServerSidebarProps) => {
  const curProfile = await currentProfile();

  if (!curProfile) {
    return redirect("/");
  }

  const serverData = await db
    .select()
    .from(server)
    .where(eq(server.id, serverId))
    .limit(1)
    .innerJoin(channel, eq(channel.serverId, server.id))
    .innerJoin(member, eq(member.serverId, server.id))
    .innerJoin(profile, eq(profile.id, member.profileId))
    .orderBy(asc(channel.createdAt), asc(member.role)) 
    .execute();

  if (!serverData || serverData.length === 0) {
    return redirect("/");
  }

  const serverItem = serverData[0];

  const channelsArray = Array.isArray(serverItem.channels) ? serverItem.channels : [serverItem.channels];

  const membersArray = Array.isArray(serverItem.members) ? serverItem.members : [serverItem.members];

  const textChannels = channelsArray.filter(
    (channel) => channel.type === ChannelTypeEnum["TEXT"]);

  const voiceChannels = channelsArray.filter(
    (channel) => channel.type === ChannelTypeEnum["VOICE"]);

  const members = membersArray.filter(
    (member) => member.profileId !== curProfile.id);

  const role = membersArray.find(
    (member) => member.profileId === curProfile.id)?.role;

  const reshapedServerItem: ServerWithMembersWithProfiles = {
    id: serverItem.servers.id,
    name: serverItem.servers.name,
    imageUrl: serverItem.servers.imageUrl,
    createdAt: serverItem.servers.createdAt,
    updatedAt: serverItem.servers.updatedAt,
    inviteCode: serverItem.servers.inviteCode,
    profileId: serverItem.servers.profileId,
    members: membersArray.map((member) => ({
      ...member,
      profile: serverItem.profiles,
    }))
  };

  return (
    <div className="flex flex-col h-full text-primary w-full 
    dark:bg-[#2B2D31] bg-[#F2F3F5]">
      <ServerHeader
        server={reshapedServerItem}
        role={role}
      />
    </div>
  );
}