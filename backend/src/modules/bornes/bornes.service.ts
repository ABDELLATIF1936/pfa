import {
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'node:crypto';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Site } from '../sites/entities/site.entity';
import { CreateBorneDto } from './dto/create-borne.dto';
import { UpdateBorneDto } from './dto/update-borne.dto';
import { UpdateStatutBorneDto } from './dto/update-statut-borne.dto';
import { Borne } from './entities/borne.entity';
import { StatutBorne } from './enums/statut-borne.enum';
import { BornesGateway } from './bornes.gateway';
import { QrCodeService } from './qrcode.service';

@Injectable()
export class BornesService {
  constructor(
    @InjectRepository(Borne)
    private readonly borneRepository: Repository<Borne>,
    @InjectRepository(Site)
    private readonly siteRepository: Repository<Site>,
    private readonly qrCodeService: QrCodeService,
    @Inject(forwardRef(() => BornesGateway))
    private readonly bornesGateway: BornesGateway,
  ) {}

  async create(dto: CreateBorneDto) {
    const site = await this.siteRepository.findOne({ where: { id: dto.siteId } });
    if (!site) {
      throw new NotFoundException('Site introuvable');
    }

    const borne = this.borneRepository.create({
      ...dto,
      identifiantUnique: `B_${dto.siteId.slice(0, 8)}_${randomUUID().slice(0, 8)}`,
      statut: StatutBorne.DISPONIBLE,
    });
    const savedBorne = await this.borneRepository.save(borne);
    savedBorne.qrCodeUrl = await this.qrCodeService.generateQrCode(
      savedBorne.identifiantUnique,
    );
    return this.borneRepository.save(savedBorne);
  }

  findAll(siteId?: string, statut?: StatutBorne) {
    const where: FindOptionsWhere<Borne> = {};
    if (siteId) where.siteId = siteId;
    if (statut) where.statut = statut;

    return this.borneRepository.find({
      where,
      relations: { site: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const borne = await this.borneRepository.findOne({
      where: { id },
      relations: { site: true },
    });
    if (!borne) {
      throw new NotFoundException('Borne introuvable');
    }
    return borne;
  }

  async findByIdentifiantUnique(identifiantUnique: string) {
    const borne = await this.borneRepository.findOne({
      where: { identifiantUnique },
      relations: { site: true },
    });
    if (!borne) {
      throw new NotFoundException('Borne introuvable');
    }
    return borne;
  }

  async update(id: string, dto: UpdateBorneDto) {
    const borne = await this.findOne(id);
    Object.assign(borne, dto);
    return this.borneRepository.save(borne);
  }

  async updateStatut(id: string, dto: UpdateStatutBorneDto) {
    const borne = await this.findOne(id);
    const ancienStatut = borne.statut;
    borne.statut = dto.statut;
    const savedBorne = await this.borneRepository.save(borne);

    // L'admin REST et, plus tard, le serveur OCPP passent par ce point d'entrée centralisé.
    await this.bornesGateway.emitStatutChange(savedBorne, ancienStatut);
    return savedBorne;
  }

  async getStatusOverview() {
    // Les agrégations SQL évitent de charger puis compter toutes les bornes en mémoire.
    const statusRows = await this.borneRepository
      .createQueryBuilder('borne')
      .select('borne.statut', 'statut')
      .addSelect('COUNT(*)', 'total')
      .groupBy('borne.statut')
      .getRawMany<{ statut: StatutBorne; total: string }>();

    const siteRows = await this.borneRepository
      .createQueryBuilder('borne')
      .innerJoin('borne.site', 'site')
      .select('site.id', 'siteId')
      .addSelect('site.nom', 'siteNom')
      .addSelect('COUNT(borne.id)', 'totalBornes')
      .addSelect(`COUNT(*) FILTER (WHERE borne.statut = :disponible)`, 'disponibles')
      .addSelect(`COUNT(*) FILTER (WHERE borne.statut = :enCharge)`, 'enCharge')
      .addSelect(`COUNT(*) FILTER (WHERE borne.statut = :horsService)`, 'horsService')
      .setParameters({
        disponible: StatutBorne.DISPONIBLE,
        enCharge: StatutBorne.EN_CHARGE,
        horsService: StatutBorne.HORS_SERVICE,
      })
      .groupBy('site.id')
      .addGroupBy('site.nom')
      .orderBy('site.nom', 'ASC')
      .getRawMany();

    const bornes = await this.borneRepository.find({
      relations: { site: true },
      order: { createdAt: 'DESC' },
    });
    const parStatut = Object.values(StatutBorne).reduce(
      (counts, statut) => ({ ...counts, [statut]: 0 }),
      {} as Record<StatutBorne, number>,
    );
    for (const row of statusRows) parStatut[row.statut] = Number(row.total);

    return {
      totalBornes: statusRows.reduce((total, row) => total + Number(row.total), 0),
      parStatut,
      parSite: siteRows.map((row) => ({
        siteId: row.siteId,
        siteNom: row.siteNom,
        totalBornes: Number(row.totalBornes),
        disponibles: Number(row.disponibles),
        enCharge: Number(row.enCharge),
        horsService: Number(row.horsService),
      })),
      bornes,
    };
  }

  async remove(id: string): Promise<void> {
    const borne = await this.findOne(id);
    // TODO: vérifier ici l'absence de session de recharge active à la tâche 4.1.
    if (borne.statut === StatutBorne.EN_CHARGE) {
      throw new ConflictException(
        'Impossible de supprimer une borne avec une session active',
      );
    }
    await this.borneRepository.remove(borne);
  }
}
