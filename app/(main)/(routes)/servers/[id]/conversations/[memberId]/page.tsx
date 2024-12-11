import { db } from "@/db/db";
import { member, profile } from "@/db/schema";
import { getOrCreateConversation } from "@/lib/conversation";
import { currentProfile } from "@/lib/current-profile";
import { redirect } from "next/navigation";
import { eq, and } from "drizzle-orm";
import { ChatHeader } from "@/components/chat/chat-header";
import { ChatMessages } from "@/components/chat/chat-messages";
import { ChatInput } from "@/components/chat/chat-input";
import { MediaRoom } from "@/components/media-room";

interface MemberIdPageProps {
  params: {
    id: string;
    memberId: string;
  },
  searchParams: {
    video?: boolean;
  }
}

export default async function Page ({
  params,
  searchParams,
}: MemberIdPageProps) {
  const { id } = await params;
  const { memberId } = await params;
  const curProfile = await currentProfile();

  if (!curProfile) {
    return redirect('/sign-in');
  }

  const currentMemberResult = await db
    .select()
    .from(member)
    .leftJoin(profile, eq(profile.id, member.profileId))
    .where(and(eq(member.serverId, id), eq(member.profileId, curProfile.id)))
    .limit(1)
    .execute();

  const currentMember = currentMemberResult.length > 0 ? currentMemberResult[0].members : null;

  if (!currentMember) {
    return redirect(`/`);
  }

  const conversation = await getOrCreateConversation(currentMember.id, memberId);
  
  if (!conversation) {
    return redirect(`/servers/${id}`);
  }

  const { memberOne, memberTwo } = conversation;

  const otherMember = memberOne.profiles.id === curProfile.id ? memberTwo : memberOne;

  return (
    <div className="bg-white dark:bg-[#313338] flex flex-col h-full">
      <ChatHeader 
        imageUrl={otherMember.profile.imageUrl}
        name={otherMember.profile.name}
        serverId={id}
        type="conversation"
      />
      {searchParams.video && (
        <MediaRoom 
          chatId={conversation.id}
          video={true}
          audio={true}
        />
      )}
      {!searchParams.video && (
        <>
          <ChatMessages 
            member={currentMember}
            name={otherMember.profile.name}
            chatId={conversation.id}
            type="conversation"
            apiUrl="/api/direct-messages"
            paramKey={"conversationId"}
            paramValue={conversation.id}
            socketUrl="api/socket/direct-messages"
            query={{
              conversationId: conversation.id,
              type: "conversation", 
              profileId: curProfile.id
            }}
          />
          <ChatInput 
            name={otherMember.profile.name}
            type="conversation"
            query={{
              conversationId: conversation.id,
              profileId: curProfile.id,
              type: "conversation"
            }}
          />
       </>
      )}
    </div>
  )
}