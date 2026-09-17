import {
  forwardRef,
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as http from 'node:http';
import { WebSocket, WebSocketServer } from 'ws';
import { StatutBorne } from '../bornes/enums/statut-borne.enum';
import { BornesService } from '../bornes/bornes.service';
import { BornesGateway } from '../bornes/bornes.gateway';
import { SessionsService } from '../sessions/sessions.service';
import {
  MethodeAuthSession,
  StatutSessionRecharge,
} from '../sessions/entities/session-recharge.entity';
import { UsersService } from '../users/users.service';
import { FacturationService } from '../facturation/facturation.service';
import {
  AuthorizePayload,
  BootNotificationPayload,
  BootNotificationResponsePayload,
  MeterValuesPayload,
  OcppCallErrorFrame,
  OcppCallFrame,
  OcppCallResultFrame,
  OcppFrame,
  OcppIdTagInfo,
  StartTransactionPayload,
  StatusNotificationPayload,
  StopTransactionPayload,
} from './ocpp-message.types';

type OcppActionHandler = (
  ws: WebSocket,
  uniqueId: string,
  payload: Record<string, unknown>,
  identifiantUnique: string,
) => Promise<void> | void;

type PendingOcppRequest = {
  resolve: (payload: Record<string, unknown>) => void;
  reject: (error: Error) => void;
  timeout: NodeJS.Timeout;
};

type QrSessionMetadata = {
  clientId: string;
  vehiculeId?: string;
};

@Injectable()
export class OcppServerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger('OcppServer');
  private readonly clients = new Map<string, WebSocket>();
  private readonly pendingRequests = new Map<string, PendingOcppRequest>();
  private readonly expectedDisconnects = new WeakSet<WebSocket>();
  private readonly qrSessionMetadata = new Map<string, QrSessionMetadata>();
  private readonly handlers: Map<string, OcppActionHandler> = new Map();
  private server: WebSocketServer | undefined;
  private httpServer: http.Server | undefined;

  constructor(
    private readonly configService: ConfigService,
    private readonly bornesService: BornesService,
    private readonly bornesGateway: BornesGateway,
    private readonly usersService: UsersService,
    private readonly facturationService: FacturationService,
    @Inject(forwardRef(() => SessionsService))
    private readonly sessionsService: SessionsService,
  ) {
    this.handlers.set('BootNotification', this.handleBootNotification.bind(this));
    this.handlers.set(
      'StatusNotification',
      this.handleStatusNotification.bind(this),
    );
    this.handlers.set('Authorize', this.handleAuthorize.bind(this));
    this.handlers.set('StartTransaction', this.handleStartTransaction.bind(this));
    this.handlers.set('MeterValues', this.handleMeterValues.bind(this));
    this.handlers.set('StopTransaction', this.handleStopTransaction.bind(this));
  }

  async onModuleInit() {
    await this.sessionsService.reconcilierSessionsOrphelines();
    const port = Number(this.configService.get<number>('OCPP_PORT', 3001));
    this.startServer(port);
  }

  onModuleDestroy() {
    for (const pending of this.pendingRequests.values()) {
      clearTimeout(pending.timeout);
      pending.reject(new Error('Serveur OCPP arrêté'));
    }
    this.pendingRequests.clear();
    this.server?.close();
    this.httpServer?.close();
  }

  private startServer(port: number) {
    this.httpServer = http.createServer();
    this.server = new WebSocketServer({ noServer: true });

    this.httpServer.on('upgrade', (request, socket, head) => {
      const pathname = request.url ?? '/';
      const protocol = request.headers['sec-websocket-protocol'];
      const desiredProtocol = Array.isArray(protocol) ? protocol[0] : protocol;

      if (desiredProtocol !== 'ocpp1.6') {
        this.logger.warn(
          `Refus d'une connexion OCPP sur ${pathname}: protocole WebSocket invalide (${desiredProtocol ?? 'absent'})`,
        );
        socket.write('HTTP/1.1 400 Bad Request\r\nSec-WebSocket-Protocol: ocpp1.6\r\n\r\n');
        socket.destroy();
        return;
      }

      const identifiantUnique = this.extractIdentifiantUnique(pathname);
      if (!identifiantUnique) {
        this.logger.warn(`Connexion rejetée: URL OCPP invalide => ${pathname}`);
        socket.write('HTTP/1.1 400 Bad Request\r\n\r\n');
        socket.destroy();
        return;
      }

      this.server!.handleUpgrade(request, socket, head, (ws) => {
        this.server!.emit('connection', ws, request);
      });
    });

    this.server.on('connection', (ws, request) => {
      const pathname = request.url ?? '/';
      const identifiantUnique = this.extractIdentifiantUnique(pathname);

      if (!identifiantUnique) {
        this.logger.warn(`Connexion rejetée: URL OCPP invalide => ${pathname}`);
        ws.close(1008, 'URL invalide: aucune borne identifiée');
        return;
      }

      this.logger.log(
        `Connexion OCPP reçue pour l'identifiant ${identifiantUnique} sur ${pathname}`,
      );

      // On ne réutilise pas Socket.io ici : OCPP-J exige un WebSocket brut avec le sous-protocole
      // 'ocpp1.6', ce que Socket.io n'expose pas comme protocole natif et standardisé.
      this.handleConnection(ws, identifiantUnique);
    });

    this.httpServer.listen(port, () => {
      this.logger.log(`Serveur OCPP démarré sur ws://localhost:${port}/ocpp/{identifiantUnique}`);
    });
  }

  private extractIdentifiantUnique(pathname: string): string | null {
    const match = pathname.match(/\/ocpp\/([^/?]+)/i);
    return match ? decodeURIComponent(match[1]) : null;
  }

  private async handleConnection(ws: WebSocket, identifiantUnique: string) {
    let connectionReady = false;
    const pendingMessages: string[] = [];

    ws.on('message', async (rawMessage) => {
      const message = rawMessage.toString();

      if (!connectionReady) {
        pendingMessages.push(message);
        return;
      }

      this.logger.debug(`Message OCPP reçu de ${identifiantUnique}: ${message}`);

      try {
        await this.handleIncomingMessage(ws, message, identifiantUnique);
      } catch (error) {
        this.logger.error(
          `Erreur de traitement OCPP pour ${identifiantUnique}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    });

    try {
      const borne = await this.bornesService.findByIdentifiantUnique(identifiantUnique);
      this.clients.set(identifiantUnique, ws);
      (ws as WebSocket & { borneId?: string }).borneId = borne.id;
      connectionReady = true;
      this.logger.log(`BornesService a validé la borne: ${identifiantUnique}`);

      for (const message of pendingMessages.splice(0)) {
        try {
          await this.handleIncomingMessage(ws, message, identifiantUnique);
        } catch (error) {
          this.logger.error(
            `Erreur de traitement OCPP pour ${identifiantUnique}: ${error instanceof Error ? error.message : String(error)}`,
          );
        }
      }
    } catch (error) {
      this.logger.error(
        `Connexion OCPP refusée pour ${identifiantUnique}: ${error instanceof Error ? error.message : 'borne inconnue'}`,
      );
      ws.close(1008, 'Borne non autorisée');
      return;
    }

    ws.on('close', async () => {
      this.clients.delete(identifiantUnique);
      if (this.expectedDisconnects.has(ws)) {
        this.expectedDisconnects.delete(ws);
        this.logger.log(`Connexion OCPP fermée proprement pour ${identifiantUnique}`);
        return;
      }

      try {
        const borne = await this.bornesService.findByIdentifiantUnique(identifiantUnique);
        const session = await this.sessionsService.interrompreActiveByBorneId(borne.id);
        this.logger.warn(
          `Connexion OCPP fermée pour ${identifiantUnique}: déconnexion non volontaire` +
            (session ? `, session ${session.id} interrompue` : ''),
        );

        if (session) {
          await this.bornesService.updateStatut(borne.id, {
            statut: StatutBorne.EN_PANNE,
          });
          this.bornesGateway.emitSessionInterrupted({
            sessionId: session.id,
            raison: 'deconnexion_borne',
          });
        }
      } catch (error) {
        this.logger.error(
          `Échec du traitement de déconnexion pour ${identifiantUnique}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    });

    ws.on('error', (error) => {
      this.logger.error(
        `Erreur WebSocket OCPP pour ${identifiantUnique}: ${error.message}`,
      );
    });
  }

  private async handleIncomingMessage(
    ws: WebSocket,
    rawMessage: string,
    identifiantUnique: string,
  ) {
    const parsed = this.parseFrame(rawMessage);
    if (!parsed || !Array.isArray(parsed)) {
      this.sendCallError(
        ws,
        'unknown',
        'FormatError',
        'Le message OCPP n’est pas un tableau valide.',
      );
      return;
    }

    if (parsed[0] === 3) {
      const [, uniqueId, payload] = parsed as unknown as [3, string, Record<string, unknown>];
      const pending = this.pendingRequests.get(uniqueId);
      if (pending) {
        clearTimeout(pending.timeout);
        this.pendingRequests.delete(uniqueId);
        pending.resolve(payload ?? {});
      }
      return;
    }

    if (parsed[0] === 4) {
      const [, uniqueId, errorCode, description] = parsed as unknown as [4, string, string, string];
      const pending = this.pendingRequests.get(uniqueId);
      if (pending) {
        clearTimeout(pending.timeout);
        this.pendingRequests.delete(uniqueId);
        pending.reject(new Error(`${errorCode}: ${description}`));
      }
      return;
    }

    if (parsed[0] !== 2) {
      this.sendCallError(
        ws,
        'unknown',
        'FormatError',
        'Le message OCPP n’est pas un CALL valide.',
      );
      return;
    }

    const [, uniqueId, action, payload] = parsed as unknown as OcppCallFrame<
      Record<string, unknown>
    >;
    const handler = this.handlers.get(action);

    if (!handler) {
      this.logger.warn(`Action OCPP non implémentée: ${action}`);
      this.sendCallError(
        ws,
        uniqueId,
        'NotImplemented',
        `Action ${action} non implémentée.`,
      );
      return;
    }

    this.logger.log(`Action OCPP traitée: ${action} pour ${identifiantUnique}`);
    await handler(ws, uniqueId, payload, identifiantUnique);
  }

  isConnected(identifiantUnique: string): boolean {
    return this.clients.get(identifiantUnique)?.readyState === WebSocket.OPEN;
  }

  sendRemoteStartTransaction(
    identifiantUnique: string,
    idTag: string,
  ): Promise<Record<string, unknown>> {
    const ws = this.clients.get(identifiantUnique);
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      return Promise.reject(new Error(`Borne hors ligne: ${identifiantUnique}`));
    }

    const uniqueId = `remote-start-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const frame = [2, uniqueId, 'RemoteStartTransaction', { idTag, connectorId: 1 }];

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(uniqueId);
        reject(new Error(`Timeout RemoteStartTransaction pour ${identifiantUnique}`));
      }, 10000);

      this.pendingRequests.set(uniqueId, { resolve, reject, timeout });
      try {
        ws.send(JSON.stringify(frame));
        this.logger.log(`RemoteStartTransaction envoyé à ${identifiantUnique} (${uniqueId})`);
      } catch (error) {
        clearTimeout(timeout);
        this.pendingRequests.delete(uniqueId);
        reject(error instanceof Error ? error : new Error(String(error)));
      }
    });
  }

  sendRemoteStopTransaction(
    identifiantUnique: string,
    transactionId: number,
  ): Promise<Record<string, unknown>> {
    const ws = this.clients.get(identifiantUnique);
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      return Promise.reject(new Error(`Borne hors ligne: ${identifiantUnique}`));
    }

    const uniqueId = `remote-stop-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const frame = [2, uniqueId, 'RemoteStopTransaction', { transactionId }];

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(uniqueId);
        reject(new Error(`Timeout RemoteStopTransaction pour ${identifiantUnique}`));
      }, 10000);

      this.pendingRequests.set(uniqueId, { resolve, reject, timeout });
      try {
        ws.send(JSON.stringify(frame));
        this.logger.log(`RemoteStopTransaction envoyé à ${identifiantUnique} (${uniqueId})`);
      } catch (error) {
        clearTimeout(timeout);
        this.pendingRequests.delete(uniqueId);
        reject(error instanceof Error ? error : new Error(String(error)));
      }
    });
  }

  registerQrSessionMetadata(idTag: string, metadata: QrSessionMetadata) {
    this.qrSessionMetadata.set(idTag, metadata);
    setTimeout(() => this.qrSessionMetadata.delete(idTag), 60_000);
  }

  private parseFrame(rawMessage: string): OcppFrame | null {
    try {
      const parsed = JSON.parse(rawMessage);
      if (!Array.isArray(parsed)) {
        return null;
      }
      return parsed as unknown as OcppFrame;
    } catch {
      return null;
    }
  }

  sendCallResult(
    ws: WebSocket,
    uniqueId: string,
    payload: Record<string, unknown>,
  ) {
    const frame: OcppCallResultFrame<Record<string, unknown>> = [3, uniqueId, payload];
    ws.send(JSON.stringify(frame));
    this.logger.debug(`CALLRESULT envoyé (${uniqueId}): ${JSON.stringify(frame)}`);
  }

  sendCallError(
    ws: WebSocket,
    uniqueId: string,
    errorCode: string,
    description: string,
  ) {
    const frame: OcppCallErrorFrame = [4, uniqueId, errorCode, description, {}];
    ws.send(JSON.stringify(frame));
    this.logger.debug(`CALLERROR envoyé (${uniqueId}): ${JSON.stringify(frame)}`);
  }

  private async handleBootNotification(
    ws: WebSocket,
    uniqueId: string,
    payload: Record<string, unknown>,
    identifiantUnique: string,
  ) {
    const bootPayload = payload as unknown as BootNotificationPayload;
    this.logger.log(`🔌 BootNotification reçu de ${identifiantUnique}`);
    this.logger.log(
      `Détails borne: vendor=${bootPayload.chargePointVendor ?? 'N/A'}, model=${bootPayload.chargePointModel ?? 'N/A'}`,
    );

    const response: BootNotificationResponsePayload = {
      status: 'Accepted',
      currentTime: new Date().toISOString(),
      interval: 300,
    };

    this.sendCallResult(ws, uniqueId, response as unknown as Record<string, unknown>);
  }

  private async handleStatusNotification(
    ws: WebSocket,
    uniqueId: string,
    payload: Record<string, unknown>,
    identifiantUnique: string,
  ) {
    const statusPayload = payload as unknown as StatusNotificationPayload;
    const nouveauStatut = this.mapOcppStatusToProjectStatus(statusPayload.status);
    const borne = await this.bornesService.findByIdentifiantUnique(identifiantUnique);

    if (statusPayload.errorCode && statusPayload.errorCode !== 'NoError') {
      const session = await this.sessionsService.interrompreActiveByBorneId(borne.id);
      if (session) {
        await this.bornesService.updateStatut(borne.id, {
          statut: StatutBorne.EN_PANNE,
        });
        this.bornesGateway.emitSessionInterrupted({
          sessionId: session.id,
          raison: 'panne_signalee',
          errorCode: statusPayload.errorCode,
        });
        this.logger.warn(
          `Panne signalée par ${identifiantUnique}: ${statusPayload.errorCode}, session ${session.id} interrompue`,
        );
      }

      await this.bornesService.updateStatut(borne.id, {
        statut: StatutBorne.EN_PANNE,
      });
      this.sendCallResult(ws, uniqueId, {});
      return;
    }

    this.logger.log(
      `StatusNotification reçu de ${identifiantUnique}: ${statusPayload.status} => ${nouveauStatut}`,
    );

    await this.bornesService.updateStatut(borne.id, {
      statut: nouveauStatut,
    });

    this.sendCallResult(ws, uniqueId, {});
  }

  // Les status OCPP standard sont: Accepted, Blocked, Expired, Invalid, ConcurrentTx.
  // On les vérifie dès l'Authorize pour éviter de démarrer une session avec un client non valide
  // ou avec un wallet insuffisant, puis on ne dépense pas inutilement des ressources côté serveur.
  private async handleAuthorize(
    ws: WebSocket,
    uniqueId: string,
    payload: Record<string, unknown>,
    identifiantUnique: string,
  ) {
    const { idTag } = payload as unknown as AuthorizePayload;
    const response: OcppIdTagInfo = { status: 'Accepted' };

    try {
      if (idTag.startsWith('QR_')) {
        const qrMetadata = this.qrSessionMetadata.get(idTag);

        if (!qrMetadata) {
          this.logger.warn(
            `Authorize refusé pour ${idTag}: session QR introuvable ou expirée (borne ${identifiantUnique})`,
          );
          this.sendCallResult(ws, uniqueId, {
            idTagInfo: { status: 'Invalid' },
          });
          return;
        }

        this.logger.log(`Authorize QR accepté pour ${idTag} depuis la borne ${identifiantUnique}`);
        this.sendCallResult(ws, uniqueId, { idTagInfo: response });
        return;
      }

      const carte = await this.usersService.findCarteRfidByIdentifiantUnique(idTag);
      if (carte.statut !== 'active') {
        this.logger.warn(
          `Authorize refusé pour ${idTag}: carte ${carte.statut} (borne ${identifiantUnique})`,
        );
        this.sendCallResult(ws, uniqueId, {
          idTagInfo: { status: 'Blocked' },
        });
        return;
      }

      const client = carte.client;
      const walletThreshold = 10;
      if (client.modePaiementDefaut === 'wallet' && Number(client.soldeWallet ?? 0) < walletThreshold) {
        this.logger.warn(
          `Authorize refusé pour ${idTag}: solde insuffisant (${client.soldeWallet} < ${walletThreshold})`,
        );
        this.sendCallResult(ws, uniqueId, {
          idTagInfo: { status: 'Invalid' },
        });
        return;
      }

      this.logger.log(`Authorize accepté pour ${idTag} depuis la borne ${identifiantUnique}`);
      this.sendCallResult(ws, uniqueId, {
        idTagInfo: response,
      });
    } catch (error) {
      this.logger.warn(
        `Authorize invalide pour ${idTag}: ${error instanceof Error ? error.message : 'carte inconnue'}`,
      );
      this.sendCallResult(ws, uniqueId, {
        idTagInfo: { status: 'Invalid' },
      });
    }
  }

  private async handleStartTransaction(
    ws: WebSocket,
    uniqueId: string,
    payload: Record<string, unknown>,
    identifiantUnique: string,
  ) {
    const { connectorId, idTag, meterStart, timestamp } = payload as unknown as StartTransactionPayload;

    try {
      const borne = await this.bornesService.findByIdentifiantUnique(identifiantUnique);
      const activeSession = await this.sessionsService.findActiveByBorneId(borne.id);

      if (activeSession) {
        this.logger.warn(
          `⚠️ StartTransaction refusé : session déjà active (transactionId ${activeSession.ocppTransactionId}) sur la borne ${identifiantUnique}`,
        );
        this.sendCallResult(ws, uniqueId, {
          transactionId: activeSession.ocppTransactionId,
          idTagInfo: { status: 'ConcurrentTx' },
        });
        return;
      }

      // Détecter si c'est un flux QR (idTag = QR_<clientId>) ou RFID
      let clientId: string;
      let vehiculeId: string | undefined;
      let methodeAuth = MethodeAuthSession.RFID;

      if (idTag.startsWith('QR_')) {
        const qrMetadata = this.qrSessionMetadata.get(idTag);
        const [, qrClientId] = idTag.split('_');
        clientId = qrMetadata?.clientId ?? qrClientId;
        vehiculeId = qrMetadata?.vehiculeId;
        this.qrSessionMetadata.delete(idTag);
        methodeAuth = MethodeAuthSession.QRCODE;
        this.logger.log(
          `📱 StartTransaction via QR pour client ${clientId} sur borne ${identifiantUnique}`,
        );
      } else {
        // Flux RFID : chercher la carte RFID et son client
        const carte = await this.usersService.findCarteRfidByIdentifiantUnique(idTag);
        clientId = carte.clientId;
      }

      const session = await this.sessionsService.create({
        borneId: borne.id,
        clientId,
        dateDebut: new Date(timestamp),
        energieConsommee: 0,
        methodeAuth,
        vehiculeId,
        statut: StatutSessionRecharge.EN_COURS,
      });

      await this.bornesService.updateStatut(borne.id, {
        statut: StatutBorne.EN_CHARGE,
      });

      this.logger.log(
        `StartTransaction accepté pour borne ${identifiantUnique}, transaction ${session.ocppTransactionId}, connector ${connectorId}, meterStart=${meterStart}`,
      );

      this.sendCallResult(ws, uniqueId, {
        transactionId: session.ocppTransactionId,
        idTagInfo: { status: 'Accepted' },
      });
    } catch (error) {
      this.logger.error(
        `StartTransaction invalide pour borne ${identifiantUnique}: ${error instanceof Error ? error.message : String(error)}`,
      );
      this.sendCallResult(ws, uniqueId, {
        transactionId: 0,
        idTagInfo: { status: 'Invalid' },
      });
    }
  }

  // MeterValues est la source officielle de mise à jour de l'énergie consommée.
  // On peut ensuite déclencher un événement temps réel côté client dans la future Tâche 4.4,
  // sans bloquer le développement de la transaction OCPP actuelle.
  private async handleMeterValues(
    ws: WebSocket,
    uniqueId: string,
    payload: Record<string, unknown>,
    identifiantUnique: string,
  ) {
    const { transactionId, meterValue } = payload as unknown as MeterValuesPayload;

    try {
      const session = await this.sessionsService.findByOcppTransactionId(transactionId);
      const energyWh = this.extractEnergyFromMeterValues(meterValue);
      const updatedEnergy = Number((Number(session.energieConsommee ?? 0) + energyWh / 1000).toFixed(3));

      const updatedSession = await this.sessionsService.updateEnergie(session.id, updatedEnergy);
      this.bornesGateway.emitSessionUpdate({
        sessionId: updatedSession.id,
        energieConsommee: updatedSession.energieConsommee,
        tempsEcoule: Math.max(
          0,
          Math.floor((Date.now() - new Date(updatedSession.dateDebut).getTime()) / 1000),
        ),
        statut: updatedSession.statut,
      });
      this.logger.log(
        `MeterValues traité pour transaction ${transactionId}: +${(energyWh / 1000).toFixed(3)} kWh => ${updatedEnergy} kWh`,
      );

      this.sendCallResult(ws, uniqueId, {});
    } catch (error) {
      this.logger.error(
        `MeterValues rejeté pour borne ${identifiantUnique}: ${error instanceof Error ? error.message : String(error)}`,
      );
      this.sendCallError(
        ws,
        uniqueId,
        'PropertyConstraintViolation',
        'Session OCPP introuvable ou payload invalide',
      );
    }
  }

  private extractEnergyFromMeterValues(meterValue: any[]): number {
    let totalWh = 0;

    for (const entry of meterValue ?? []) {
      for (const sample of entry?.sampledValue ?? []) {
        const rawValue = Number(sample?.value ?? 0);
        const unit = (sample?.unit ?? '').toLowerCase();

        if (!Number.isFinite(rawValue)) continue;

        if (unit === 'wh') totalWh += rawValue;
        else if (unit === 'kwh') totalWh += rawValue * 1000;
      }
    }

    return totalWh;
  }

  private async handleStopTransaction(
    ws: WebSocket,
    uniqueId: string,
    payload: Record<string, unknown>,
    identifiantUnique: string,
  ) {
    const { transactionId, reason, timestamp, meterStop } = payload as unknown as StopTransactionPayload & {
      meterStop?: number;
    };

    try {
      const session = await this.sessionsService.findByOcppTransactionId(transactionId);
      if (session.statut !== StatutSessionRecharge.EN_COURS) {
        this.logger.warn(
          `StopTransaction reçu pour une session non active: transaction ${transactionId}, session ${session.id}`,
        );
        this.sendCallResult(ws, uniqueId, { idTagInfo: { status: 'Accepted' } });
        return;
      }

      const borne = await this.bornesService.findOne(session.borneId);
      const shouldSetFault = reason === 'EmergencyStop' || reason === 'Other';
      const dateFin = timestamp ? new Date(timestamp) : new Date();

      // meterStop est en Wh. Sans meterStart persistant, on ne remplace les
      // MeterValues que si aucune énergie n'a encore été enregistrée.
      if (Number(session.energieConsommee ?? 0) === 0 && Number.isFinite(Number(meterStop))) {
        await this.sessionsService.updateEnergie(
          session.id,
          Number(meterStop) / 1000,
        );
      }

      const sessionTerminee = await this.sessionsService.cloturer(session.id, dateFin);
      this.expectedDisconnects.add(ws);
      if (borne.statut === StatutBorne.EN_CHARGE) {
        await this.bornesService.updateStatut(borne.id, {
          statut: shouldSetFault ? StatutBorne.EN_PANNE : StatutBorne.DISPONIBLE,
        });
      }

      try {
        const facture = await this.facturationService.genererFacture(sessionTerminee);
          this.bornesGateway.emitSessionEnded({
            sessionId: sessionTerminee.id,
            montant: Number(facture.montantTotal),
        });
      } catch (facturationError) {
        this.logger.error(
          `Facturation impossible pour la session ${sessionTerminee.id}: ${facturationError instanceof Error ? facturationError.message : String(facturationError)}`,
        );
      }

      this.logger.log(
        `StopTransaction reçu pour borne ${identifiantUnique}, session ${session.id}, raison=${reason ?? 'Unknown'}`,
      );
      this.sendCallResult(ws, uniqueId, { idTagInfo: { status: 'Accepted' } });
    } catch (error) {
      this.logger.warn(
        `StopTransaction toléré avec transaction inconnue/invalide pour ${identifiantUnique}: ${error instanceof Error ? error.message : String(error)}`,
      );
      this.sendCallResult(ws, uniqueId, { idTagInfo: { status: 'Accepted' } });
    }
  }

  private mapOcppStatusToProjectStatus(status: string): StatutBorne {
    const mapping: Record<string, StatutBorne> = {
      Available: StatutBorne.DISPONIBLE,
      Preparing: StatutBorne.DISPONIBLE,
      Charging: StatutBorne.EN_CHARGE,
      Finishing: StatutBorne.DISPONIBLE,
      Faulted: StatutBorne.EN_PANNE,
      Unavailable: StatutBorne.MAINTENANCE,
      SuspendedEV: StatutBorne.EN_CHARGE,
      SuspendedEVSE: StatutBorne.EN_CHARGE,
    };

    return mapping[status] ?? StatutBorne.EN_PANNE;
  }
}
