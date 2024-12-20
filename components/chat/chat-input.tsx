'use client';

import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form, 
  FormControl,
  FormField,
  FormItem
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { useModal } from "@/hooks/zustand/use-modal-store";
import { EmojiPicker } from "@/components/emoji-picker";
import { useRouter } from "next/navigation";
import { useSocket } from "@/components/providers/socket-provider";
import { useEffect } from "react";
import { useChatStore } from "@/hooks/zustand/use-chat-store";

interface ChatInputProps {
  query: Record<string, any>;
  name: string;
  type: "channel" | "conversation";
}

const formSchema = z.object({
  content: z.string().min(1),
});

export const ChatInput = ({
  query, 
  name, 
  type
}: ChatInputProps) => {
  const { onOpen } = useModal();
  const router = useRouter();
  const { socket, isConnected } = useSocket();
  const { addMessage } = useChatStore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: "",
    }
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (socket && isConnected) {
      try {
        const { serverId, channelId, profileId, conversationId } = query;

        socket.emit('createMessage', {
          content: values.content,
          serverId,
          channelId, 
          profileId,
          conversationId,
          type,
        });

        form.reset();
        router.refresh();
      } catch (error) {
        console.log('Error sending message: ', error);
      }
    } else {
      console.log('Socket not connected');
    }
  };

  useEffect(() => {
    if (socket && isConnected) {
      const event = type === "channel" ? `chat:${query.channelId}:messages` : `chat:${query.conversationId}:messages`;
      socket.on(event, (messageData) => {
        if (messageData && messageData.messages) {
          const newMessage = {
            messages: messageData.messages,  
            members: messageData.members,    
            profiles: messageData.profiles   
          };
          addMessage(newMessage);
        }
      });

      return () => {
        socket.off(event);
      };
    }
  }, [socket, isConnected, query.channelId, query.conversationId, type, addMessage])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField 
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="relative p-4 pb-6">
                  <button
                    type="button"
                    onClick={() => onOpen("messageFile", { query })}
                    className="absolute top-7 left-8 h-[24px] w-[24px] bg-zinc-500 dark:bg-zinc-400 hover:bg-zinc-600 dark:hover:bg-zinc-300 transition rounded-full p-1 flex items-center justify-center"
                  >
                    <Plus className="text-white dark:text-[#313338]"/>
                  </button>
                  <Input 
                    disabled={isLoading}
                    className="px-14 py-6 bg-zinc-200/90 dark:bg-zinc-700/75 border-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-zinc-600 dark:text-zinc-200"
                    placeholder={`Message ${type === "conversation" ? name : "#" + name}`}
                    {...field}
                  />
                  <div className="absolute top-7 right-8">
                    <EmojiPicker 
                      onChange={(emoji: string) => field.onChange(`${field.value} ${emoji}`)}
                    />
                  </div>
                </div>
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
};