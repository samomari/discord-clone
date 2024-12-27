import { currentProfile } from "@/lib/current-profile";
import { redirect } from "next/navigation";
import { getExistingMember } from "@/features/members/get-existing-member";
import { getServerByInviteCode } from "@/features/servers/get-server-by-invite-code";
import { createMember } from "@/features/members/create-member";

interface InviteCodePageProps {
  params: {
    code: string;
  };
};

const Page = async ({
  params
}: InviteCodePageProps) => {
  const { code } = await params;
  const profile = await currentProfile();

  if (!profile) {
    return redirect("/sign-in");
  }

  if (!code) {
    return redirect("/");
  }

  const serverData = await getServerByInviteCode(code);

  if (!serverData) {
    return redirect("/"); 
  }

  const serverId = serverData.id;

  const existingMember = await getExistingMember(serverId, profile.id);

  if (existingMember) {
    return redirect(`/servers/${serverId}`); 
  }

  const newMember = await createMember(serverId, profile.id);

  if (newMember) {
    return redirect(`/servers/${serverId}`);
  }

  return null;
}

export default Page;