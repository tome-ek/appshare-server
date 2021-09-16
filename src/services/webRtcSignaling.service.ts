import WebSocket from 'ws';
import {
  Message,
  ConnectionType,
} from '../controllers/webRtcSignaling.controller';

export interface WebRtcSignalingService {
  subscribeSocket: (socket: WebSocket, message: Message) => void;
  requestStream: (message: Message) => void;
  sendOffer: (message: Message) => void;
  sendAnswer: (message: Message) => void;
}

type SubscribedSocket = {
  socket: WebSocket;
  connectionType: ConnectionType;
  sessionId: string;
};

type SubscribedSockets = SubscribedSocket[];

const webRtcSignalingService = (): WebRtcSignalingService => {
  const subscribedSockets: SubscribedSockets = [];
  let queuedStreamRequests: Message[] = [];

  return {
    subscribeSocket: (socket, message) => {
      const socketToSubscribe = {
        socket,
        connectionType: message.connectionType,
        sessionId: message.sessionId,
      };

      subscribedSockets.push(socketToSubscribe);

      if (message.connectionType === 'server') {
        const streamRequest = queuedStreamRequests.find(
          (m) => m.sessionId === message.sessionId
        );
        if (streamRequest) {
          queuedStreamRequests = queuedStreamRequests.filter(
            (m) => m.sessionId !== message.sessionId
          );
          socket.emit(JSON.stringify(streamRequest));
        }
      }
    },
    requestStream: (message) => {
      const serverSocket = subscribedSockets.find(
        (s) =>
          s.connectionType === 'server' && s.sessionId === message.sessionId
      );
      if (serverSocket) {
        serverSocket.socket.emit(JSON.stringify(message));
      } else {
        queuedStreamRequests.push(message);
      }
    },
    sendOffer: (message) => {
      const clientSocket = subscribedSockets.find(
        (s) =>
          s.connectionType === 'client' && s.sessionId === message.sessionId
      );

      clientSocket && clientSocket.socket.emit(JSON.stringify(message));
    },
    sendAnswer: (message) => {
      const serverSocket = subscribedSockets.find(
        (s) =>
          s.connectionType === 'server' && s.sessionId === message.sessionId
      );

      serverSocket && serverSocket.socket.emit(JSON.stringify(message));
    },
  };
};

export default webRtcSignalingService;
