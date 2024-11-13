import { currentProfile } from "@/lib/current-profile";
import { redirect } from "next/navigation";
import { db } from "@/db/db";
import { server, member, channel, profile } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { ServerHeader } from "./server-header";
import { ServerWithMembersWithProfiles } from "@/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ServerSearch } from "./server-search";
import { Hash, Mic, ShieldAlert, ShieldCheck } from "lucide-react";

interface ServerSidebarProps {
  serverId: string;
}

const iconMap = {
  "TEXT": <Hash className="mr-2 h-4 w-4"/>,
  "VOICE": <Mic className="mr-2 h-4 w-4"/>
};

const roleIconMap = {
  "GUEST": null,
  "MODERATOR": <ShieldCheck className="h-4 w-4 mr-2 text-indigo-500" />,
  "ADMIN": <ShieldAlert className="h-4 w-4 mr-2 text-rose-500"/>
};

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
  const channelsMap = new Map();
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
    if (item.channels?.id && !channelsMap.has(item.channels.id)) {
      channelsMap.set(item.channels.id, item.channels);
    }
  });

  const membersArray = Array.from(membersMap.values());
  const channelsArray = Array.from(channelsMap.values());

  const textChannels = channelsArray.filter(
    (channel) => channel.type === "TEXT");
  
  const voiceChannels = channelsArray.filter(
    (channel) => channel.type === "VOICE");

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
      <ScrollArea className="flex-1 px-3">
        <div className="mt-2">
          <ServerSearch 
            data={[
              {
                label: "Text Channels",
                type: "channel",
                data: textChannels?.map((channel) => ({
                  id: channel.id,
                  name: channel.name,
                  icon: iconMap[channel.type],
                }))
              },
              {
                label: "Voice Channels",
                type: "channel",
                data: voiceChannels?.map((channel) => ({
                  id: channel.id,
                  name: channel.name,
                  icon: iconMap[channel.type],
                }))
              },
              {
                label: "Members",
                type: "member",
                data: filteredMembers?.map((member) => ({
                  id: member.id,
                  name: member.profile.name,
                  icon: roleIconMap[member.role],
                }))
              }
            ]}
          />
        </div>
      </ScrollArea>
    </div>
  );
}