import { Server as NetServer } from "http";
import { NextApiRequest } from "next";
import { Server as ServerIO } from "socket.io";
import { NextApiResponseServerIO } from "@/types";
import { handleCreateMessage, handleDeleteMessage, handleUpdateMessage } from "./messages/message-handler";
import { handleCreateConversationMessage, handleDeleteConversationMessage, handleUpdateConversationMessage } from "./direct-messages/direct-message-handler";

export default function handler (req: NextApiRequest, res: NextApiResponseServerIO) {
  if (!res.socket.server.io) {
    console.log('Starting Socket.IO server...');

    const httpServer: NetServer = res.socket.server as any;
    const io = new ServerIO(httpServer, {
      path: '/api/socket/io',
      cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST'],
      },
    });

    io.on('connection', (socket) => {
      console.log('A user connected: ', socket.id);

      socket.on('createMessage', async (data) => {
        await handleMessageAction('create', data, io)
      });

      socket.on('deleteMessage', async (data) => {
        await handleMessageAction('delete', data, io)
      });

      socket.on('updateMessage', async (data) => {
        await handleMessageAction('update', data, io)
      });

      socket.on('disconnect', () => {
        console.log('A user disconnected: ', socket.id);
      });
    });

    res.socket.server.io = io;
  } else {
    console.log('Socket.IO server already running.');
  }

  res.end();
};

const actionHandlers = {
  channel: {
    create: handleCreateMessage,
    delete: handleDeleteMessage,
    update: handleUpdateMessage,
  },
  conversation: {
    create: handleCreateConversationMessage,
    delete: handleDeleteConversationMessage,
    update: handleUpdateConversationMessage,
  },
};

async function handleMessageAction(action: string, data: any, io: ServerIO) {
  const { type, channelId, conversationId } = data;
  const id = type === 'channel' ? channelId : conversationId;

  if (!id) {
    throw new Error("Channel or conversation ID missing");
  }

  try {
    const actionHandler = actionHandlers[type]?.[action];
    if (!actionHandler) {
      throw new Error(`Invalid action '${action}' for type '${type}'`);
    }

    const result = await actionHandler(data);

    if (!result) {
      throw new Error("Message action failed");
    }

    const event = action === 'create' ? `chat:${id}:messages` : `chat:${id}:messages:${action}`;
    io.emit(event, result);
  } catch (error) {
    console.error(`Error ${action} message: `, error);
  }
};