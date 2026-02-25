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
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({
    cors: {
        origin: process.env['CORS_ORIGIN']
            ? process.env['CORS_ORIGIN'].split(',')
            : ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001'],
        credentials: true,
    },
    namespace: '/rivalry',
})
export class RivalryGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server!: Server;

    private connectedUsers = new Map<string, string>(); // socketId -> userId

    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) { }

    async handleConnection(client: Socket) {
        try {
            // Extract JWT from handshake auth header or query param
            const token =
                client.handshake.auth?.token ||
                client.handshake.headers?.authorization?.replace('Bearer ', '') ||
                (client.handshake.query?.token as string);

            if (!token) {
                client.emit('error', { message: 'Authentication required' });
                client.disconnect();
                return;
            }

            const secret = this.configService.get<string>('JWT_SECRET');
            const payload = await this.jwtService.verifyAsync(token, { secret });
            const userId = payload.sub;

            if (!userId) {
                client.emit('error', { message: 'Invalid token' });
                client.disconnect();
                return;
            }

            // Store authenticated user mapping
            this.connectedUsers.set(client.id, userId);
            client.emit('authenticated', { success: true, userId });
        } catch {
            client.emit('error', { message: 'Invalid or expired token' });
            client.disconnect();
        }
    }

    handleDisconnect(client: Socket) {
        this.connectedUsers.delete(client.id);
    }

    @SubscribeMessage('joinRoom')
    handleJoinRoom(@ConnectedSocket() client: Socket, @MessageBody() data: { roomId: string }) {
        const userId = this.connectedUsers.get(client.id);
        if (!userId) {
            client.emit('error', { message: 'Not authenticated' });
            return;
        }
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
