import 'mocha';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import chaiSubset from 'chai-subset';
import WebSocket from 'ws';

chai.use(sinonChai);
chai.use(chaiSubset);

describe('WebRtcSignalingController', () => {
  describe('onSocketConnected', () => {
    it('should accept new web socket connections.', (done) => {
      const websocket = new WebSocket('ws://localhost:3000');
      websocket.onopen = () => {
        done();
      };
    });

    it('should handle "subscribe" message type.', (done) => {
      const websocket = new WebSocket('ws://localhost:3000');
      websocket.onopen = () => {
        websocket.send(
          JSON.stringify({
            type: 'subscribe',
            connectionType: 'server',
            senderId: 'serverId',
            sessionId: 'bar',
          })
        );
        done();
      };
    });

    it('should handle "streamRequest" message type.', (done) => {
      const websocket = new WebSocket('ws://localhost:3000');
      websocket.onopen = () => {
        websocket.send(
          JSON.stringify({
            type: 'streamRequest',
            connectionType: 'client',
            senderId: 'clientId',
            sessionId: 'bar',
          })
        );
        done();
      };
    });

    it('should handle "offer" message type.', (done) => {
      const websocket = new WebSocket('ws://localhost:3000');
      websocket.onopen = () => {
        websocket.send(
          JSON.stringify({
            type: 'offer',
            connectionType: 'server',
            senderId: 'serverId',
            sessionId: 'bar',
          })
        );
        done();
      };
    });

    it('should handle "answer" message type.', (done) => {
      const websocket = new WebSocket('ws://localhost:3000');
      websocket.onopen = () => {
        websocket.send(
          JSON.stringify({
            type: 'answer',
            connectionType: 'client',
            senderId: 'clientId',
            sessionId: 'bar',
          })
        );
        done();
      };
    });
  });
});
