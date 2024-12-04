import { db } from "@/db/db";
import { server, channel, member, message, profile } from "@/db/schema";
import { MemberRole } from "@/types";
import { eq, and, sql } from "drizzle-orm";

export async function handleUpdateMessage(data) {
  try {
    const { messageId, serverId, channelId, profileId, content } = data;

    if (!profileId) {
      console.log("Unauthorized")
      return;
    }

    if (!serverId) {
      console.log("Server ID missing");
      return;
    }

    if (!channelId) {
      console.log("Channel ID missing");
      return;
    }

    const serverData = await db
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

    if (!serverData || serverData.length === 0) {
      console.log("Server not found");
      return;
    }

    const channelData = await db
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

    if (!channelData || channelData.length === 0) {
      console.log("Channel not found");
      return;
    }

    const memberData = serverData[0].members;

    if (!memberData || memberData.profileId !== profileId) {
      console.log("Member not found" );
      return;
    }

    const messageData = await db
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

    if (!messageData || messageData.length === 0 || messageData[0].deleted) {
      throw new Error("Message not found or already deleted");
    }

    const isMessageOwner = messageData[0].memberId === memberData.id;

    if (!isMessageOwner) {
      console.log("Unauthorized");
      return;
    }

    await db
      .update(message)
      .set({ 
        content,
        updatedAt: sql`CURRENT_TIMESTAMP`,
        })
      .where(eq(message.id, messageId as string))
      .execute();

    const updatedMessage = await db
      .select()
      .from(message)
      .where(eq(message.id, messageId))
      .limit(1)
      .execute();

    return updatedMessage[0];

  } catch (error) {
    console.log("[MESSAGE_UPDATE]", error);
  }
}

export async function handleDeleteMessage(data) {
  try {
    const { messageId, serverId, channelId, profileId} = data;

    if (!profileId) {
      console.log("Unauthorized")
      return;
    }

    if (!serverId) {
      console.log("Server ID missing");
      return;
    }

    if (!channelId) {
      console.log("Channel ID missing");
      return;
    }

    const serverData = await db
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

    if (!serverData || serverData.length === 0) {
      console.log("Server not found");
      return;
    }

    const channelData = await db
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

    if (!channelData || channelData.length === 0) {
      console.log("Channel not found");
      return;
    }

    const memberData = serverData[0].members;

    if (!memberData || memberData.profileId !== profileId) {
      console.log("Member not found" );
      return;
    }

    const messageData = await db
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

    if (!messageData || messageData.length === 0 || messageData[0].deleted) {
      throw new Error("Message not found or already deleted");
    }

    const isMessageOwner = messageData[0].memberId === memberData.id;
    const isAdmin = memberData.role === MemberRole.ADMIN;
    const isModerator = memberData.role === MemberRole.MODERATOR;
    const canModify = isMessageOwner || isAdmin || isModerator;

    if (!canModify) {
      console.log("Unauthorized");
      return;
    }

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

    const updatedMessage = await db
      .select()
      .from(message)
      .where(eq(message.id, messageId))
      .limit(1)
      .execute();

    return updatedMessage[0];

  } catch (error) {
    console.log("[MESSAGE_DELETE]", error);
  }
}

export async function handleCreateMessage(data) {
  try {
    const { serverId, channelId, content, fileUrl, fileType, profileId} = data; 

    if (!profileId) {
      throw new Error("Unauthorized: Missing profileId");
    }

    if (!serverId) {
      throw new Error("Server ID missing");
    }

    if (!channelId) {
      throw new Error("Channel ID missing");
    }

    if (!content) {
      throw new Error("Content missing");
    }

    const serverData = await db
      .select()
      .from(server)
      .leftJoin(member, eq(server.id, member.serverId))
      .where(
        and(
          eq(server.id, serverId),
          eq(member.profileId, profileId)
        )
      )
      .execute();

    if (!serverData || serverData.length === 0) {
      throw new Error("Server not found");
    }

    const memberInfo = serverData[0].members;

    if (!memberInfo) {
      throw new Error("Member not found");
    }

    const insertedMessage = await db
      .insert(message)
      .values({
        content,
        fileUrl,
        fileType,
        channelId,
        memberId: memberInfo.id,
      })
      .returning()
      .execute();

    const fullMessage = await db
      .select()
      .from(message)
      .leftJoin(member, eq(message.memberId, member.id))
      .leftJoin(profile, eq(member.profileId, profile.id))
      .where(eq(message.id, insertedMessage[0].id))
      .limit(1)
      .execute();

    return fullMessage[0];
  } catch (error) {
    console.log("[MESSAGES_POST]", error);
  }
}