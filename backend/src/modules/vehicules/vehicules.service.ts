import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from '../users/entities/client.entity';
import { CreateVehiculeDto } from './dto/create-vehicule.dto';
import { UpdateVehiculeDto } from './dto/update-vehicule.dto';
import { Vehicule } from '../sessions/entities/vehicule.entity';

@Injectable()
export class VehiculesService {
  constructor(
    @InjectRepository(Vehicule)
    private readonly vehiculeRepository: Repository<Vehicule>,
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
  ) {}

  create(clientId: string, dto: CreateVehiculeDto) {
    return this.vehiculeRepository.save(
      this.vehiculeRepository.create({ ...dto, clientId }),
    );
  }

  findAll(clientId?: string) {
    return this.vehiculeRepository.find({
      where: clientId ? { clientId } : {},
      relations: { client: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, clientId?: string) {
    const vehicule = await this.vehiculeRepository.findOne({
      where: clientId ? { id, clientId } : { id },
      relations: { client: true },
    });
    if (!vehicule) throw new NotFoundException('Véhicule introuvable');
    return vehicule;
  }

  async update(id: string, clientId: string | undefined, dto: UpdateVehiculeDto) {
    const vehicule = await this.findOne(id, clientId);
    Object.assign(vehicule, dto);
    return this.vehiculeRepository.save(vehicule);
  }

  async remove(id: string, clientId?: string) {
    const vehicule = await this.findOne(id, clientId);
    await this.vehiculeRepository.remove(vehicule);
  }

  async assertClientExists(clientId: string) {
    const client = await this.clientRepository.findOne({ where: { id: clientId } });
    if (!client) throw new NotFoundException('Client introuvable');
  }
}
