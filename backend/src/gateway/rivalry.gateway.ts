import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
    ConnectedSocket,
    MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
    cors: { origin: '*' },
    namespace: '/rivalry',
})
export class RivalryGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server!: Server;

    private connectedUsers = new Map<string, string>(); // socketId -> userId

    handleConnection(client: Socket) {
        console.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        this.connectedUsers.delete(client.id);
        console.log(`Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('authenticate')
    handleAuth(@ConnectedSocket() client: Socket, @MessageBody() data: { userId: string }) {
        this.connectedUsers.set(client.id, data.userId);
        client.emit('authenticated', { success: true });
    }

    @SubscribeMessage('joinRoom')
    handleJoinRoom(@ConnectedSocket() client: Socket, @MessageBody() data: { roomId: string }) {
        client.join(`room:${data.roomId}`);
        client.emit('joinedRoom', { roomId: data.roomId });
    }

    @SubscribeMessage('leaveRoom')
    handleLeaveRoom(@ConnectedSocket() client: Socket, @MessageBody() data: { roomId: string }) {
        client.leave(`room:${data.roomId}`);
    }

    // Methods called by services to broadcast events
    notifyRoomUpdate(roomId: string, event: string, data: any) {
        this.server.to(`room:${roomId}`).emit(event, data);
    }

    notifyUser(userId: string, event: string, data: any) {
        for (const [socketId, uid] of this.connectedUsers.entries()) {
            if (uid === userId) {
                this.server.to(socketId).emit(event, data);
            }
        }
    }
}
