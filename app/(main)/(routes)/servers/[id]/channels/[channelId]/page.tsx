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

  const channelData = await db
    .select()
    .from(channel)
    .where(eq(channel.id, channelId))
    .limit(1)
    .execute();

  const memberData = await db
    .select()
    .from(member)
    .where(
      and(
        eq(member.serverId, id),
        eq(member.profileId, profile.id)
      )
    )
    .limit(1)
    .execute();

  if (!channelData ||channelData.length === 0 || !memberData || memberData.length === 0) {
    return redirect(`/`);
  }

  return (
    <div className="bg-white dark:bg-[#313338] flex flex-col h-full">
      <ChatHeader 
        name={channelData[0].name}
        serverId={channelData[0].serverId}
        type="channel"
      />
      {channelData[0].type === ChannelType.TEXT && (
        <>
          <ChatMessages 
            member={memberData[0]}
            name={channelData[0].name}
            chatId={channelData[0].id}
            type="channel"
            apiUrl="/api/messages"
            socketUrl="/api/socket/messages"
            query={{
              channelId: channelId,
              serverId: id,
              profileId: profile.id,
              memberId: memberData[0].id,
              type: "channel"
            }}
            paramKey="channelId"
            paramValue={channelData[0].id}
          />
          <ChatInput 
            name={channelData[0].name}
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
      {channelData[0].type === ChannelType.VOICE && (
        <MediaRoom
          chatId={channelData[0].id}
          video={true}
          audio={true}
        />
      )}
    </div>
  )
}