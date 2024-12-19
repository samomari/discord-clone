'use client';

import { SelectProfile, SelectChannel } from "@/db/schema";
import { ServerHeader } from "./server-header";
import { ChannelType, MemberRole, MemberWithProfile, ServerWithMembersWithProfiles } from "@/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ServerSearch } from "./server-search";
import { Hash, Mic, ShieldAlert, ShieldCheck } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ServerSection } from "./server-section";
import { ServerChannel } from "./server-channel";
import { ServerMember } from "./server-member";
import { useCurrentProfile } from "@/hooks/zustand/use-current-profile";
import { useEffect, useState } from "react";
import { useServerDetailStore } from "@/hooks/zustand/use-server-detail-store";
import { useMembersStore } from "@/hooks/zustand/use-members-store";
import { useChannelsStore } from "@/hooks/zustand/use-channels-store";

interface ServerSidebarProps {
  serverId: string;
  currentProfile: SelectProfile;
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

export const ServerSidebar = ({
  serverId, 
  currentProfile
}: ServerSidebarProps) => {
  const [loading, setLoading] = useState(true);
  const { setProfile } = useCurrentProfile();
  const { setServer, server } = useServerDetailStore();
  const { setMembers, members } = useMembersStore();
  const { setChannels, channels } =  useChannelsStore();

  useEffect(() => {
    if (currentProfile) {
      setProfile(currentProfile);
    }
  }, [currentProfile, setProfile]);

  useEffect(() => {
    const fetchServerData = async () => {
      if (server?.id === serverId) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/servers/${serverId}`);
        if (res.ok) {
          const data: {
            server: ServerWithMembersWithProfiles;
            channels: SelectChannel[];
            members: MemberWithProfile[];
          } = await res.json();
  
          setServer(data.server);
          setChannels(data.channels);
          setMembers(data.members);
          setLoading(false);
        } else {
          console.error("Failed to fetch server data");
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchServerData();
  }, [serverId, setServer, setChannels, setMembers]);

  const textChannels = channels.filter(
    (channel) => channel.type === ChannelType.TEXT);

  const voiceChannels = channels.filter(
    (channel) => channel.type === ChannelType.VOICE);
  
  const role = members.find(
    (member) => member.profileId === currentProfile.id)?.role as MemberRole;

  if (loading) return <div>Loading...</div>;
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
                data: members?.map((member) => ({
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
        {!!members?.length && (
          <div className="mb-2">
            <ServerSection 
              sectionType="members"
              role={role}
              label="Members"
              server={server}
            />
            <div className="space-y-[2px]">
              {members.map((member) => (
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