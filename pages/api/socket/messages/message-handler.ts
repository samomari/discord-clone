import { db } from "@/db/db";
import { server, channel, member, message, profile } from "@/db/schema";
import { MemberRole } from "@/types";
import { eq, and, sql } from "drizzle-orm";

async function fetchServerData (serverId, profileId) {
  const result = await db
    .select()
    .from(server)
    .leftJoin(member, eq(server.id, member.serverId))
    .where(
      and(
        eq(server.id, serverId), 
        eq(member.profileId, profileId)
      )
    )
    .limit(1)
    .execute();

  return result?.[0] || null;
}

async function fetchChannelData (serverId, channelId) {
  const result = await db
    .select()
    .from(channel)
    .where(
      and(
        eq(channel.serverId, serverId), 
        eq(channel.id, channelId)
      )
    )
    .limit(1)
    .execute();

  return result?.[0] || null;
}

async function fetchMessageData (messageId, channelId) {
  const result = await db
    .select()
    .from(message)
    .where(
      and(
        eq(message.id, messageId), 
        eq(message.channelId, channelId)
      )
    )
    .limit(1)
    .execute();

  return result?.[0] || null;
}

async function fetchFullMessage (messageId, channelId) {
  const result = await db
    .select()
    .from(message)
    .leftJoin(member, eq(message.memberId, member.id))
    .leftJoin(profile, eq(member.profileId, profile.id))
    .where(
      and(
        eq(message.id, messageId), 
        eq(message.channelId, channelId)
      )
    )
    .limit(1)
    .execute();
  
    return result?.[0] || null;
}

function canModifyMessage(memberData) {
  if (!memberData) return false;
  const isAdmin = memberData.role === MemberRole.ADMIN;
  const isModerator = memberData.role === MemberRole.MODERATOR;
  return isAdmin || isModerator;
}

function isMessageOwner(memberData, messageData) {
  if (!memberData || !messageData) return false;
  return messageData.memberId === memberData.id;
}

function validateInputs ({ profileId, serverId, channelId }) {
  if (!profileId) throw new Error("Unauthorized: Missing profileId");
  if (!serverId) throw new Error("Server ID missing");
  if (!channelId) throw new Error("Channel ID missing");
}

export async function handleUpdateMessage(data) {
  try {
    const { messageId, serverId, channelId, profileId, content } = data;

    validateInputs({ profileId, serverId, channelId});

    const serverData = await fetchServerData(serverId, profileId);
    if (!serverData) throw new Error("Server not found");
    
    const channelData = await fetchChannelData(serverId, channelId);
    if (!channelData ) throw new Error("Channel not found");

    const messageData = await fetchMessageData(messageId, channelId);
    if (!messageData) throw new Error("Message not found or already deleted");

    const memberData = serverData.members;
    if (!memberData) throw new Error("Member data not found");

    if (!isMessageOwner(memberData, messageData)) {
      throw new Error("Only message owner can update message");
    }

    await db
      .update(message)
      .set({ 
        content,
        updatedAt: sql`CURRENT_TIMESTAMP`,
        })
      .where(eq(message.id, messageId))
      .execute();

    const updatedMessage = await fetchFullMessage(messageId, channelId);

    return updatedMessage;
  } catch (error) {
    console.log("[MESSAGE_UPDATE]", error);
    return { error: error.message };
  }
}

export async function handleDeleteMessage(data) {
  try {
    const { messageId, serverId, channelId, profileId} = data;

    validateInputs({ profileId, serverId, channelId });

    const serverData = await fetchServerData(serverId, profileId);
    if (!serverData) throw new Error("Server not found");

    const channelData = await fetchChannelData(serverId, channelId);
    if (!channelData ) throw new Error("Channel not found");

    const messageData = await fetchMessageData(messageId, channelId);
    if (!messageData) throw new Error("Message not found or already deleted");

    const memberData = serverData.members;
    if (!memberData) throw new Error("Member data not found");

    if(!canModifyMessage(memberData) && !isMessageOwner(memberData, messageData)) throw new Error("Unauthorized");

    await db
      .update(message)
      .set({
        fileUrl: null,
        fileType: null,
        content: "This message has been deleted.",
        deleted: true,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where(eq(message.id, messageId))
      .execute();

    const updatedMessage = await fetchFullMessage(messageId, channelId);

    return updatedMessage;
  } catch (error) {
    console.log("[MESSAGE_DELETE]", error);
    return { error: error.message };
  }
}

export async function handleCreateMessage(data) {
  try {
    const { serverId, channelId, content, fileUrl, fileType, profileId} = data; 

    validateInputs({ profileId, serverId, channelId });
    
    if (!content) throw new Error("Content missing");
    
    const serverData = await fetchServerData(serverId, profileId);
    if (!serverData) throw new Error("Server not found");

    const memberData = serverData.members;
    if (!memberData) throw new Error("Member not found");
    
    const insertedMessage = await db
      .insert(message)
      .values({
        content,
        fileUrl,
        fileType,
        channelId,
        memberId: memberData.id,
      })
      .returning()
      .execute();

    const fullMessage = await fetchFullMessage(insertedMessage[0].id, channelId);

    return fullMessage;
  } catch (error) {
    console.log("[MESSAGES_POST]", error);
    return { error: error.message };
  }
}