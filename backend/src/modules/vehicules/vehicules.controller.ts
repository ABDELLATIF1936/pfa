import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '../../common/enums/role.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateVehiculeDto } from './dto/create-vehicule.dto';
import { UpdateVehiculeDto } from './dto/update-vehicule.dto';
import { VehiculesService } from './vehicules.service';

interface AuthenticatedUser { sub: string; role: Role }

@ApiTags('Vehicules')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('vehicules')
export class VehiculesController {
  constructor(private readonly vehiculesService: VehiculesService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un véhicule' })
  @ApiResponse({ status: 201, description: 'Véhicule créé' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 401, description: 'Authentification requise' })
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateVehiculeDto) {
    return this.vehiculesService.create(user.sub, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lister les véhicules' })
  @ApiResponse({ status: 200, description: 'Véhicules accessibles' })
  @ApiResponse({ status: 401, description: 'Authentification requise' })
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.vehiculesService.findAll(
      user.role === Role.ADMINISTRATEUR ? undefined : user.sub,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consulter un véhicule' })
  @ApiResponse({ status: 200, description: 'Véhicule trouvé' })
  @ApiResponse({ status: 404, description: 'Véhicule introuvable' })
  findOne(@CurrentUser() user: AuthenticatedUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.vehiculesService.findOne(
      id,
      user.role === Role.ADMINISTRATEUR ? undefined : user.sub,
    );
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modifier un véhicule' })
  @ApiResponse({ status: 200, description: 'Véhicule mis à jour' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 404, description: 'Véhicule introuvable' })
  update(@CurrentUser() user: AuthenticatedUser, @Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateVehiculeDto) {
    return this.vehiculesService.update(
      id,
      user.role === Role.ADMINISTRATEUR ? undefined : user.sub,
      dto,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer un véhicule' })
  @ApiResponse({ status: 204, description: 'Véhicule supprimé' })
  @ApiResponse({ status: 404, description: 'Véhicule introuvable' })
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.vehiculesService.remove(
      id,
      user.role === Role.ADMINISTRATEUR ? undefined : user.sub,
    );
  }
}
