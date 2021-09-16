import * as WebSocket from 'ws';
import { IncomingMessage } from 'http';
import { Socket } from 'net';
import { WebRtcSignalingController } from '../controllers/webRtcSignaling.controller';

export interface WebSockets {
  handleUpgrade: (
    request: IncomingMessage,
    socket: Socket,
    upgradeHead: Buffer
  ) => void;
  shutdown: () => void;
}

const webSocketsServer = (
  webRtcSignalingController: WebRtcSignalingController
): WebSockets => {
  const wss = new WebSocket.Server({ noServer: true });

  return {
    handleUpgrade: (request, socket, head) => {
      wss.handleUpgrade(request, socket, head, (socket) => {
        webRtcSignalingController.onSocketConnected(socket);
      });
    },
    shutdown: () => {
      wss.clients.forEach((socket) => {
        socket.close();
        socket.terminate();
      });
      wss.close();
    },
  };
};

export default webSocketsServer;
