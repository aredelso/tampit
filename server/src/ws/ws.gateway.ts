import { Injectable } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { WebSocket, Server as WsServer } from 'ws';

@Injectable()
@WebSocketGateway()
export class WsGateway {
  @WebSocketServer()
  server!: WsServer;

  broadcast(msg: object): void {
    if (!this.server) return;
    const data = JSON.stringify(msg);
    this.server.clients.forEach((client: WebSocket) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  }
}
