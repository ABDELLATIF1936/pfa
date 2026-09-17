import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateNiveauFideliteDto } from './dto/create-niveau-fidelite.dto';
import { CreateRecompenseDto } from './dto/create-recompense.dto';
import { EchangerPointsDto } from './dto/echanger-points.dto';
import { UpdateNiveauFideliteDto } from './dto/update-niveau-fidelite.dto';
import { UpdateRecompenseDto } from './dto/update-recompense.dto';
import { FideliteService } from './fidelite.service';

interface AuthenticatedUser {
  sub: string;
}

@ApiTags('Fidelite')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('fidelite')
export class FideliteController {
  constructor(private readonly fideliteService: FideliteService) {}

  @Get('mon-compte')
  @ApiOperation({ summary: 'Consultation du compte fidélité du client connecté' })
  @ApiResponse({ status: 200, description: 'Compte fidélité du client' })
  @ApiResponse({ status: 401, description: 'Authentification requise' })
  async monCompte(@CurrentUser() user: AuthenticatedUser) {
    return this.fideliteService.getMonCompte(user.sub);
  }

  @Get('historique')
  @ApiOperation({ summary: 'Historique des points du client connecté' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Historique paginé des points' })
  @ApiResponse({ status: 401, description: 'Authentification requise' })
  async historique(
    @CurrentUser() user: AuthenticatedUser,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.fideliteService.getHistorique(user.sub, Number(page), Number(limit));
  }

  @Post('echanger')
  @ApiOperation({ summary: 'Échanger des points contre une récompense' })
  @ApiResponse({ status: 201, description: 'Points échangés' })
  @ApiResponse({ status: 400, description: 'Points insuffisants ou données invalides' })
  @ApiResponse({ status: 404, description: 'Récompense introuvable' })
  async echanger(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: EchangerPointsDto,
  ) {
    const { compteFidelite, recompense } = await this.fideliteService.echangerPoints(
      user.sub,
      dto.recompenseId,
    );

    return {
      nouveauSolde: compteFidelite.points,
      recompense: {
        id: recompense.id,
        nom: recompense.nom,
        coutPoints: recompense.coutPoints,
        description: recompense.description,
      },
    };
  }

  @Get('niveaux-fidelite')
  @ApiOperation({ summary: 'Lister les niveaux de fidélité' })
  @ApiResponse({ status: 200, description: 'Niveaux de fidélité' })
  findAllNiveaux() {
    return this.fideliteService.findAllNiveaux();
  }

  @Post('niveaux-fidelite')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMINISTRATEUR)
  @ApiOperation({ summary: 'Créer un niveau de fidélité' })
  @ApiResponse({ status: 201, description: 'Niveau créé' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 403, description: 'Accès administrateur requis' })
  createNiveau(@Body() dto: CreateNiveauFideliteDto) {
    return this.fideliteService.createNiveau(dto);
  }

  @Get('niveaux-fidelite/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMINISTRATEUR)
  @ApiOperation({ summary: 'Consulter un niveau de fidélité' })
  @ApiResponse({ status: 200, description: 'Niveau trouvé' })
  @ApiResponse({ status: 404, description: 'Niveau introuvable' })
  findOneNiveau(@Param('id', ParseUUIDPipe) id: string) {
    return this.fideliteService.findOneNiveau(id);
  }

  @Patch('niveaux-fidelite/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMINISTRATEUR)
  @ApiOperation({ summary: 'Mettre à jour un niveau de fidélité' })
  @ApiResponse({ status: 200, description: 'Niveau mis à jour' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 404, description: 'Niveau introuvable' })
  updateNiveau(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateNiveauFideliteDto,
  ) {
    return this.fideliteService.updateNiveau(id, dto);
  }

  @Delete('niveaux-fidelite/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMINISTRATEUR)
  @ApiOperation({ summary: 'Supprimer un niveau de fidélité' })
  @ApiResponse({ status: 200, description: 'Niveau supprimé' })
  @ApiResponse({ status: 404, description: 'Niveau introuvable' })
  removeNiveau(@Param('id', ParseUUIDPipe) id: string) {
    return this.fideliteService.removeNiveau(id);
  }

  @Get('recompenses')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMINISTRATEUR)
  @ApiOperation({ summary: 'Lister les récompenses' })
  @ApiResponse({ status: 200, description: 'Récompenses' })
  @ApiResponse({ status: 403, description: 'Accès administrateur requis' })
  findAllRecompenses() {
    return this.fideliteService.findAllRecompenses();
  }

  @Post('recompenses')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMINISTRATEUR)
  @ApiOperation({ summary: 'Créer une récompense' })
  @ApiResponse({ status: 201, description: 'Récompense créée' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 403, description: 'Accès administrateur requis' })
  createRecompense(@Body() dto: CreateRecompenseDto) {
    return this.fideliteService.createRecompense(dto);
  }

  @Get('recompenses/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMINISTRATEUR)
  @ApiOperation({ summary: 'Consulter une récompense' })
  @ApiResponse({ status: 200, description: 'Récompense trouvée' })
  @ApiResponse({ status: 404, description: 'Récompense introuvable' })
  findOneRecompense(@Param('id', ParseUUIDPipe) id: string) {
    return this.fideliteService.findOneRecompense(id);
  }

  @Patch('recompenses/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMINISTRATEUR)
  @ApiOperation({ summary: 'Mettre à jour une récompense' })
  @ApiResponse({ status: 200, description: 'Récompense mise à jour' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 404, description: 'Récompense introuvable' })
  updateRecompense(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRecompenseDto,
  ) {
    return this.fideliteService.updateRecompense(id, dto);
  }

  @Delete('recompenses/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMINISTRATEUR)
  @ApiOperation({ summary: 'Désactiver une récompense' })
  @ApiResponse({ status: 200, description: 'Récompense désactivée' })
  @ApiResponse({ status: 404, description: 'Récompense introuvable' })
  removeRecompense(@Param('id', ParseUUIDPipe) id: string) {
    return this.fideliteService.removeRecompense(id);
  }
}
