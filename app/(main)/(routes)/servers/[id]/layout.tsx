import { currentProfile } from "@/features/profiles/current-profile";
import { redirect } from "next/navigation";
import { ServerSidebar } from "@/components/server/server-sidebar";
import { ensureServerMembership } from "@/features/servers/ensure-server-membership";

function isValidUUID(id: string) {
  const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  return uuidRegex.test(id);
}

export default async function Layout ({ 
  children, 
  params, 
}: { 
  children: React.ReactNode;
  params: { id: string }; 
}) {
  const { id } = await params;

  if (!isValidUUID(id)) {
    return redirect("/");
  }

  const profile = await currentProfile();

  if(!profile) return redirect('/sign-in'); 
  
  const serverData = await ensureServerMembership(id, profile.id);
    
  if (!serverData) return redirect("/");

  return (
    <div className="h-full">
      <div className="hidden md:flex h-full w-60 z-20 flex-col
      fixed inset-y-0">
        <ServerSidebar serverId={id}/>
      </div>
      <main className="h-full md:pl-60">
        {children}
      </main>
    </div>
  )
}