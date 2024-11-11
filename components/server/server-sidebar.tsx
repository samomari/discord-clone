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
    .leftJoin(member, eq(member.serverId, server.id))
    .leftJoin(profile, eq(profile.id, member.profileId))
    .leftJoin(channel, eq(channel.serverId, server.id))
    .where(eq(server.id, serverId))
    .execute();

  if (!serverData || serverData.length === 0) {
    return redirect("/");
  }

  const serverItem = serverData[0];

  const membersMap = new Map();
  const channelsArray = [];
  serverData.forEach((item) => {
    if (item.members?.id) {
      membersMap.set(item.members.id, {
        id: item.members.id,
        serverId: item.members.serverId,
        profileId: item.members.profileId,
        role: item.members.role,
        profile: item.profiles,
      });
    }
    if (item.channels?.id) {
      channelsArray.push(item.channels);
    }
  });

  const membersArray = Array.from(membersMap.values());

  const textChannels = channelsArray.filter(
    (channel) => channel.type === ChannelTypeEnum["TEXT"]);

  const voiceChannels = channelsArray.filter(
    (channel) => channel.type === ChannelTypeEnum["VOICE"]);

  const filteredMembers = membersArray.filter(
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
    members: membersArray,
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