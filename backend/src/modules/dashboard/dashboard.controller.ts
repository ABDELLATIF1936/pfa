import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { DashboardQueryDto, TopSitesQueryDto } from './dto/dashboard-query.dto';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMINISTRATEUR)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('bornes-status')
  @ApiOperation({ summary: 'Résumé des statuts des bornes' })
  @ApiResponse({ status: 200, description: 'Statistiques des statuts' })
  @ApiResponse({ status: 401, description: 'Authentification requise' })
  @ApiResponse({ status: 403, description: 'Accès administrateur requis' })
  getBornesStatus() {
    return this.dashboardService.getBornesStatus();
  }

  @Get('sessions-actives')
  @ApiOperation({ summary: 'Sessions de recharge actuellement actives' })
  @ApiResponse({ status: 200, description: 'Sessions actives' })
  @ApiResponse({ status: 401, description: 'Authentification requise' })
  @ApiResponse({ status: 403, description: 'Accès administrateur requis' })
  getSessionsActives() {
    return this.dashboardService.getSessionsActives();
  }

  @Get('alertes')
  @ApiOperation({ summary: 'Bornes en panne ou hors service' })
  @ApiResponse({ status: 200, description: 'Alertes bornes' })
  @ApiResponse({ status: 401, description: 'Authentification requise' })
  @ApiResponse({ status: 403, description: 'Accès administrateur requis' })
  getAlertes() {
    return this.dashboardService.getAlertes();
  }

  @Get('stats/revenue')
  @ApiOperation({ summary: 'Statistiques de revenu' })
  @ApiQuery({ name: 'dateDebut', required: false, type: String, format: 'date-time' })
  @ApiQuery({ name: 'dateFin', required: false, type: String, format: 'date-time' })
  @ApiQuery({ name: 'siteId', required: false, type: String, format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Statistiques de revenu' })
  @ApiResponse({ status: 400, description: 'Paramètres invalides' })
  @ApiResponse({ status: 403, description: 'Accès administrateur requis' })
  getRevenue(@Query() query: DashboardQueryDto) {
    return this.dashboardService.getRevenue(query);
  }

  @Get('stats/sessions')
  @ApiOperation({ summary: 'Statistiques des sessions de recharge' })
  @ApiQuery({ name: 'dateDebut', required: false, type: String, format: 'date-time' })
  @ApiQuery({ name: 'dateFin', required: false, type: String, format: 'date-time' })
  @ApiQuery({ name: 'siteId', required: false, type: String, format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Statistiques des sessions' })
  @ApiResponse({ status: 400, description: 'Paramètres invalides' })
  @ApiResponse({ status: 403, description: 'Accès administrateur requis' })
  getSessionsStats(@Query() query: DashboardQueryDto) {
    return this.dashboardService.getSessionsStats(query);
  }

  @Get('stats/top-sites')
  @ApiOperation({ summary: 'Sites les plus performants par revenu' })
  @ApiQuery({ name: 'dateDebut', required: false, type: String, format: 'date-time' })
  @ApiQuery({ name: 'dateFin', required: false, type: String, format: 'date-time' })
  @ApiQuery({ name: 'limit', required: false, type: Number, default: 5, minimum: 1, maximum: 100 })
  @ApiResponse({ status: 200, description: 'Classement des sites' })
  @ApiResponse({ status: 400, description: 'Paramètres invalides' })
  @ApiResponse({ status: 403, description: 'Accès administrateur requis' })
  getTopSites(@Query() query: TopSitesQueryDto) {
    return this.dashboardService.getTopSites(query);
  }
}
