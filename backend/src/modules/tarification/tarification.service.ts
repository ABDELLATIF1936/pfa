import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateGrilleTarifaireDto } from './dto/create-grille-tarifaire.dto';
import { UpdateGrilleTarifaireDto } from './dto/update-grille-tarifaire.dto';
import { GrilleTarifaire } from './entities/grille-tarifaire.entity';

@Injectable()
export class TarificationService {
  constructor(
    @InjectRepository(GrilleTarifaire)
    private readonly grilleRepository: Repository<GrilleTarifaire>,
  ) {}

  create(dto: CreateGrilleTarifaireDto) {
    this.validatePrices(dto);
    const grille = this.grilleRepository.create({
      ...dto,
      dateEffective: new Date(dto.dateEffective),
      actif: true,
    });
    return this.grilleRepository.save(grille);
  }

  findAll() {
    return this.grilleRepository.find({
      order: { dateEffective: 'DESC' },
    });
  }

  async getCurrent(): Promise<GrilleTarifaire> {
    return this.getGrilleApplicable(new Date());
  }

  async getGrilleApplicable(date: Date): Promise<GrilleTarifaire> {
    const grille = await this.grilleRepository
      .createQueryBuilder('grille')
      .where('grille.actif = :actif', { actif: true })
      .andWhere('grille.date_effective <= :date', { date })
      .orderBy('grille.date_effective', 'DESC')
      .getOne();

    if (!grille) {
      throw new UnprocessableEntityException(
        'Aucune grille tarifaire active applicable pour cette date',
      );
    }

    return grille;
  }

  async findOne(id: string) {
    const grille = await this.grilleRepository.findOne({ where: { id } });
    if (!grille) throw new NotFoundException('Grille tarifaire introuvable');
    return grille;
  }

  async update(id: string, dto: UpdateGrilleTarifaireDto) {
    const grille = await this.findOne(id);
    if (dto.prixParKwh !== undefined || dto.prixParMinute !== undefined) {
      this.validatePrices({
        prixParKwh: dto.prixParKwh ?? Number(grille.prixParKwh),
        prixParMinute: dto.prixParMinute ??
          (grille.prixParMinute == null ? undefined : Number(grille.prixParMinute)),
      });
    }

    Object.assign(grille, dto);
    if (dto.dateEffective) grille.dateEffective = new Date(dto.dateEffective);
    return this.grilleRepository.save(grille);
  }

  async remove(id: string) {
    const grille = await this.findOne(id);
    grille.actif = false;
    return this.grilleRepository.save(grille);
  }

  private validatePrices(dto: {
    prixParKwh?: number;
    prixParMinute?: number;
  }) {
    const hasPositivePrice =
      (dto.prixParKwh !== undefined && dto.prixParKwh > 0) ||
      (dto.prixParMinute !== undefined && dto.prixParMinute > 0);
    if (!hasPositivePrice) {
      throw new UnprocessableEntityException(
        'Au moins un tarif strictement positif est requis',
      );
    }
  }
}
