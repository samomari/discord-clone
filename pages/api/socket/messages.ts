import { currentProfilePages } from "@/lib/current-profile-pages";
import { NextApiResponseServerIO } from "@/types";
import { NextApiRequest } from "next";
import { db } from "@/db/db";
import { server, channel, member, message, profile } from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIO
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const curProfile = await currentProfilePages(req);
    const { content, fileUrl, fileType } = req.body;
    const { serverId, channelId } = req.query;

    if (!curProfile) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!serverId) {
      return res.status(400).json({ error: "Server ID missing" });
    }

    if (!channelId) {
      return res.status(400).json({ error: "Channel ID missing" });
    }

    if (!content) {
      return res.status(400).json({ error: "Content missing" });
    }

    const serverData = await db
      .select()
      .from(server)
      .leftJoin(member, eq(server.id, member.serverId))
      .where(and(eq(server.id, serverId as string), eq(member.profileId, curProfile.id )))
      .execute();
    
    if (!serverData || serverData.length === 0) {
      return res.status(404).json({ error: "Server not found" });
    }

    const serverInfo = serverData[0].servers;
    const memberInfo = serverData[0].members;

    if (!memberInfo) {
      return res.status(404).json({ error: "Member not found" });
    }

    const channelData = await db
      .select()
      .from(channel)
      .where(and(eq(channel.id, channelId as string), eq(channel.serverId, serverId as string )))
      .limit(1)
      .execute();

    if (!channelData || channelData.length === 0) {
      return res.status(404).json({ error: "Channel not found" });
    }

    const channelInfo = channelData[0];


    const insertedMessage = await db
      .insert(message)
      .values({
        content,
        fileUrl,
        fileType,
        channelId: channelId as string,
        memberId: memberInfo.id,
      })
      .returning()
      .execute();

    const fullMessage = await db
    .select({
      message: message,
      member: member,
      profile: profile,
    })
    .from(message)
    .leftJoin(member, eq(message.memberId, member.id))
    .leftJoin(profile, eq(member.profileId, curProfile.id))
    .where(eq(message.id, insertedMessage[0].id))
    .limit(1)
    .execute();

    const channelKey = `chat:${channelId}:messages`;

    res?.socket?.server?.io?.emit(channelKey, fullMessage[0]);

    return res.status(200).json(fullMessage[0]);

  } catch (error) {
    console.log("[MESSAGES_POST]", error);
    return res.status(500).json({ error: "Internal Error" });
  }
}