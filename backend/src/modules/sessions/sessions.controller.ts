import { Body, ConflictException, Controller, Get, NotFoundException, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Role } from '../../common/enums/role.enum';
import { StartSessionQrDto } from './dto/start-session-qr.dto';
import { SessionsService } from './sessions.service';

interface AuthenticatedUser {
  sub: string;
  role: Role;
}

@ApiTags('Sessions')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post('start-qr')
  @ApiOperation({ summary: 'Démarrer une session via QR code' })
  @ApiResponse({ status: 201, description: 'Session démarrée' })
  @ApiResponse({ status: 400, description: 'QR code invalide' })
  @ApiResponse({ status: 404, description: 'Borne introuvable' })
  startQr(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: StartSessionQrDto,
  ) {
    return this.sessionsService.startQrSession(user.sub, dto);
  }

  @Post(':id/stop')
  @ApiOperation({ summary: 'Arrêter une session de recharge' })
  @ApiResponse({ status: 200, description: 'Commande d’arrêt envoyée à la borne' })
  @ApiResponse({ status: 409, description: 'Session déjà terminée ou borne hors ligne' })
  stop(@CurrentUser() user: AuthenticatedUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.sessionsService.requestStop(id, user.role === Role.ADMINISTRATEUR ? undefined : user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'Lister les sessions de recharge' })
  @ApiResponse({ status: 200, description: 'Sessions de recharge' })
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.sessionsService.findAll(
      user.role === Role.ADMINISTRATEUR ? undefined : user.sub,
    );
  }

  @Get(':id/status')
  @ApiOperation({ summary: 'Consulter le statut courant d’une session' })
  @ApiResponse({ status: 200, description: 'Statut de session' })
  @ApiResponse({ status: 404, description: 'Session introuvable' })
  getStatus(@CurrentUser() user: AuthenticatedUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.sessionsService.getStatus(
      id,
      user.role === Role.ADMINISTRATEUR ? undefined : user.sub,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consulter le détail d’une session' })
  @ApiResponse({ status: 200, description: 'Détail de session' })
  @ApiResponse({ status: 404, description: 'Session introuvable' })
  async findOne(@CurrentUser() user: AuthenticatedUser, @Param('id', ParseUUIDPipe) id: string) {
    const session = await this.sessionsService.findById(id);
    if (!session || (user.role !== Role.ADMINISTRATEUR && session.clientId !== user.sub)) {
      throw new NotFoundException('Session de recharge introuvable');
    }
    return session;
  }
}
