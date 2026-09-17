import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectLiteral, Repository, SelectQueryBuilder } from 'typeorm';
import { BornesService } from '../bornes/bornes.service';
import { Borne } from '../bornes/entities/borne.entity';
import { StatutBorne } from '../bornes/enums/statut-borne.enum';
import { Facture, StatutPaiementFacture } from '../facturation/entities/facture.entity';
import {
  SessionRecharge,
  StatutSessionRecharge,
} from '../sessions/entities/session-recharge.entity';
import { Site } from '../sites/entities/site.entity';
import { DashboardQueryDto, TopSitesQueryDto } from './dto/dashboard-query.dto';

@Injectable()
export class DashboardService {
  constructor(
    private readonly bornesService: BornesService,
    @InjectRepository(Borne)
    private readonly borneRepository: Repository<Borne>,
    @InjectRepository(SessionRecharge)
    private readonly sessionRepository: Repository<SessionRecharge>,
    @InjectRepository(Facture)
    private readonly factureRepository: Repository<Facture>,
    @InjectRepository(Site)
    private readonly siteRepository: Repository<Site>,
  ) {}

  async getBornesStatus() {
    const overview = await this.bornesService.getStatusOverview();
    const parStatut = overview.parStatut as Partial<Record<StatutBorne, number>>;

    return {
      disponible: parStatut[StatutBorne.DISPONIBLE] ?? 0,
      en_charge: parStatut[StatutBorne.EN_CHARGE] ?? 0,
      en_panne: parStatut[StatutBorne.EN_PANNE] ?? 0,
      hors_service: parStatut[StatutBorne.HORS_SERVICE] ?? 0,
      total: overview.totalBornes ?? 0,
    };
  }

  async getSessionsActives() {
    const sessions = await this.sessionRepository.find({
      where: { statut: StatutSessionRecharge.EN_COURS },
      relations: { borne: { site: true }, client: true },
      order: { dateDebut: 'ASC' },
    });
    const now = Date.now();

    return sessions.map((session) => ({
      sessionId: session.id,
      borne: {
        identifiantUnique: session.borne.identifiantUnique,
        site: {
          nom: session.borne.site.nom,
          ville: session.borne.site.ville,
        },
      },
      client: {
        nom: session.client.nom,
        prenom: session.client.prenom,
      },
      dateDebut: session.dateDebut,
      dureeEcouleeMinutes: Math.max(
        0,
        Math.floor((now - session.dateDebut.getTime()) / 60000),
      ),
      energieConsommee: Number(session.energieConsommee ?? 0),
      methodeAuth: session.methodeAuth,
    }));
  }

  async getAlertes() {
    const bornes = await this.borneRepository.find({
      where: [
        { statut: StatutBorne.EN_PANNE },
        { statut: StatutBorne.HORS_SERVICE },
      ],
      relations: { site: true },
      order: { updatedAt: 'ASC' },
    });

    return bornes.map((borne) => ({
      borneId: borne.id,
      identifiantUnique: borne.identifiantUnique,
      site: { nom: borne.site.nom, ville: borne.site.ville },
      statut: borne.statut,
      type: borne.statut,
      depuisQuand: borne.updatedAt,
    }));
  }

  async getRevenue(query: DashboardQueryDto) {
    const { dateDebut, dateFin } = this.validateDates(query);
    const builder = this.factureRepository
      .createQueryBuilder('facture')
      .innerJoin('facture.session', 'session')
      .innerJoin('session.borne', 'borne')
      .where('facture.statutPaiement = :statut', {
        statut: StatutPaiementFacture.PAYEE,
      });

    this.applyDateFilter(builder, 'facture.dateEmission', dateDebut, dateFin);
    if (query.siteId) {
      builder.andWhere('borne.site_id = :siteId', { siteId: query.siteId });
    }

    const raw = await builder
      .select('COALESCE(SUM(facture.montantTotal), 0)', 'revenue')
      .addSelect('COUNT(facture.id)', 'nombreFactures')
      .getRawOne<{ revenue: string; nombreFactures: string }>();

    return {
      revenue: Number(raw?.revenue ?? 0),
      nombreFactures: Number(raw?.nombreFactures ?? 0),
      periode: { dateDebut: query.dateDebut ?? null, dateFin: query.dateFin ?? null },
    };
  }

  async getSessionsStats(query: DashboardQueryDto) {
    const { dateDebut, dateFin } = this.validateDates(query);
    const builder = this.sessionRepository
      .createQueryBuilder('session')
      .where('session.statut <> :enCours', {
        enCours: StatutSessionRecharge.EN_COURS,
      });

    this.applyDateFilter(builder, 'session.dateDebut', dateDebut, dateFin);
    if (query.siteId) {
      builder.innerJoin('session.borne', 'borne');
      builder.andWhere('borne.site_id = :siteId', { siteId: query.siteId });
    }

    const raw = await builder
      .select('COUNT(session.id)', 'nombreSessions')
      .addSelect(
        'COALESCE(AVG(EXTRACT(EPOCH FROM (session.dateFin - session.dateDebut)) / 60), 0)',
        'dureeMoyenneMinutes',
      )
      .addSelect('COALESCE(AVG(session.energieConsommee), 0)', 'energieMoyenneKwh')
      .addSelect(
        `COUNT(*) FILTER (WHERE session.statut = :terminee)`,
        'terminee',
      )
      .addSelect(
        `COUNT(*) FILTER (WHERE session.statut = :interrompue)`,
        'interrompue',
      )
      .addSelect(
        `COUNT(*) FILTER (WHERE session.statut = :enPanne)`,
        'enPanne',
      )
      .setParameters({
        terminee: StatutSessionRecharge.TERMINEE,
        interrompue: StatutSessionRecharge.INTERRUPPUE,
        enPanne: StatutSessionRecharge.EN_PANNE,
      })
      .getRawOne<Record<string, string>>();

    return {
      nombreSessions: Number(raw?.nombreSessions ?? 0),
      dureeMoyenneMinutes: Number(raw?.dureeMoyenneMinutes ?? 0),
      energieMoyenneKwh: Number(raw?.energieMoyenneKwh ?? 0),
      repartitionParStatut: {
        terminee: Number(raw?.terminee ?? 0),
        interrompue: Number(raw?.interrompue ?? 0),
        en_panne: Number(raw?.enPanne ?? 0),
      },
    };
  }

  async getTopSites(query: TopSitesQueryDto) {
    const { dateDebut, dateFin } = this.validateDates(query);
    const builder = this.siteRepository
      .createQueryBuilder('site')
      .innerJoin('site.bornes', 'borne')
      .innerJoin('borne.sessionsRecharge', 'session')
      .leftJoin('facture', 'facture', 'facture.session_id = session.id AND facture.statut_paiement = :payee', {
        payee: StatutPaiementFacture.PAYEE,
      })
      .where('session.statut <> :enCours', {
        enCours: StatutSessionRecharge.EN_COURS,
      });

    this.applyDateFilter(builder, 'session.dateDebut', dateDebut, dateFin);

    const rows = await builder
      .select('site.id', 'siteId')
      .addSelect('site.nom', 'nom')
      .addSelect('site.ville', 'ville')
      .addSelect('COUNT(DISTINCT session.id)', 'nombreSessions')
      .addSelect('COALESCE(SUM(facture.montant_total), 0)', 'revenue')
      .addSelect('COALESCE(SUM(session.energie_consommee), 0)', 'energieTotaleKwh')
      .groupBy('site.id')
      .addGroupBy('site.nom')
      .addGroupBy('site.ville')
      .orderBy('revenue', 'DESC')
      .limit(query.limit ?? 5)
      .getRawMany<Record<string, string>>();

    return rows.map((row) => ({
      siteId: row.siteId,
      nom: row.nom,
      ville: row.ville,
      nombreSessions: Number(row.nombreSessions ?? 0),
      revenue: Number(row.revenue ?? 0),
      energieTotaleKwh: Number(row.energieTotaleKwh ?? 0),
    }));
  }

  private validateDates(query: DashboardQueryDto) {
    const dateDebut = query.dateDebut ? new Date(query.dateDebut) : undefined;
    const dateFin = query.dateFin ? new Date(query.dateFin) : undefined;
    if (dateDebut && dateFin && dateDebut > dateFin) {
      throw new BadRequestException('dateDebut doit être antérieure ou égale à dateFin');
    }
    return { dateDebut, dateFin };
  }

  private applyDateFilter(
    builder: SelectQueryBuilder<ObjectLiteral>,
    column: string,
    dateDebut?: Date,
    dateFin?: Date,
  ) {
    if (dateDebut) builder.andWhere(`${column} >= :dateDebut`, { dateDebut });
    if (dateFin) builder.andWhere(`${column} <= :dateFin`, { dateFin });
  }
}
