import { currentProfile } from "@/lib/current-profile";
import { redirect } from "next/navigation";
import { db } from "@/db/db";
import { and, eq } from "drizzle-orm";
import { channel, member } from "@/db/schema";
import { ChatHeader } from "@/components/chat/chat-header";
import { ChatInput } from "@/components/chat/chat-input";

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
      <div className="flex-1">Future Messages</div>
      <ChatInput 
        name={channelData[0].name}
        type="channel"
        apiUrl="/api/socket/messages"
        query={{
          channelId: channelId,
          serverId: id,
        }}
      />
    </div>
  )
}