import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WsResponse,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';

import { Socket } from 'socket.io';
import { Server } from 'ws';

import { UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { UserGuard } from '../user/user.guard';
import { RouterName } from '../../decorator/router-name.decorator';
import { MessageServer } from './message.server';

import { MessageGetSocket } from './message.dto/message-get-socket';

@WebSocketGateway({ namespace: 'websocket/message' })
export class MessageGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly messageServer: MessageServer) {}
  @WebSocketServer() server: Server;

  wsClients = [];

  // @UsePipes(new ValidationPipe())
  @UseGuards(UserGuard)
  @RouterName('getMessage')
  @SubscribeMessage('get_message')
  findAll(
    @MessageBody() data: MessageGetSocket,
    @ConnectedSocket() client: Socket,
  ) {
    this.broadcast('get_message', data);
  }
  // новое сообщение для всех
  //    this.broadcast('get_message', body);

  afterInit(server: Server) {
    console.log('afterInit');
  }

  handleConnection(client: Socket) {
    // add users
    this.wsClients.push(client);
    console.log(this.wsClients.length);
  }

  handleDisconnect(client: Socket) {
    // удаление users
    for (let i = 0; i < this.wsClients.length; i++) {
      if (this.wsClients[i] === client) {
        this.wsClients.splice(i, 1);
        break;
      }
    }
    console.log('handleDisconnect');
  }

  private broadcast(event, data: any) {
    for (const client of this.wsClients) {
      client.emit(event, data);
    }
  }
}
