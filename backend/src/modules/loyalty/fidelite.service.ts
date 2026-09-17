import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Facture } from '../facturation/entities/facture.entity';
import { CompteFidelite } from './entities/compte-fidelite.entity';
import { HistoriquePointsFidelite, TypeOperationFidelite } from './entities/historique-points-fidelite.entity';
import { NiveauFidelite } from './entities/niveau-fidelite.entity';
import { Recompense } from './entities/recompense.entity';

@Injectable()
export class FideliteService {
  private readonly logger = new Logger(FideliteService.name);

  constructor(
    @InjectRepository(CompteFidelite)
    private readonly compteRepository: Repository<CompteFidelite>,
    @InjectRepository(NiveauFidelite)
    private readonly niveauRepository: Repository<NiveauFidelite>,
    @InjectRepository(Recompense)
    private readonly recompenseRepository: Repository<Recompense>,
    @InjectRepository(HistoriquePointsFidelite)
    private readonly historiqueRepository: Repository<HistoriquePointsFidelite>,
  ) {}

  async getOrCreateCompte(clientId: string): Promise<CompteFidelite> {
    let compte = await this.compteRepository.findOne({
      where: { clientId },
      relations: { niveauActuel: true },
    });

    if (!compte) {
      compte = this.compteRepository.create({
        clientId,
        points: 0,
      });
      compte = await this.compteRepository.save(compte);
      await this.recalculerNiveau(compte);
    }

    return compte;
  }

  async ajouterPoints(clientId: string, facture: Facture): Promise<void> {
    const pointsGagnes = Math.floor(Number(facture.montantTotal ?? 0) / 10);
    if (pointsGagnes <= 0) {
      return;
    }

    const compte = await this.getOrCreateCompte(clientId);
    compte.points += pointsGagnes;
    await this.compteRepository.save(compte);

    const historique = this.historiqueRepository.create({
      compteFideliteId: compte.id,
      type: TypeOperationFidelite.GAIN,
      points: pointsGagnes,
      factureId: facture.id,
      description: `Gain de fidélité sur facture ${facture.numero ?? facture.id}`,
    });

    await this.historiqueRepository.save(historique);
    await this.recalculerNiveau(compte);
  }

  async recalculerNiveau(compteFidelite: CompteFidelite): Promise<void> {
    const niveaux = (await this.niveauRepository.find({
      order: { seuilPoints: 'DESC' },
    })).sort((a, b) => b.seuilPoints - a.seuilPoints);

    const niveauEligible =
      niveaux.find((niveau) => niveau.seuilPoints <= (compteFidelite.points ?? 0)) ??
      null;

    if (!niveauEligible) {
      return;
    }

    const niveauActuel = niveaux.find(
      (niveau) => niveau.id === compteFidelite.niveauActuelId,
    );
    if (
      niveauActuel &&
      niveauActuel.seuilPoints >= niveauEligible.seuilPoints
    ) {
      return;
    }

    compteFidelite.niveauActuelId = niveauEligible.id;
    await this.compteRepository.save(compteFidelite);
    this.logger.log(
      `Client ${compteFidelite.clientId} passe au niveau ${niveauEligible.nom}`,
    );
    // TODO: brancher la notification de niveau une fois le canal de notification disponible.
  }

  async echangerPoints(
    clientId: string,
    recompenseId: string,
  ): Promise<{ compteFidelite: CompteFidelite; recompense: Recompense }> {
    return this.compteRepository.manager.transaction(async (manager) => {
      const compteRepo = manager.getRepository(CompteFidelite);
      const recompenseRepo = manager.getRepository(Recompense);
      const historiqueRepo = manager.getRepository(HistoriquePointsFidelite);

      let compte = await compteRepo
        .createQueryBuilder('compte')
        .where('compte.clientId = :clientId', { clientId })
        .setLock('pessimistic_write')
        .getOne();

      if (!compte) {
        compte = compteRepo.create({ clientId, points: 0 });
        compte = await compteRepo.save(compte);
      }

      const recompense = await recompenseRepo.findOne({
        where: { id: recompenseId },
      });

      if (!recompense || !recompense.actif) {
        throw new NotFoundException('Récompense introuvable ou inactive');
      }

      if (compte.points < recompense.coutPoints) {
        throw new BadRequestException(
          `pointsInsuffisants: solde actuel ${compte.points}, coût requis ${recompense.coutPoints}`,
        );
      }

      compte.points -= recompense.coutPoints;
      await compteRepo.save(compte);

      const historique = historiqueRepo.create({
        compteFideliteId: compte.id,
        type: TypeOperationFidelite.ECHANGE,
        points: recompense.coutPoints,
        recompenseId: recompense.id,
        description: `Échange récompense ${recompense.nom}`,
      });

      await historiqueRepo.save(historique);

      // Règle métier : le niveau reflète l'activité cumulée du client et ne doit pas baisser
      // lorsqu'il dépense des points, car cela pénaliserait un client qui a déjà accumulé des points.
      return { compteFidelite: compte, recompense };
    });
  }

  async getMonCompte(clientId: string) {
    const compte = await this.getOrCreateCompte(clientId);
    const niveaux = await this.niveauRepository.find({
      order: { seuilPoints: 'ASC' },
    });
    const niveauActuel =
      niveaux
        .slice()
        .reverse()
        .find((niveau) => niveau.seuilPoints <= compte.points) ??
      niveaux[0] ??
      null;

    const prochainNiveau =
      niveaux
        .filter((niveau) => niveau.seuilPoints > compte.points)
        .sort((a, b) => a.seuilPoints - b.seuilPoints)[0] ?? null;

    const recompenses = await this.recompenseRepository.find({
      where: { actif: true },
      order: { coutPoints: 'ASC' },
    });

    return {
      points: compte.points,
      niveau: {
        nom: niveauActuel?.nom ?? 'Bronze',
        pourcentageReduction: Number(niveauActuel?.pourcentageReduction ?? 0),
      },
      pointsProchainNiveau: prochainNiveau
        ? prochainNiveau.seuilPoints - compte.points
        : null,
      recompensesDisponibles: recompenses.map((recompense) => ({
        ...recompense,
        atteignable: recompense.coutPoints <= compte.points,
      })),
    };
  }

  async getHistorique(clientId: string, page = 1, limit = 20) {
    const compte = await this.getOrCreateCompte(clientId);
    const [items, total] = await this.historiqueRepository.findAndCount({
      where: { compteFideliteId: compte.id },
      order: { dateOperation: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      items,
      total,
      page,
      limit,
    };
  }

  async findAllNiveaux() {
    return this.niveauRepository.find({ order: { seuilPoints: 'ASC' } });
  }

  async findOneNiveau(id: string) {
    const niveau = await this.niveauRepository.findOne({ where: { id } });
    if (!niveau) {
      throw new NotFoundException('Niveau de fidélité introuvable');
    }
    return niveau;
  }

  async createNiveau(data: Partial<NiveauFidelite>) {
    const niveau = this.niveauRepository.create(data);
    return this.niveauRepository.save(niveau);
  }

  async updateNiveau(id: string, data: Partial<NiveauFidelite>) {
    const niveau = await this.findOneNiveau(id);
    Object.assign(niveau, data);
    return this.niveauRepository.save(niveau);
  }

  async removeNiveau(id: string) {
    const niveau = await this.findOneNiveau(id);
    await this.niveauRepository.remove(niveau);
    return { success: true };
  }

  async findAllRecompenses() {
    return this.recompenseRepository.find({
      order: { coutPoints: 'ASC' },
    });
  }

  async findOneRecompense(id: string) {
    const recompense = await this.recompenseRepository.findOne({ where: { id } });
    if (!recompense) {
      throw new NotFoundException('Récompense introuvable');
    }
    return recompense;
  }

  async createRecompense(data: Partial<Recompense>) {
    const recompense = this.recompenseRepository.create(data);
    return this.recompenseRepository.save(recompense);
  }

  async updateRecompense(id: string, data: Partial<Recompense>) {
    const recompense = await this.findOneRecompense(id);
    Object.assign(recompense, data);
    return this.recompenseRepository.save(recompense);
  }

  async removeRecompense(id: string) {
    const recompense = await this.findOneRecompense(id);
    recompense.actif = false;
    await this.recompenseRepository.save(recompense);
    return { success: true };
  }
}
