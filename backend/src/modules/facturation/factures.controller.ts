import {
  Controller,
  ForbiddenException,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiProduces, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '../../common/enums/role.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FacturePdfService } from './facture-pdf.service';
import { FacturationService } from './facturation.service';

interface AuthenticatedUser {
  sub: string;
  role: Role;
}

@ApiTags('Factures')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('factures')
export class FacturesController {
  constructor(
    private readonly facturationService: FacturationService,
    private readonly facturePdfService: FacturePdfService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Lister les factures' })
  @ApiResponse({ status: 200, description: 'Factures accessibles avec pagination' })
  @ApiResponse({ status: 401, description: 'Authentification requise' })
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query('clientId') clientId?: string,
    @Query('dateDebut') dateDebut?: string,
    @Query('dateFin') dateFin?: string,
    @Query('siteId') siteId?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    const requestedClientId = user.role === Role.ADMINISTRATEUR ? clientId : user.sub;
    return this.facturationService.findAll(
      requestedClientId,
      Number(page),
      Number(limit),
      { dateDebut, dateFin, siteId },
    );
  }

  @Get(':id/pdf')
  @ApiOperation({ summary: 'Télécharger une facture PDF' })
  @ApiProduces('application/pdf')
  @ApiResponse({ status: 200, description: 'Fichier PDF de la facture' })
  @ApiResponse({ status: 403, description: 'Accès refusé à cette facture' })
  @ApiResponse({ status: 404, description: 'Facture introuvable' })
  async pdf(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Res() response: Response,
  ) {
    const facture = await this.facturationService.findOne(id);
    if (user.role !== Role.ADMINISTRATEUR && facture.session?.clientId !== user.sub) {
      throw new ForbiddenException('Accès refusé à cette facture');
    }

    const pdf = await this.facturePdfService.genererPdf(facture);
    response.set({
      'Content-Type': 'application/pdf',
      'Content-Length': String(pdf.length),
      'Content-Disposition': `attachment; filename="facture-${facture.numero}.pdf"`,
    });
    response.send(pdf);
  }
}
