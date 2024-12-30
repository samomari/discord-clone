import { auth } from "@clerk/nextjs/server";
import { db } from "@/db/db";
import { eq } from "drizzle-orm";
import { profile } from "@/db/schema";

export const currentProfile = async () => {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const currentProfile = await db
    .select()
    .from(profile)
    .where(eq(profile.userId, userId)) 
    .limit(1);
    
  return currentProfile.length > 0 ? currentProfile[0] : null;
};
