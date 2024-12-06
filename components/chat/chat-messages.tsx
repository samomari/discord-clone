'use client';

import { SelectMember } from "@/db/schema";
import { ChatWelcome } from "./chat-welcome";
import { useChatQuery } from "@/hooks/use-chat-query";
import { Loader2, ServerCrash } from "lucide-react";
import { useEffect, useRef, ElementRef } from "react";
import { ChatItem } from "./chat-item";
import { format } from "date-fns";
import { useChatStore } from "@/hooks/use-chat-store";
import { useSocket } from "../providers/socket-provider";
import { useChatScroll } from "@/hooks/use-chat-scroll";

const DATE_FORMAT = "d MMM yyyy, HH:mm";

interface ChatMessagesProps {
  name: string;
  member: SelectMember;
  chatId: string;
  apiUrl: string;
  socketUrl: string;
  query: Record<string, string>;
  paramKey: "channelId" | "conversationId";
  paramValue: string;
  type: "channel" | "conversation";
}

export const ChatMessages = ({
  name,
  member,
  chatId,
  apiUrl,
  socketUrl,
  query,
  paramKey,
  paramValue,
  type
}: ChatMessagesProps) => {
  const queryKey = `chat:${chatId}`;
  const deleteKey = `chat:${chatId}:messages:delete`;

  const chatRef = useRef<ElementRef<"div">>(null);
  const bottomRef = useRef<ElementRef<"div">>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status
  } = useChatQuery({
    queryKey,
    apiUrl,
    paramKey,
    paramValue
  });

  const setMessages = useChatStore((state) => state.setMessages);
  const messages = useChatStore((state) => state.messages);
  const updateMessage = useChatStore((state) => state.updateMessage);
  const { socket, isConnected } = useSocket();
  useChatScroll({
    chatRef,
    bottomRef,
    loadMore: fetchNextPage,
    hasMore: !isFetchingNextPage && !!hasNextPage,
    count: messages?.length ?? 0,
  });

  useEffect(() => {
    if (socket && isConnected) {
      const handleDelete = (deletedMessage) => {
        updateMessage(deletedMessage);
      };

      socket.on(deleteKey, handleDelete);

      return () => {
        socket.off(deleteKey, handleDelete);
      };
    }
  }, [socket, isConnected, updateMessage, deleteKey]);

  useEffect(() => {
    if (data && data.pages) {
      const allMessages = data.pages.flatMap((page) => page.items);
      setMessages(allMessages);
    }
    return () => setMessages([]);
  }, [data, chatId, setMessages]); 
  
  if (status === "pending") {
    return (
      <div className="flex flex-col flex-1 justify-center items-center">
        <Loader2 className="h-7 w-7 text-zinc-500 animate-spin my-4"/>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Loading messages...
        </p>
      </div>
    )
  }

  if (status === "error") {
    return (
      <div className="flex flex-col flex-1 justify-center items-center">
        <ServerCrash className="h-7 w-7 text-zinc-500 my-4"/>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Something went wrong!
        </p>
      </div>
    )
  }
  
  return (
    <div ref={chatRef} className="flex-1 flex flex-col py-4 overflow-y-auto">
      {!hasNextPage &&<div className="flex-1"/>}
      {!hasNextPage && (
        <ChatWelcome
          type={type}
          name={name}
        />
      )}
      {hasNextPage && (
        <div className="flex justify-center">
          {isFetchingNextPage ? (
            <Loader2 className="h-6 w-6 text-zinc-500 animate-spin my-4"/>
          ) : (
            <button
              onClick={() => fetchNextPage()}
              className="text-zinc-500 hover-text-zinc-600 dark:text-zinc-400 text-xs my-4 dark:hover:text-zinc-300 transition">
              Load Previous Messages
            </button>
          )}
        </div>
      )}
      <div className="flex flex-col-reverse mt-auto">
        {messages.map((message) => (
          <ChatItem
            key={message.messages.id}
            id={message.messages.id}
            currentMember={member}
            member={message.members}
            profile={message.profiles}
            content={message.messages.content}
            fileUrl={message.messages.fileUrl}
            fileType={message.messages.fileType}
            deleted={message.messages.deleted}
            timestamp={format(new Date(message.messages.createdAt), DATE_FORMAT)}
            isUpdated={message.messages.updatedAt !== message.messages.createdAt}
            socketUrl={socketUrl}
            query={query}
          />
        ))}
      </div>
      <div ref={bottomRef}/>
    </div>
  )
}