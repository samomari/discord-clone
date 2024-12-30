import { initialProfile } from "@/features/profiles/initial-profile";
import { redirect } from "next/navigation";
import { InitialModal } from "@/components/modals/initial-modal";
import { ensureServerMembership } from "@/features/servers/ensure-server-membership";

const SetupPage = async () => {
  const profile = await initialProfile();

  const serverData = await ensureServerMembership(null, profile.id);

  if (serverData) {
    return redirect(`/servers/${serverData.servers.id}`);
  }

  return (
    <div>
      <InitialModal/>
    </div>
  )
}

export default SetupPage;