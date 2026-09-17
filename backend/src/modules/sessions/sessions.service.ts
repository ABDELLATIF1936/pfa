import {
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
  ConflictException,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BornesService } from '../bornes/bornes.service';
import { StatutBorne } from '../bornes/enums/statut-borne.enum';
import { OcppServerService } from '../ocpp/ocpp-server.service';
import { SessionRecharge, StatutSessionRecharge } from './entities/session-recharge.entity';
import { StartSessionQrDto } from './dto/start-session-qr.dto';
import { Vehicule } from './entities/vehicule.entity';

@Injectable()
export class SessionsService {
  private readonly logger = new Logger('SessionsService');

  constructor(
    @InjectRepository(SessionRecharge)
    private readonly sessionRepository: Repository<SessionRecharge>,
    @InjectRepository(Vehicule)
    private readonly vehiculeRepository: Repository<Vehicule>,
    private readonly bornesService: BornesService,
    @Inject(forwardRef(() => OcppServerService))
    private readonly ocppServerService: OcppServerService,
  ) {}

  async reconcilierSessionsOrphelines(): Promise<number> {
    const sessionsOrphelines = await this.sessionRepository.find({
      where: { statut: StatutSessionRecharge.EN_COURS },
    });

    if (sessionsOrphelines.length === 0) {
      this.logger.log('✅ Aucune session orpheline à réconcilier.');
      return 0;
    }

    const dateFin = new Date();
    const borneIds = new Set<string>();

    for (const session of sessionsOrphelines) {
      session.statut = StatutSessionRecharge.INTERRUPPUE;
      session.dateFin = dateFin;
      await this.sessionRepository.save(session);
      borneIds.add(session.borneId);

      this.logger.warn(
        `🧹 Session orpheline nettoyée : ${session.id} ` +
          `(transaction ${session.ocppTransactionId}, borne ${session.borneId})`,
      );
    }

    for (const borneId of borneIds) {
      await this.bornesService.updateStatut(borneId, {
        statut: StatutBorne.DISPONIBLE,
      });
    }

    this.logger.log(
      `✅ Réconciliation terminée : ${sessionsOrphelines.length} session(s) interrompue(s).`,
    );
    return sessionsOrphelines.length;
  }

  create(data: Partial<SessionRecharge>) {
    return this.sessionRepository.save(this.sessionRepository.create(data));
  }

  findById(id: string) {
    return this.sessionRepository.findOne({
      where: { id },
      relations: { borne: { site: true }, client: true, vehicule: true },
    });
  }

  findAll(clientId?: string) {
    return this.sessionRepository.find({
      where: clientId ? { clientId } : {},
      relations: { borne: true, client: true, vehicule: true },
      order: { dateDebut: 'DESC' },
    });
  }

  async getStatus(id: string, clientId?: string) {
    const session = await this.findById(id);
    if (!session || (clientId && session.clientId !== clientId)) {
      throw new NotFoundException('Session de recharge introuvable');
    }

    return {
      energieConsommee: session.energieConsommee,
      tempsEcoule: Math.max(
        0,
        Math.floor(((session.dateFin ?? new Date()).getTime() - session.dateDebut.getTime()) / 1000),
      ),
      statut: session.statut,
      borne: {
        identifiantUnique: session.borne.identifiantUnique,
        statut: session.borne.statut,
      },
    };
  }

  async findByOcppTransactionId(ocppTransactionId: number) {
    const session = await this.sessionRepository.findOne({
      where: { ocppTransactionId },
    });

    if (!session) {
      throw new NotFoundException('Session de recharge introuvable');
    }

    return session;
  }

  async findActiveByBorneId(borneId: string) {
    return this.sessionRepository.findOne({
      where: {
        borneId,
        statut: StatutSessionRecharge.EN_COURS,
      },
    });
  }

  async updateEnergie(id: string, energieConsommee: number) {
    const session = await this.findById(id);
    if (!session) {
      throw new NotFoundException('Session de recharge introuvable');
    }

    session.energieConsommee = Number(energieConsommee.toFixed(3));
    return this.sessionRepository.save(session);
  }

  async interrompreActiveByBorneId(borneId: string, dateFin = new Date()) {
    const session = await this.findActiveByBorneId(borneId);
    if (!session) {
      return null;
    }

    session.dateFin = dateFin;
    session.statut = StatutSessionRecharge.INTERRUPPUE;
    return this.sessionRepository.save(session);
  }

  async cloturer(id: string, dateFin = new Date()) {
    const session = await this.findById(id);
    if (!session) {
      throw new NotFoundException('Session de recharge introuvable');
    }

    session.dateFin = dateFin;
    session.statut = StatutSessionRecharge.TERMINEE;

    return this.sessionRepository.save(session);
  }

  async requestStop(id: string, clientId?: string) {
    const session = await this.findById(id);
    if (!session || (clientId && session.clientId !== clientId)) {
      throw new NotFoundException('Session de recharge introuvable');
    }
    if (session.statut !== StatutSessionRecharge.EN_COURS) {
      throw new ConflictException('Cette session est déjà terminée');
    }

    try {
      const response = await this.ocppServerService.sendRemoteStopTransaction(
        session.borne.identifiantUnique,
        session.ocppTransactionId,
      );
      return { status: 'RemoteStopSent', sessionId: session.id, response };
    } catch (error) {
      throw new ServiceUnavailableException(
        error instanceof Error ? error.message : 'Impossible d’arrêter la borne',
      );
    }
  }

  async startQrSession(clientId: string, dto: StartSessionQrDto) {
    // 1. Vérifier que la borne existe
    const borne = await this.bornesService.findByIdentifiantUnique(
      dto.identifiantBorne,
    );

    // 2. Vérifier que la borne est disponible
    if (borne.statut !== StatutBorne.DISPONIBLE) {
      throw new ConflictException(
        `Borne ${dto.identifiantBorne} indisponible (statut: ${borne.statut})`,
      );
    }

    // 3. Vérifier qu'aucune session active n'existe déjà pour cette borne
    const activeSession = await this.findActiveByBorneId(borne.id);
    if (activeSession) {
      throw new ConflictException(
        `Une session est déjà en cours sur la borne ${dto.identifiantBorne} (transaction ${activeSession.ocppTransactionId})`,
      );
    }

    // 4. Vérifier que la borne est connectée au serveur OCPP
    if (!this.ocppServerService.isConnected(dto.identifiantBorne)) {
      throw new ServiceUnavailableException(
        `Borne ${dto.identifiantBorne} hors ligne`,
      );
    }

    // 5. Préparer le idTag QR (client identifié par clientId)
    if (dto.vehiculeId) {
      const vehicule = await this.vehiculeRepository.findOne({
        where: { id: dto.vehiculeId, clientId },
      });
      if (!vehicule) {
        throw new NotFoundException('Véhicule introuvable pour ce client');
      }
    }

    const idTag = `QR_${clientId}_${Date.now()}`;
    this.ocppServerService.registerQrSessionMetadata(idTag, {
      clientId,
      vehiculeId: dto.vehiculeId,
    });

    // 6. Envoyer RemoteStartTransaction à la borne
    try {
      void this.ocppServerService
        .sendRemoteStartTransaction(dto.identifiantBorne, idTag)
        .catch((error) => {
          this.logger.warn(
            `RemoteStartTransaction non confirmé pour ${dto.identifiantBorne}: ${error instanceof Error ? error.message : String(error)}`,
          );
        });

      this.logger.log(
        `✅ RemoteStartTransaction envoyé pour QR session (client ${clientId}, borne ${dto.identifiantBorne})`,
      );

      // 7. Retourner une réponse immédiate au client (la vraie session sera créée par StartTransaction OCPP)
      return {
        status: 'RemoteStartSent',
        borneId: borne.id,
        identifiantBorne: dto.identifiantBorne,
        transactionPending: true,
        message: 'Commande de démarrage envoyée à la borne',
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      if (errorMessage.includes('Timeout')) {
        throw new ServiceUnavailableException(
          `Borne ne répond pas au RemoteStartTransaction`,
        );
      }

      if (errorMessage.includes('Rejected')) {
        throw new ConflictException(
          `Borne a rejeté le RemoteStartTransaction (${errorMessage})`,
        );
      }

      this.logger.error(
        `Erreur RemoteStartTransaction pour QR session: ${errorMessage}`,
      );
      throw error;
    }
  }
}
