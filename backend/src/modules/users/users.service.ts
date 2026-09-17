import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes } from 'crypto';
import { Repository } from 'typeorm';
import { Client } from './entities/client.entity';
import { Personne } from './entities/personne.entity';
import { CarteRFID, StatutCarteRFID } from './entities/carte-rfid.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';

interface CreateCarteRfidInput {
  clientId: string;
  identifiantUnique?: string;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Personne)
    private readonly personneRepository: Repository<Personne>,
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
    @InjectRepository(CarteRFID)
    private readonly carteRfidRepository: Repository<CarteRFID>,
  ) {}

  findByEmail(email: string) {
    return this.personneRepository.findOne({ where: { email } });
  }

  findById(id: string) {
    return this.personneRepository.findOne({ where: { id } });
  }

  findClientById(id: string) {
    return this.clientRepository.findOne({ where: { id } });
  }

  async findCarteRfidByIdentifiantUnique(identifiantUnique: string) {
    const carte = await this.carteRfidRepository.findOne({
      where: { identifiantUnique },
      relations: { client: true },
    });
    if (!carte) {
      throw new NotFoundException('Carte RFID introuvable');
    }
    return carte;
  }

  async updateProfile(id: string, dto: UpdateProfileDto) {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    Object.assign(user, dto);
    return this.personneRepository.save(user);
  }

  async updatePhoto(id: string, photoUrl: string) {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    user.photoUrl = photoUrl;
    return this.personneRepository.save(user);
  }

  createClient(data: Partial<Client>) {
    return this.clientRepository.create(data);
  }

  save<T extends Personne>(user: T) {
    return this.personneRepository.save(user);
  }

  async findByIdOrFail(id: string) {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    return user;
  }

  async createCarteRfid(input: CreateCarteRfidInput): Promise<CarteRFID> {
    const client = await this.findClientById(input.clientId);
    if (!client) throw new NotFoundException('Client introuvable');
    const identifiantUnique = input.identifiantUnique ||
      `RFID_${randomBytes(4).toString('hex').toUpperCase()}`;
    const carte = this.carteRfidRepository.create({
      identifiantUnique,
      clientId: input.clientId,
      statut: StatutCarteRFID.ACTIVE,
    });
    return this.carteRfidRepository.save(carte);
  }

  async findCarteRfidById(id: string): Promise<CarteRFID> {
    const carte = await this.carteRfidRepository.findOne({
      where: { id },
      relations: { client: true },
    });
    if (!carte) throw new NotFoundException('Carte RFID introuvable');
    return carte;
  }

  findCarteRfidByClientId(clientId: string): Promise<CarteRFID[]> {
    return this.carteRfidRepository.find({
      where: { clientId },
      relations: { client: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findCarteRfidAll(clientIdFilter?: string): Promise<CarteRFID[]> {
    const query = this.carteRfidRepository.createQueryBuilder('carte');
    if (clientIdFilter) query.where('carte.clientId = :clientId', { clientId: clientIdFilter });
    return query.leftJoinAndSelect('carte.client', 'client')
      .orderBy('carte.createdAt', 'DESC').getMany();
  }

  async updateCarteRfidStatut(id: string, statut: StatutCarteRFID): Promise<CarteRFID> {
    const carte = await this.findCarteRfidById(id);
    carte.statut = statut;
    return this.carteRfidRepository.save(carte);
  }

  async activerCarteRfid(id: string): Promise<CarteRFID> {
    const carte = await this.findCarteRfidById(id);
    carte.statut = StatutCarteRFID.ACTIVE;
    carte.dateActivation = new Date();
    return this.carteRfidRepository.save(carte);
  }

  async associerCarteRfidAuClient(id: string, clientId: string): Promise<CarteRFID> {
    const client = await this.findClientById(clientId);
    if (!client) throw new NotFoundException('Client introuvable');
    const carte = await this.findCarteRfidById(id);
    carte.clientId = clientId;
    carte.client = client;
    return this.carteRfidRepository.save(carte);
  }
}
