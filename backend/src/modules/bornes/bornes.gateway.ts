import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { ForbiddenException, Inject, Logger, UseGuards, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Server, Socket } from 'socket.io';
import { Repository } from 'typeorm';
import { Borne } from './entities/borne.entity';
import { StatutBorne } from './enums/statut-borne.enum';
import { BornesService } from './bornes.service';
import { WsJwtGuard } from './guards/ws-jwt.guard';
import { SessionRecharge } from '../sessions/entities/session-recharge.entity';
import { Role } from '../../common/enums/role.enum';

interface StatutChangePayload {
  borneId: string;
  identifiantUnique: string;
  siteId: string;
  ancienStatut: StatutBorne | string;
  nouveauStatut: StatutBorne | string;
  timestamp: string;
}

@WebSocketGateway({
  namespace: '/bornes',
  cors: {
    origin: process.env.FRONTEND_URL ?? '*',
    credentials: true,
  },
})
@UseGuards(WsJwtGuard)
export class BornesGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(BornesGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(
    @Inject(forwardRef(() => BornesService))
    private readonly bornesService: BornesService,
    @InjectRepository(SessionRecharge)
    private readonly sessionRepository: Repository<SessionRecharge>,
    private readonly wsJwtGuard: WsJwtGuard,
  ) {}

  async handleConnection(client: Socket) {
    try {
      await this.wsJwtGuard.authenticateSocket(client);
      this.logger.log(`Client WebSocket connecté: ${client.id}`);
    } catch (error) {
      this.logger.warn(
        `Connexion WebSocket rejetée pour ${client.id}: ${error instanceof Error ? error.message : 'token invalide'}`,
      );
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client WebSocket déconnecté: ${client.id}`);
  }

  @SubscribeMessage('dashboard:request')
  async handleDashboardRequest() {
    return this.emitStatusOverview();
  }

  @SubscribeMessage('session:subscribe')
  async handleSessionSubscribe(client: Socket, payload: { sessionId?: string }) {
    const sessionId = payload?.sessionId;
    const user = client.data.user as { sub?: string; role?: Role } | undefined;
    const session = sessionId
      ? await this.sessionRepository.findOne({ where: { id: sessionId } })
      : null;

    if (!session) {
      throw new ForbiddenException('Session introuvable');
    }

    if (user?.role !== Role.ADMINISTRATEUR && session.clientId !== user?.sub) {
      throw new ForbiddenException('Accès refusé à cette session');
    }

    await client.join(this.sessionRoom(session.id));
    return { event: 'session:subscribed', sessionId: session.id };
  }

  emitSessionUpdate(payload: {
    sessionId: string;
    energieConsommee: number;
    tempsEcoule: number;
    statut: string;
  }) {
    this.server?.to(this.sessionRoom(payload.sessionId)).emit('session:update', payload);
  }

  emitSessionInterrupted(payload: {
    sessionId: string;
    raison: string;
    errorCode?: string;
  }) {
    this.server
      ?.to(this.sessionRoom(payload.sessionId))
      .emit('session:interrupted', payload);
  }

  emitSessionEnded(payload: { sessionId: string; montant: number }) {
    this.server?.to(this.sessionRoom(payload.sessionId)).emit('session:ended', payload);
  }

  private sessionRoom(sessionId: string) {
    return `session:${sessionId}`;
  }

  emitStatutChange(borne: Borne, ancienStatut: StatutBorne): StatutChangePayload {
    const payload: StatutChangePayload = {
      borneId: borne.id,
      identifiantUnique: borne.identifiantUnique,
      siteId: borne.siteId,
      ancienStatut,
      nouveauStatut: borne.statut,
      timestamp: new Date().toISOString(),
    };

    this.server.emit('borne:statut-change', payload);
    return payload;
  }

  async emitStatusOverview() {
    const overview = await this.bornesService.getStatusOverview();
    this.server.emit('dashboard:update', overview);
    return overview;
  }
}
