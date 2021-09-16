import WebSocket from 'ws';
import { WebRtcSignalingService } from '../services/webRtcSignaling.service';

export interface WebRtcSignalingController {
  onSocketConnected: (socket: WebSocket) => void;
}

export type MessageType = 'subscribe' | 'streamRequest' | 'offer' | 'answer';
export type ConnectionType = 'client' | 'server';

export type Message = {
  sessionId: string;
  type: MessageType;
  connectionType: ConnectionType;
  payload?: string;
};

const webRtcSignalingController = (
  webRtcSignalingService: WebRtcSignalingService
): WebRtcSignalingController => {
  return {
    onSocketConnected: (socket) => {
      socket.on('message', (data) => {
        const message: Message = JSON.parse(data.toString());
        switch (message.type) {
          case 'subscribe':
            webRtcSignalingService.subscribeSocket(socket, message);
            break;
          case 'streamRequest':
            webRtcSignalingService.requestStream(message);
            break;
          case 'offer':
            webRtcSignalingService.sendOffer(message);
            break;
          case 'answer':
            webRtcSignalingService.sendAnswer(message);
            break;
        }
      });
    },
  };
};

export default webRtcSignalingController;
