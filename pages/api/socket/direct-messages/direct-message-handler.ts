import { db } from "@/db/db";
import { member, profile, directMessage} from "@/db/schema";
import { eq, and } from "drizzle-orm";

async function fetchFullMessage (directMessageId, conversationId) {
  const result = await db
    .select({
      messages: directMessage,
      members: member,
      profiles: profile
    })
    .from(directMessage)
    .leftJoin(member, eq(directMessage.memberId, member.id))
    .leftJoin(profile, eq(member.profileId, profile.id))
    .where(
      and(
        eq(directMessage.id, directMessageId), 
        eq(directMessage.conversationId, conversationId)
      )
    )
    .limit(1)
    .execute();
  
    return result?.[0] || null;
}

export async function handleCreateConversationMessage(data) {
  try {
    const { content, profileId, conversationId} = data;

    if (!profileId) throw new Error("Unauthorized: Missing profileId");
    if (!conversationId) throw new Error("Conversation ID missing");
    if (!content) throw new Error("Content missing");
    
    const memberData = await db
      .select()
      .from(member)
      .where(eq(member.profileId, profileId))
      .limit(1)
      .execute();
    
    const insertedMessage = await db
      .insert(directMessage)
      .values({
        content,
        conversationId,
        memberId: memberData[0].id,
      })
      .returning()
      .execute();

    const fullMessage = await fetchFullMessage(insertedMessage[0].id, conversationId);

    return fullMessage;
  } catch (error) {
    console.log("[DIRECT_MESSAGES_POST]", error);
    return { error: error.message };
  }
}