import { db } from "@/db/db";
import { member } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export const getExistingMember = async (serverId: string, profileId: string) => {
  try {
    const existingMember = await db
      .select()
      .from(member)
      .where(
        and(
          eq(member.serverId, serverId),
          eq(member.profileId, profileId)
        )
      )
      .limit(1)
      .execute();

    if (existingMember.length === 0) {
      return null;
    }

    return existingMember[0];
  } catch (error) {
    console.error('Error fetching existing member: ', error);
  }
}