import { currentProfile } from "@/lib/current-profile";
import { redirect } from "next/navigation";
import { db } from "@/db/db";
import {server, member } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { ServerSidebar } from "@/components/server/server-sidebar";

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

  if(!profile){
    return redirect('/sign-in'); 
  }

  const servers = await db
    .select()
    .from(server)
    .innerJoin(member, eq(member.serverId, server.id))
    .where(and(eq(server.id, id), eq(member.profileId, profile.id)));
    
  if (!servers || servers.length === 0) {
    return redirect("/");
  }

  const serverData = servers[0].servers;

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