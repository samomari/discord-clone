import { Separator } from "@/components/ui/separator";
import { NavigationAction } from "./navigation-action";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NavigationItem } from "./navigation-item";
import { ModeToggle } from "@/components/mode-toggle";
import { UserButton } from "@clerk/nextjs";
import { currentProfile } from "@/features/profiles/current-profile";
import { redirect } from "next/navigation";
import { getServers } from "@/features/servers/get-servers";

export async function NavigationSidebar () {
  const profile = await currentProfile();

  if (!profile) {
    return redirect("/");
  }

  const servers = await getServers(profile.id);

  return (
    <div
      className="space-y-4 flex flex-col 
      items-center h-full text-primary w-full py-3 dark:bg-[#1E1F22] bg-[#E3E5E8]"
    >
      <NavigationAction />
      <Separator
        className="h-[2px] bg-zinc-300 dark:bg-zinc-700
        rounded-md w-10 mx-auto"
      />
      <ScrollArea className="flex-1 w-full">
        {servers && servers.length > 0 ? (
            servers.map((server) => (
              <div key={server.id} className="mb-4">
                <NavigationItem 
                id={server.id} 
                name={server.name} 
                imageUrl={server.imageUrl}
                />
              </div>
            ))
          ) : (
            <div>No servers found</div>
          )}
      </ScrollArea>
      <div className="pb-3 mt-auto flex items-center flex-col gap-y-4">
        <ModeToggle />
        <UserButton 
          appearance={{
            elements: {
              avatarBox: "h-[48px] w-[48px]"
            }
          }}
        />
      </div>
    </div>
  )
}