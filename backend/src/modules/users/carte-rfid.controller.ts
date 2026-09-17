import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../../common/enums/role.enum';
import { UsersService } from './users.service';
import { CreateCarteRfidDto } from './dto/create-carte-rfid.dto';
import { AssocierCarteDto } from './dto/associer-carte.dto';
import { StatutCarteRFID } from './entities/carte-rfid.entity';

interface AuthenticatedUser {
  sub: string;
  role?: Role;
}

@Controller('cartes-rfid')
@ApiTags('Carte RFID')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CarteRfidController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une carte RFID' })
  @ApiResponse({ status: 201, description: 'Carte créée' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 403, description: 'Carte d’un autre client' })
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateCarteRfidDto,
  ) {
    // Les clients créent leurs propres cartes, les admins créent pour n'importe quel client
    const clientId = dto.clientId || user.sub;

    if (
      clientId !== user.sub &&
      user.role !== Role.ADMINISTRATEUR
    ) {
      throw new ForbiddenException(
        'Un client ne peut créer que ses propres cartes',
      );
    }

    return this.usersService.createCarteRfid({
      clientId,
      identifiantUnique: dto.identifiantUnique,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Lister les cartes RFID accessibles' })
  @ApiResponse({ status: 200, description: 'Cartes RFID' })
  async findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query('clientId') clientIdFilter?: string,
  ) {
    // Admin voit tout, client voit ses cartes
    if (user.role === Role.ADMINISTRATEUR) {
      const clientId = clientIdFilter || undefined;
      return this.usersService.findCarteRfidAll(clientId);
    }

    return this.usersService.findCarteRfidByClientId(user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consulter une carte RFID' })
  @ApiResponse({ status: 200, description: 'Carte RFID' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  @ApiResponse({ status: 404, description: 'Carte introuvable' })
  async findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    const carte = await this.usersService.findCarteRfidById(id);

    // Vérifier l'ownership ou admin
    if (
      carte.clientId !== user.sub &&
      user.role !== Role.ADMINISTRATEUR
    ) {
      throw new ForbiddenException(
        'Accès refusé : cette carte ne vous appartient pas',
      );
    }

    return carte;
  }

  @Patch(':id/bloquer')
  @ApiOperation({ summary: 'Bloquer une carte RFID' })
  @ApiResponse({ status: 200, description: 'Carte bloquée' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  async bloquer(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    const carte = await this.usersService.findCarteRfidById(id);

    // Client peut bloquer sa propre carte, ou admin peut bloquer n'importe quelle carte
    if (
      carte.clientId !== user.sub &&
      user.role !== Role.ADMINISTRATEUR
    ) {
      throw new ForbiddenException(
        'Accès refusé : vous ne pouvez bloquer que vos propres cartes',
      );
    }

    return this.usersService.updateCarteRfidStatut(id, StatutCarteRFID.BLOQUEE);
  }

  @Patch(':id/activer')
  @Roles(Role.ADMINISTRATEUR)
  @ApiOperation({ summary: 'Activer une carte RFID' })
  @ApiResponse({ status: 200, description: 'Carte activée' })
  @ApiResponse({ status: 403, description: 'Réservé aux administrateurs' })
  async activer(@Param('id') id: string) {
    return this.usersService.activerCarteRfid(id);
  }

  @Patch(':id/associer')
  @Roles(Role.ADMINISTRATEUR)
  @ApiOperation({ summary: 'Associer une carte à un client' })
  @ApiResponse({ status: 200, description: 'Carte associée' })
  @ApiResponse({ status: 400, description: 'Client invalide' })
  async associer(
    @Param('id') id: string,
    @Body() dto: AssocierCarteDto,
  ) {
    return this.usersService.associerCarteRfidAuClient(id, dto.clientId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Désactiver une carte RFID' })
  @ApiResponse({ status: 200, description: 'Carte désactivée' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  async delete(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    const carte = await this.usersService.findCarteRfidById(id);

    // Admin peut supprimer n'importe quelle carte, client peut supprimer ses propres cartes
    if (
      carte.clientId !== user.sub &&
      user.role !== Role.ADMINISTRATEUR
    ) {
      throw new ForbiddenException(
        'Accès refusé : vous ne pouvez supprimer que vos propres cartes',
      );
    }

    return this.usersService.updateCarteRfidStatut(id, StatutCarteRFID.DESACTIVEE);
  }
}
