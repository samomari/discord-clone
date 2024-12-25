import { db } from "@/db/db";
import { channel  } from "@/db/schema";
import { eq } from "drizzle-orm";

export const getChannelData = async (channelId: string) => {
  try {
    const channelData = await db
      .select()
      .from(channel)
      .where(eq(channel.id, channelId))
      .limit(1)
      .execute();

    return channelData[0];
  } catch (error) {
    console.error('Error fetching channel data: ', error);
  }
}