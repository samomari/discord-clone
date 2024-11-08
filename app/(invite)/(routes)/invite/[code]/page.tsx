import { currentProfile } from "@/lib/current-profile";
import { redirect } from "next/navigation";
import { db } from "@/db/db";
import { server, member } from "@/db/schema";
import { eq, and } from "drizzle-orm";

interface InviteCodePageProps {
  params: {
    code: string;
  };
};

const Page = async ({
  params
}: InviteCodePageProps) => {
  const profile = await currentProfile();

  if (!profile) {
    return redirect("/sign-in");
  }

  if (!params.code) {
    return redirect("/");
  }

  const serverData = await db
    .select()
    .from(server)
    .where(eq(server.inviteCode, params.code))
    .limit(1)
    .execute();

  if (!serverData || serverData.length === 0) {
    return redirect("/"); 
  }

  const serverId = serverData[0].id;

  const existingServerMember = await db
    .select()
    .from(member)
    .where(and(
      eq(member.serverId, serverId),
      eq(member.profileId, profile.id) // Ensures this profile is already a member
    ))
    .limit(1)
    .execute();

  if (existingServerMember && existingServerMember.length > 0) {
    return redirect(`/servers/${serverId}`); 
  }

  const newMember = await db
    .insert(member)
    .values({
      profileId: profile.id,
      serverId: serverId
    })
    .returning();

  if (newMember) {
    return redirect(`/servers/${serverId}`);
  }

  return null;
}

export default Page;