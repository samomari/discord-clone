import { currentProfile } from "@/features/profiles/current-profile";
import { redirect } from "next/navigation";
import { db } from "@/db/db";
import { server, member, channel, profile } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { ServerHeader } from "./server-header";
import { ChannelType, ServerWithMembersWithProfiles } from "@/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ServerSearch } from "./server-search";
import { Hash, Mic, ShieldAlert, ShieldCheck } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ServerSection } from "./server-section";
import { ServerChannel } from "./server-channel";
import { ServerMember } from "./server-member";
import { getServerInfo } from "@/features/servers/get-server-info";

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

  const serverInfo = await getServerInfo(serverId);

  if (!serverInfo) {
    return redirect("/");
  }

  const { server, channels, members } = serverInfo;

  const textChannels = channels.filter(
    (channel) => channel.type === ChannelType.TEXT);
  
  const voiceChannels = channels.filter(
    (channel) => channel.type === ChannelType.VOICE);

  const filteredMembers = members.filter(
    (member) => member.profileId !== curProfile.id);

  const role = members.find(
    (member) => member.profileId === curProfile.id)?.role;

  return (
    <div className="flex flex-col h-full text-primary w-full 
    dark:bg-[#2B2D31] bg-[#F2F3F5]">
      <ServerHeader
        server={server}
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
        <Separator className="bg-zinc-200 dark:bg-zinc-700 rounded-md my-2"/>
        {!!textChannels?.length && (
          <div className="mb-2">
            <ServerSection 
              sectionType="channels"
              channelType={ChannelType.TEXT}
              role={role}
              label="Text Channels"
            />
            <div className="space-y-[2px]">
              {textChannels.map((channel) => (
                <ServerChannel 
                  key={channel.id}
                  channel={channel}
                  role={role}
                  server={server}
                />
              ))}
            </div>
          </div>
        )}
        {!!voiceChannels?.length && (
          <div className="mb-2">
            <ServerSection 
              sectionType="channels"
              channelType={ChannelType.VOICE}
              role={role}
              label="Voice Channels"
            />
            <div className="space-y-[2px]">
              {voiceChannels.map((channel) => (
                <ServerChannel 
                  key={channel.id}
                  channel={channel}
                  role={role}
                  server={server}
                />
              ))}
            </div>
          </div>
        )}
        {/* MEMBERS */}
        {!!filteredMembers?.length && (
          <div className="mb-2">
            <ServerSection 
              sectionType="members"
              role={role}
              label="Members"
              server={server}
            />
            <div className="space-y-[2px]">
              {filteredMembers.map((member) => (
                <ServerMember 
                  key={member.id}
                  member={member}
                  server={server}
                />
              ))}
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}