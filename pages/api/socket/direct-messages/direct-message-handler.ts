import { db } from "@/db/db";
import { member, profile, directMessage, conversation } from "@/db/schema";
import { MemberRole } from "@/types";
import { eq, and, sql, or } from "drizzle-orm";

async function fetchConversationData (conversationId, memberData) {
  const result = await db
    .select()
    .from(conversation)
    .where(
      and(
        eq(conversation.id, conversationId),
        or(
          eq(conversation.memberOneId, memberData.id),
          eq(conversation.memberTwoId, memberData.id)
        )
      )
    )
    .limit(1)
    .execute();

  return result?.[0] || null;
}

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

async function fetchMessageData (messageId, conversationId) {
  const result = await db
    .select()
    .from(directMessage)
    .where(
      and(
        eq(directMessage.id, messageId), 
        eq(directMessage.conversationId, conversationId)
      )
    )
    .limit(1)
    .execute();

  return result?.[0] || null;
}

async function fetchMemberData (profileId, conversationId) {
  const result = await db
    .select()
    .from(member)
    .innerJoin(conversation, or(
      eq(member.id, conversation.memberOneId),
      eq(member.id, conversation.memberTwoId)
    ))
    .where(
      and(
        eq(member.profileId, profileId),
        eq(conversation.id, conversationId)
      )
    )
    .limit(1)
    .execute();

  return result?.[0].members || null;
}

function isMessageOwner(memberData, messageData) {
  if (!memberData || !messageData) return false;
  return messageData.memberId === memberData.id;
}

function validateInputs({ profileId, conversationId }) {
  if (!profileId) throw new Error("Unauthorized: Missing profileId");
  if (!conversationId) throw new Error("Conversation ID missing");
}

export async function handleDeleteConversationMessage(data) {
  try {
    const { messageId, conversationId, profileId } = data;

    validateInputs({ profileId, conversationId });

    const messageData = await fetchMessageData(messageId, conversationId);
    if (!messageData) throw new Error("Message not found or already deleted");

    const memberData = await fetchMemberData(profileId, conversationId);
    if (!memberData) throw new Error("Member not found");

    const conversationData = await fetchConversationData(conversationId, memberData);
    if (!conversationData) throw new Error("Conversation not found");

    if (!isMessageOwner(memberData, messageData)) {
      throw new Error("Only message owner can perform this action.");
    }

    await db
      .update(directMessage)
      .set({
        fileUrl: null,
        fileType: null,
        content: "This message has been deleted.",
        deleted: true,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where(eq(directMessage.id, messageId))
      .execute();

    const fullMessage = await fetchFullMessage(messageId, conversationId);

    return fullMessage;
  } catch (error) {
    console.log("[DIRECT_MESSAGES_DELETE]", error);
    return { error: error.message };
  }
}

export async function handleUpdateConversationMessage(data) {
  try {
    const { content, conversationId, messageId, profileId} = data;

    validateInputs({ profileId, conversationId });

    if (!content) throw new Error("Content missing");

    const messageData = await fetchMessageData(messageId, conversationId);
    if (!messageData) throw new Error("Message not found or already deleted");

    const memberData = await fetchMemberData(profileId, conversationId);
    if (!memberData) throw new Error("Member not found");

    const conversationData = await fetchConversationData(conversationId, memberData);
    if (!conversationData) throw new Error("Conversation not found");

    if (!isMessageOwner(memberData, messageData)) {
      throw new Error("Only message owner can update message.");
    }

    await db
      .update(directMessage)
      .set({ 
        content,
        updatedAt: sql`CURRENT_TIMESTAMP`,
        })
      .where(eq(directMessage.id, messageId))
      .execute();

    const fullMessage = await fetchFullMessage(messageId, conversationId);

    return fullMessage;
  } catch (error) {
    console.log("[DIRECT_MESSAGES_UPDATE]", error);
    return { error: error.message };
  }
}

export async function handleCreateConversationMessage(data) {
  try {
    const { content, profileId, conversationId, fileType, fileUrl} = data;

    validateInputs({ profileId, conversationId });
    
    if (!content) throw new Error("Content missing");
    
    const memberData = await fetchMemberData(profileId, conversationId);
    if (!memberData) throw new Error("Member not found");

    const conversationData = await fetchConversationData(conversationId, memberData);
    if (!conversationData) throw new Error("Conversation not found");
    
    const insertedMessage = await db
      .insert(directMessage)
      .values({
        content,
        conversationId,
        fileUrl,
        fileType,
        memberId: memberData.id,
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