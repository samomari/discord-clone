import { initialProfile } from "@/lib/initial-profile";
import { db } from "@/db/db";
import { redirect } from "next/navigation";
import { server, member } from "@/db/schema";
import { eq} from "drizzle-orm";
import { InitialModal } from "@/components/modals/initial-modal";

const SetupPage = async () => {
  const profile = await initialProfile();

  const existingServer = await db
    .select()
    .from(server)
    .innerJoin(member, eq(member.serverId, server.id)) 
    .where(eq(member.profileId, profile.id)) 
    .limit(1) 
    .execute(); 

    if (existingServer.length > 0) { 
      return redirect(`/servers/${existingServer[0].servers.id}`); 
    }

  return (
    <div>
      <InitialModal/>
    </div>
  )
}

export default SetupPage;