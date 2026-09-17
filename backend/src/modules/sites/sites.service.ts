import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSiteDto } from './dto/create-site.dto';
import { UpdateSiteDto } from './dto/update-site.dto';
import { Site } from './entities/site.entity';

@Injectable()
export class SitesService {
  constructor(
    @InjectRepository(Site)
    private readonly siteRepository: Repository<Site>,
  ) {}

  create(dto: CreateSiteDto) {
    const site = this.siteRepository.create(dto);
    return this.siteRepository.save(site);
  }

  findAll(ville?: string) {
    return this.siteRepository.find({
      where: ville ? { ville } : undefined,
      order: { nom: 'ASC' },
    });
  }

  async findOne(id: string) {
    const site = await this.siteRepository.findOne({
      where: { id },
      relations: { bornes: true },
    });

    if (!site) {
      throw new NotFoundException('Site introuvable');
    }

    return site;
  }

  async update(id: string, dto: UpdateSiteDto) {
    const site = await this.findOne(id);
    Object.assign(site, dto);
    return this.siteRepository.save(site);
  }

  async remove(id: string): Promise<void> {
    const site = await this.findOne(id);
    if (site.bornes.length > 0) {
      throw new ConflictException(
        'Impossible de supprimer un site contenant des bornes',
      );
    }

    await this.siteRepository.remove(site);
  }
}
