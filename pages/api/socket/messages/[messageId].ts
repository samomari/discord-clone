import { currentProfilePages } from "@/lib/current-profile-pages";
import { NextApiRequest } from "next";
import { NextApiResponseServerIO } from "@/types";
import { db } from "@/db/db";
import { channel, member, message, server, profile } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { MemberRole } from "@/types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIO
) {
  if (req.method !== "DELETE" && req.method !== "PATCH") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const curProfile = await currentProfilePages(req);
    const { messageId, serverId, channelId } = req.query;
    const { content } = req.body;

    if (!curProfile) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!serverId) {
      return res.status(401).json({ error: "Server ID missing" });
    }

    if (!channelId) {
      return res.status(401).json({ error: "Channel ID missing" });
    }

    const serverData = await db
      .select()
      .from(server)
      .leftJoin(member, eq(server.id, member.serverId))
      .where(
        and(
          eq(server.id, serverId as string),
          eq(member.profileId, curProfile.id)
        )
      )
      .limit(1)
      .execute();

    if (!serverData || serverData.length === 0) {
      return res.status(404).json({ error: "Server not found" });
    }

    const channelData = await db
      .select()
      .from(channel)
      .where(
        and(
          eq(channel.serverId, serverId as string),
          eq(channel.id, channelId as string)
        )
      )
      .limit(1)
      .execute();

    if (!channelData || channelData.length === 0) {
      return res.status(404).json({ error: "Channel not found" });
    }

    const memberData = serverData[0].members;
    
    if (!memberData ||memberData.profileId !== curProfile.id) {
      return res.status(404).json({ error: "Member not found" });
    }

    let messageData = await db
      .select()
      .from(message)
      .leftJoin(member, eq(message.memberId, member.id))
      .leftJoin(profile, eq(member.profileId, curProfile.id))
      .where(
        and(
          eq(message.id, messageId as string),
          eq(message.channelId, channelId as string)
        )
      )
      .limit(1)
      .execute();

    if (!messageData || messageData.length === 0 || messageData[0].messages.deleted) {
      return res.status(404).json({ error: "Message not found" });
    }

    const isMessageOwner = messageData[0].messages.memberId === serverData[0].members.id;
    const isAdmin = memberData.role === MemberRole.ADMIN;
    const isModerator = memberData.role === MemberRole.MODERATOR;
    const canModify = isMessageOwner || isAdmin || isModerator;

    if (!canModify) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    if (req.method === "DELETE") {
      await db
        .update(message)
        .set({
          fileUrl: null,
          fileType: null,
          content: "This message has been deleted.", 
          deleted: true,
          updatedAt: sql`CURRENT_TIMESTAMP`, 
        })
        .where(eq(message.id, messageId as string))
        .execute();
    }

    if (req.method === "PATCH") {
      if (!isMessageOwner) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      await db
        .update(message)
        .set({ 
          content,
          updatedAt: sql`CURRENT_TIMESTAMP`,
         })
        .where(eq(message.id, messageId as string))
        .execute();
    }

    const updateKey = `chat:${channelId}:messages:update`;
    const updatedMessage = await db
      .select()
      .from(message)
      .where(eq(message.id, messageId as string))
      .execute();
      
      
    res?.socket?.server?.io?.emit(updateKey, updatedMessage[0]);
    return res.status(200).json({ message: updatedMessage[0] });

  } catch (error) {
    console.log("[MESSAGE_ID]", error);
    return res.status(500).json({ error: "Internal Error" });
  }
}