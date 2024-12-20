import { db } from "@/db/db";
import { channel, member, server } from "@/db/schema";
import { currentProfile } from "@/lib/current-profile";
import { redirect } from "next/navigation";
import { eq, and, asc } from "drizzle-orm";
import { ensureServerMembership } from "@/features/servers/ensure-server-membership";
import { ensureGeneralChannelExists } from "@/features/channels/ensure-general-channel-exists";

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

  if(!profile) return redirect('/sign-in');

  const serverData = await ensureServerMembership(id, profile.id);

  if (!serverData) return redirect("/");

  const channelData = await ensureGeneralChannelExists(id);

  if (!channelData) return redirect(`/servers/${id}`);

  return redirect(`/servers/${id}/channels/${channelData.id}`);
}