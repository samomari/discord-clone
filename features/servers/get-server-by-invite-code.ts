import { db } from "@/db/db";
import { server } from "@/db/schema";
import { eq } from "drizzle-orm";

export const getServerByInviteCode = async (inviteCode: string) => {
  try {
    const serverData = await db
      .select()
      .from(server)
      .where(eq(server.inviteCode, inviteCode))
      .limit(1)
      .execute();

      if (serverData.length === 0) {
        return null;
      }

      return serverData[0];
  } catch (error) {
    console.error('Error fetching server by invite code: ', error);
  }
}