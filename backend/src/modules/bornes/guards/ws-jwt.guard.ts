import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { JwtPayload } from '../../auth/strategies/jwt.strategy';
import type { Socket } from 'socket.io';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    await this.authenticateSocket(context.switchToWs().getClient<Socket>());
    return true;
  }

  async authenticateSocket(socket: Socket): Promise<JwtPayload> {
    const token = this.getToken(socket);
    if (!token) {
      throw new UnauthorizedException('Token JWT WebSocket manquant');
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
      socket.data.user = payload;
      return payload;
    } catch (error) {
      throw new UnauthorizedException('Token JWT WebSocket invalide');
    }
  }

  private getToken(socket: Socket): string | undefined {
    const authToken = socket.handshake.auth?.token;
    const authorization = socket.handshake.headers.authorization;
    const queryToken = socket.handshake.query.token;
    const token = authToken || authorization?.replace(/^Bearer\s+/i, '') || queryToken;

    return Array.isArray(token) ? token[0] : token;
  }
}
