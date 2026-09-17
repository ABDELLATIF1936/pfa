import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GrilleTarifaire } from '../tarification/entities/grille-tarifaire.entity';
import { TarificationService } from '../tarification/tarification.service';
import { SessionRecharge } from '../sessions/entities/session-recharge.entity';
import { Client } from '../users/entities/client.entity';
import { FideliteService } from '../loyalty/fidelite.service';
import { Facture, StatutPaiementFacture } from './entities/facture.entity';

@Injectable()
export class FacturationService {
  private readonly logger = new Logger(FacturationService.name);

  constructor(
    @InjectRepository(Facture)
    private readonly factureRepository: Repository<Facture>,
    private readonly tarificationService: TarificationService,
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
    private readonly fideliteService: FideliteService,
  ) {}

  async calculerMontant(session: SessionRecharge): Promise<number> {
    if (!session.dateFin) {
      throw new BadRequestException(
        "Impossible de calculer le montant d'une session non terminée",
      );
    }

    const grille = await this.tarificationService.getGrilleApplicable(
      session.dateDebut,
    );
    const dureeMinutes = Math.max(
      0,
      Math.ceil((session.dateFin.getTime() - session.dateDebut.getTime()) / 60000),
    );
    const energie = Number(session.energieConsommee ?? 0);
    const prixParKwh = Number(grille.prixParKwh ?? 0);
    const prixParMinute = Number(grille.prixParMinute ?? 0);
    const montant = Math.round(
      (energie * prixParKwh + dureeMinutes * prixParMinute) * 100,
    ) / 100;

    this.logger.log(
      `Calcul facture session ${session.id}: énergie=${energie} kWh, durée=${dureeMinutes} min, ` +
        `grille=${grille.id}, montant=${montant}`,
    );
    return montant;
  }

  async genererFacture(session: SessionRecharge): Promise<Facture> {
    const existing = await this.factureRepository.findOne({
      where: { sessionId: session.id },
    });
    if (existing) return existing;

    const montant = await this.calculerMontant(session);
    const grille = await this.tarificationService.getGrilleApplicable(
      session.dateDebut,
    );
    const numero = await this.genererNumeroFacture();
    const facture = this.factureRepository.create({
      numero,
      sessionId: session.id,
      session,
      montantTotal: montant,
      grilleTarifaireId: grille.id,
      grilleTarifaire: grille,
      statutPaiement: StatutPaiementFacture.EN_ATTENTE,
    });

    const savedFacture = await this.factureRepository.save(facture);
    return this.appliquerPaiementAutomatique(savedFacture, session);
  }

  private async appliquerPaiementAutomatique(
    facture: Facture,
    session: SessionRecharge,
  ): Promise<Facture> {
    const client = session.client ??
      (session.clientId
        ? await this.clientRepository.findOne({ where: { id: session.clientId } })
        : null);

    if (!client || client.modePaiementDefaut !== 'wallet') {
      return facture;
    }

    const soldeActuel = Number(client.soldeWallet ?? 0);
    const montant = Number(facture.montantTotal ?? 0);

    if (soldeActuel < montant) {
      facture.statutPaiement = StatutPaiementFacture.ECHOUEE;
      return this.factureRepository.save(facture);
    }

    client.soldeWallet = Number((soldeActuel - montant).toFixed(2));
    await this.clientRepository.save(client);

    facture.statutPaiement = StatutPaiementFacture.PAYEE;
    const facturePayee = await this.factureRepository.save(facture);
    await this.fideliteService.ajouterPoints(client.id, facturePayee);
    return facturePayee;
  }

  async genererNumeroFacture(): Promise<string> {
    const result = await this.factureRepository.manager.query(
      `SELECT nextval('facture_numero_seq') AS value`,
    );
    const sequenceValue = Number(result[0]?.value);
    if (!Number.isInteger(sequenceValue) || sequenceValue < 1) {
      throw new Error('Séquence de numérotation des factures invalide');
    }

    return `FACT-${new Date().getFullYear()}-${String(sequenceValue).padStart(5, '0')}`;
  }

  async findOne(id: string): Promise<Facture> {
    const facture = await this.factureRepository.findOne({
      where: { id },
      relations: {
        session: {
          borne: { site: true },
          client: true,
          vehicule: true,
        },
        grilleTarifaire: true,
      },
    });
    if (!facture) throw new NotFoundException('Facture introuvable');
    return facture;
  }

  async findAll(
    clientId: string | undefined,
    page = 1,
    limit = 20,
    filters: { dateDebut?: string; dateFin?: string; siteId?: string } = {},
  ) {
    const safePage = Math.max(1, Math.floor(page));
    const safeLimit = Math.min(100, Math.max(1, Math.floor(limit)));
    const query = this.factureRepository
      .createQueryBuilder('facture')
      .leftJoinAndSelect('facture.session', 'session')
      .leftJoinAndSelect('session.borne', 'borne')
      .leftJoinAndSelect('borne.site', 'site')
      .leftJoinAndSelect('session.client', 'client')
      .orderBy('facture.date_emission', 'DESC')
      .skip((safePage - 1) * safeLimit)
      .take(safeLimit);

    if (clientId) {
      query.where('session.client_id = :clientId', { clientId });
    }

    if (filters.dateDebut) {
      query.andWhere('facture.date_emission >= :dateDebut', { dateDebut: filters.dateDebut });
    }
    if (filters.dateFin) {
      query.andWhere('facture.date_emission < (CAST(:dateFin AS date) + INTERVAL \'1 day\')', { dateFin: filters.dateFin });
    }
    if (filters.siteId) {
      query.andWhere('borne.site_id = :siteId', { siteId: filters.siteId });
    }

    const [items, total] = await query.getManyAndCount();
    return {
      items: items.map((facture) => ({
        id: facture.id,
        numero: facture.numero,
        montantTotal: Number(facture.montantTotal),
        dateEmission: facture.dateEmission,
        statutPaiement: facture.statutPaiement,
        session: facture.session
          ? {
              id: facture.session.id,
              dateDebut: facture.session.dateDebut,
              dateFin: facture.session.dateFin,
              energieConsommee: facture.session.energieConsommee,
              borne: facture.session.borne
                ? {
                    identifiantUnique: facture.session.borne.identifiantUnique,
                    site: facture.session.borne.site
                      ? {
                          id: facture.session.borne.site.id,
                          nom: facture.session.borne.site.nom,
                          ville: facture.session.borne.site.ville,
                        }
                      : undefined,
                  }
                : undefined,
            }
          : null,
      })),
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit),
    };
  }
}
