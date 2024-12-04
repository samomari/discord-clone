import { Server as NetServer } from "http";
import { NextApiRequest } from "next";
import { Server as ServerIO } from "socket.io";
import { NextApiResponseServerIO } from "@/types";
import { handleCreateMessage, handleDeleteMessage, handleUpdateMessage } from "./messages/message-handler";

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
        try {
          const result = await handleCreateMessage(data);
          if (!result) {
            throw new Error("Message creation failed");
          }
          io.emit(`chat:${data.channelId}:messages`, result);
        } catch (error) {
          console.error("Error creating message: ", error);
        }
      });

      socket.on('deleteMessage', async (data) => {
        try {
          const result = await handleDeleteMessage(data);
          if (!result) {
            throw new Error("Message deletion failed");
          }
          io.emit(`chat:${data.channelId}:messages`, result);
        } catch (error) {
          console.error("Error deleting message: ", error);
        }
      });

      socket.on('updateMessage', async (data) => {
        try {
          const result = await handleUpdateMessage(data);
          if (!result) {
            throw new Error("Message update failed");
          }
          io.emit(`chat:${data.channelId}:messages:update`, result); 
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