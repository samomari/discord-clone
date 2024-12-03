import { db } from "@/db/db";
import { server, channel, member, message, profile } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function handleMessage(messagePayload) {
  const { serverId, channelId, content, fileUrl, fileType, profileId} = messagePayload; 

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

  if (!content) {
    console.log("Content missing");
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
    .execute();

  if (!serverData || serverData.length === 0) {
    console.log("Server not found");
    return;
  }

  const memberInfo = serverData[0].members;

  if (!memberInfo) {
    console.log("Member not found");
    return;
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
}