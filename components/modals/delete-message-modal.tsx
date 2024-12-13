"use client";

import {
  Dialog, 
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useModal } from "@/hooks/zustand/use-modal-store";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useSocket } from "@/components/providers/socket-provider";


export const DeleteMessageModal = () => {
  const { isOpen, onClose, type, data } = useModal();
  const { socket, isConnected } = useSocket();
  
  const isModalOpen = isOpen && type === "deleteMessage";
  const { query, apiUrl } = data;
  
 
  const [isLoading, setIsLoading] = useState(false);

  const onClick = async () => {
    if (socket && isConnected) {
      try {
        setIsLoading(true);
        const messageId = apiUrl.split("/").pop();
        const { serverId, channelId, profileId, conversationId, type } = query;
        
        socket.emit('deleteMessage', { 
          messageId, 
          serverId, 
          channelId, 
          profileId,
          conversationId,
          type
        });

        onClose();
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    } else {
      console.log('Socket not connected');
    }
  };
  
  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white text-black p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Delete Message
          </DialogTitle>
          <DialogDescription className="text-center text-zinc-500">
            Are you sure you want to do this? <br />
            The message will be permanently deleted.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="bg-gray-100 px-6 py-4">
          <div className="flex items-center justify-between w-full">
            <Button
              disabled={isLoading}
              onClick={onClose}
              variant="ghost"
            >
              Cancel
            </Button>
            <Button
              disabled={isLoading}
              variant="primary"
              onClick={onClick}
            >
              Confirm
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
