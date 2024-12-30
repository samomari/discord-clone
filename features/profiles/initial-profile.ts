import { currentUser} from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db/db";
import { eq } from "drizzle-orm";
import { profile } from "@/db/schema";

export const initialProfile = async () => {
  const user = await currentUser();

  if (!user){
    return redirect('/sign-in'); 
  }

  const existingProfile = await db
    .select()
    .from(profile)  
    .where(eq(profile.userId, user.id))
    .limit(1);

  if (existingProfile.length > 0){
    return existingProfile[0];
  }

  const [newProfile] = await db
    .insert(profile)
    .values({
      userId: user.id,
      name: `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}`,
      imageUrl: user.imageUrl,
      email: user.emailAddresses[0].emailAddress
    })
    .returning();

  return newProfile;
}