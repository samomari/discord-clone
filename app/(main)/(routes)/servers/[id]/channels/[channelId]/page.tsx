import { currentProfile } from "@/lib/current-profile";
import { redirect } from "next/navigation";
import { db } from "@/db/db";
import { and, eq } from "drizzle-orm";
import { channel, member } from "@/db/schema";
import { ChatHeader } from "@/components/chat/chat-header";
import { ChatInput } from "@/components/chat/chat-input";
import { ChatMessages } from "@/components/chat/chat-messages";
import { ChannelType } from "@/types";
import { MediaRoom } from "@/components/media-room";
import { getChannelData } from "@/features/channels/get-channel-data";
import { getCurrentMember } from "@/features/members/get-current-member";

function isValidUUID(id: string) {
  const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  return uuidRegex.test(id);
}

interface ChannelIdPageProps {
  params: {
    id: string;
    channelId: string;
  }
}

export default async function Page ({
  params
}: ChannelIdPageProps) {
  const { id, channelId } = await params;
  const profile = await currentProfile();

  if (!isValidUUID(channelId)) {
      return redirect("/");
    }

  if (!profile) {
    return redirect('/sign-in');
  }

  const channelData = await getChannelData(channelId);

  const memberData = await getCurrentMember(id, profile.id);

  if (!channelData || !memberData) {
    return redirect(`/`);
  }

  return (
    <div className="bg-white dark:bg-[#313338] flex flex-col h-full">
      <ChatHeader 
        name={channelData.name}
        serverId={channelData.serverId}
        type="channel"
      />
      {channelData.type === ChannelType.TEXT && (
        <>
          <ChatMessages 
            member={memberData}
            name={channelData.name}
            chatId={channelData.id}
            type="channel"
            apiUrl="/api/messages"
            socketUrl="/api/socket/messages"
            query={{
              channelId: channelId,
              serverId: id,
              profileId: profile.id,
              memberId: memberData.id,
              type: "channel"
            }}
            paramKey="channelId"
            paramValue={channelData.id}
          />
          <ChatInput 
            name={channelData.name}
            type="channel"
            query={{
              channelId: channelId,
              serverId: id,
              profileId: profile.id,
              type: "channel"
            }}
          />
        </>
      )}
      {channelData.type === ChannelType.VOICE && (
        <MediaRoom
          chatId={channelData.id}
          video={true}
          audio={true}
        />
      )}
    </div>
  )
}