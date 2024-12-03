import { Server as NetServer } from "http";
import { NextApiRequest } from "next";
import { Server as ServerIO } from "socket.io";
import { NextApiResponseServerIO } from "@/types";
import { handleMessage } from "./messages/message-handler";

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

      socket.on('message', async (messagePayload) => {
        console.log('Received message: ', messagePayload);

        try {
          const savedMessage = await handleMessage(messagePayload);

          const channelKey = `chat:${messagePayload.channelId}:messages`;
          io.emit(channelKey, savedMessage);
        } catch (error) {
          console.log('Error handling message: ', error);
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