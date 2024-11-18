import { db } from "@/db/db";
import { eq } from "drizzle-orm";
import { profile } from "@/db/schema";
import { getAuth } from "@clerk/nextjs/server";
import { NextApiRequest } from "next";

export const currentProfilePages = async (req: NextApiRequest) => {
  const { userId } = getAuth(req);

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
