import { db } from "@/db/db";
import { channel, server } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";

export const ensureGeneralChannelExists = async (serverId: string) => {
  try {
    const channelData = await db
      .select()
      .from(channel)
      .where(
        and(
          eq(channel.serverId, serverId),
          eq(channel.name, "general")
        )
      )
      .orderBy(asc(channel.createdAt))
      .limit(1);

    if (channelData.length === 0) {
      return null;
    }
    
    return channelData[0];
  } catch (error){
    console.error('Error fetching general channel: ', error);
  }
};