import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Role } from '../../common/enums/role.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateGrilleTarifaireDto } from './dto/create-grille-tarifaire.dto';
import { UpdateGrilleTarifaireDto } from './dto/update-grille-tarifaire.dto';
import { TarificationService } from './tarification.service';

@ApiTags('GrillesTarifaires')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMINISTRATEUR)
@Controller('grilles-tarifaires')
export class TarificationController {
  constructor(private readonly tarificationService: TarificationService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une grille tarifaire' })
  @ApiResponse({ status: 201, description: 'Grille tarifaire créée' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 401, description: 'Authentification requise' })
  @ApiResponse({ status: 403, description: 'Accès administrateur requis' })
  create(@Body() dto: CreateGrilleTarifaireDto) {
    return this.tarificationService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lister les grilles tarifaires' })
  @ApiResponse({ status: 200, description: 'Grilles tarifaires' })
  @ApiResponse({ status: 401, description: 'Authentification requise' })
  @ApiResponse({ status: 403, description: 'Accès administrateur requis' })
  findAll() {
    return this.tarificationService.findAll();
  }

  @Get('actuelle')
  @Public()
  @ApiOperation({ summary: 'Obtenir la grille tarifaire actuelle' })
  @ApiResponse({ status: 200, description: 'Grille tarifaire actuelle' })
  @ApiResponse({ status: 404, description: 'Grille tarifaire introuvable' })
  getCurrent() {
    return this.tarificationService.getCurrent();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir une grille tarifaire' })
  @ApiResponse({ status: 200, description: 'Grille tarifaire trouvée' })
  @ApiResponse({ status: 404, description: 'Grille tarifaire introuvable' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.tarificationService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modifier une grille tarifaire' })
  @ApiResponse({ status: 200, description: 'Grille tarifaire mise à jour' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 404, description: 'Grille tarifaire introuvable' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateGrilleTarifaireDto,
  ) {
    return this.tarificationService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Désactiver une grille tarifaire' })
  @ApiResponse({ status: 200, description: 'Grille tarifaire désactivée' })
  @ApiResponse({ status: 404, description: 'Grille tarifaire introuvable' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.tarificationService.remove(id);
  }
}
