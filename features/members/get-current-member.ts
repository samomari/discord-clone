import { db } from "@/db/db";
import { member, profile } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export const getCurrentMember = async (serverId: string, profileId: string) => {
  try {
    const currentMember = await db
      .select()
      .from(member)
      .innerJoin(profile, eq(profile.id, member.profileId))
      .where(
        and(
          eq(member.serverId, serverId), 
          eq(member.profileId, profileId)
        )
      )
      .limit(1)
      .execute();

    if (currentMember.length === 0) {
      return null;
    }

    return currentMember[0].members;
  } catch (error) {
    console.error('Error fetching current member: ', error);
  }
}