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
        const { type, channelId, conversationId } = data;
        const id = type === 'channel' ? channelId : conversationId;
        
        if (!id) {
          throw new Error("Channel or conversation ID missing");
        }

        try {
          let result;

          if (type === 'channel'){
            result = await handleCreateMessage(data);
          } else if (type === 'conversation') {
            result = await handleCreateConversationMessage(data);
          } else {
            throw new Error("Invalid message type");
          }
          if (!result) {
            throw new Error("Message creation failed");
          }
          io.emit(`chat:${id}:messages`, result);
        } catch (error) {
          console.error("Error creating conversation message");
        }
      });

      socket.on('deleteMessage', async (data) => {
        const { type, channelId, conversationId } = data;
        const id = type === 'channel' ? channelId : conversationId;

        if (!id) {
          throw new Error("Channel or conversation ID missing");
        }

        try {
          let result;

          if (type === 'channel'){
            result = await handleDeleteMessage(data);
          } else if (type === 'conversation') {
            result = await handleDeleteConversationMessage(data);
          } else {
            throw new Error("Invalid message type");
          }
          if (!result) {
            throw new Error("Message deletion failed");
          }
          io.emit(`chat:${id}:messages:delete`, result);
        } catch (error) {
          console.error("Error deleting message: ", error);
        }
      });

      socket.on('updateMessage', async (data) => {
        const { type, channelId, conversationId } = data;
        const id = type === 'channel' ? channelId : conversationId;

        if (!id) {
          throw new Error("Channel or conversation ID missing");
        }

        try {
          let result;

          if (type === 'channel'){
            result = await handleUpdateMessage(data);
          } else if (type === 'conversation') {
            result = await handleUpdateConversationMessage(data);
          } else {
            throw new Error("Invalid message type");
          }
          if (!result) {
            throw new Error("Message update failed");
          }
          io.emit(`chat:${id}:messages:update`, result); 
        } catch (error) {
          console.error("Error updating message: ", error);
        }
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
}