'use client';

import { Separator } from "@/components/ui/separator";
import { NavigationAction } from "./navigation-action";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NavigationItem } from "./navigation-item";
import { ModeToggle } from "@/components/mode-toggle";
import { UserButton } from "@clerk/nextjs";
import { useServersStore } from "@/hooks/use-server-store";
import { useEffect } from "react";
import { useSocket } from "../providers/socket-provider";

export function NavigationSidebar () {
  const { servers, setServers, addServer, removeServer, updateServer } = useServersStore();
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    const fetchServers = async () => {
      try {
        const res = await fetch("/api/servers");
        if (res.ok) {
          const data = await res.json();
          setServers(data);
        } else {
          console.error("Failed to fetch servers");
        }
      } catch (error) {
        console.error("Error fetching servers:", error);
      }
    };

    fetchServers();
  }, [setServers]);

  useEffect(() => {
    if (socket && isConnected) {

      socket.on("serverDelete", (serverId: string) => {
        removeServer(serverId);
      });

      socket.on("serverUpdate", (updatedServer: any) => {
        updateServer(updatedServer);
      });

      socket.on("serverCreate", (newServer: any) => {
        addServer(newServer);
      });

      return () => {
        socket.off("serverDelete");
        socket.off("serverUpdate");
        socket.off("serverCreate");
      };
    }
  }, [socket, isConnected, addServer, removeServer, updateServer]);

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