import { db } from "@/db/db";
import { member, server } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export const ensureServerMembership = async (serverId: string, profileId: string) => {
  try {
    const serverData = await db
      .select()
      .from(server)
      .innerJoin(member, eq(member.serverId, server.id))
      .where(
        and(
          eq(server.id, serverId), 
          eq(member.profileId, profileId)
        )
      )
      .limit(1)

    if (serverData.length === 0) {
      return null;
    }

    return serverData[0];
  } catch (error) {
    console.error('Error fetching server: ', error);
  }
};