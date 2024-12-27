import { db } from "@/db/db";
import { member } from "@/db/schema";

export const createMember = async (serverId: string, profileId: string) => {
  try {
    const newMember = await db
      .insert(member)
      .values({
        profileId,
        serverId
      })
      .returning();

    return newMember[0];
  } catch (error) {
    console.error('Error creating member: ', error);
  }
}