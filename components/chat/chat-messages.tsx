'use client';

import { SelectMember, SelectMessage, SelectProfile } from "@/db/schema";
import { ChatWelcome } from "./chat-welcome";
import { useChatQuery } from "@/hooks/use-chat-query";
import { Loader2, ServerCrash } from "lucide-react";
import { Fragment } from "react";
import { ChatItem } from "./chat-item";
import { format } from "date-fns";

const DATE_FORMAT = "d MMM yyyy, HH:mm";

interface ChatMessagesProps {
  name: string;
  member: SelectMember;
  chatId: string;
  apiUrl: string;
  socketUrl: string;
  socketQuery: Record<string, string>;
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
  socketQuery,
  paramKey,
  paramValue,
  type
}: ChatMessagesProps) => {
  const queryKey = `chat:${chatId}`;

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
    <div className="flex-1 flex flex-col py-4 overflow-y-auto">
      <div className="flex-1"/>
      <ChatWelcome
        type={type}
        name={name}
      />
      <div className="flex flex-col-reverse mt-auto">
        {data?.pages?.map((group, i) => (
          <Fragment key={i}>
            {group.items.map((message) => (
              <ChatItem
                key={message.messages.id}
                id={message.messages.id}
                currentMember={member}
                member={message.members}
                profile={message.profiles}
                content={message.messages.content}
                fileUrl={message.messages.fileUrl}
                deleted={message.messages.deleted}
                timestamp={format(new Date(message.messages.createdAt), DATE_FORMAT)}
                isUpdated={message.messages.updatedAt !== message.messages.createdAt}
                socketUrl={socketUrl}
                socketQuery={socketQuery}
              />
            ))}
          </Fragment>
        ))}
      </div>
    </div>
  )
}