import { Separator } from "@/components/ui/separator";
import { NavigationAction } from "./navigation-action";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NavigationItem } from "./navigation-item";
import { ModeToggle } from "@/components/mode-toggle";
import { UserButton } from "@clerk/nextjs";

export const NavigationSidebar = async () => {

  const servers = [
    { id: "1", 
      name: "Server 1", 
      imageUrl: "https://i.pravatar.cc/301" },
    { id: "2", 
      name: "Server 2", 
      imageUrl: "https://i.pravatar.cc/302" },
    { id: "3", 
      name: "Server 3", 
      imageUrl: "https://i.pravatar.cc/303" },
    { id: "4", 
      name: "Server 4", 
      imageUrl: "https://i.pravatar.cc/304" },
    { id: "5", 
      name: "Server 5", 
      imageUrl: "https://i.pravatar.cc/305" }, 
  ]

  return (
    <div
      className="space-y-4 flex flex-col 
      items-center h-full text-primary w-full py-3 dark:bg-[#1E1F22]"
    >
      <NavigationAction />
      <Separator
        className="h-[2px] bg-zinc-300 dark:bg-zinc-700
        rounded-md w-10 mx-auto"
      />
      <ScrollArea className="flex-1 w-full">

        {servers.map((server) => (
          <div key={server.id} className="mb-4">
            <NavigationItem 
             id={server.id} 
             name={server.name} 
             imageUrl={server.imageUrl}
            />
          </div>
        ))}

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