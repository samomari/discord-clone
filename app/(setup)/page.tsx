import { initialProfile } from "@/lib/initial-profile";
import { db } from "@/db/db";
import { redirect } from "next/navigation";
import { server, member } from "@/db/schema";
import { eq} from "drizzle-orm";
import { InitialModal } from "@/components/modals/initial-modal";
import { ensureServerMembership } from "@/features/servers/ensure-server-membership";

const SetupPage = async () => {
  const profile = await initialProfile();

  const existingServer = await ensureServerMembership(null, profile.id);

  console.log("existingServer", existingServer);

  if (existingServer) {
    return redirect(`/servers/${existingServer.servers.id}`);
  }

  return (
    <div>
      <InitialModal/>
    </div>
  )
}

export default SetupPage;