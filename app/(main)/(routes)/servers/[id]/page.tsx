import { db } from "@/db/db";
import { channel, member, server } from "@/db/schema";
import { currentProfile } from "@/lib/current-profile";
import { redirect } from "next/navigation";
import { eq, and, asc } from "drizzle-orm";

interface ServerIdPageProps {
  params: {
    id: string
  }
};

export default async function Page ({
  params
}: ServerIdPageProps) {
  const { id } = await params;
  const profile = await currentProfile();

  if(!profile){
    return redirect('/sign-in'); 
  }

  const serverData = await db
    .select()
    .from(server)
    .innerJoin(member, eq(member.serverId, server.id))
    .where(and(eq(server.id, id), eq(member.profileId, profile.id)))
    .limit(1); 

  if (serverData.length === 0) {
    return redirect("/"); 
  }

  const channelData = await db
    .select()
    .from(channel)
    .where(and(eq(channel.serverId, id), eq(channel.name, "general")))
    .orderBy(asc(channel.createdAt)) 
    .limit(1); 

  if (channelData.length === 0) {
    return redirect(`/servers/${id}`);
  }

  return redirect(`/servers/${id}/channels/${channelData[0].id}`);

}