import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { readFile } from 'node:fs/promises';
import { join, basename } from 'node:path';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Role } from '../../common/enums/role.enum';
import { CreateBorneDto } from './dto/create-borne.dto';
import { UpdateBorneDto } from './dto/update-borne.dto';
import { UpdateStatutBorneDto } from './dto/update-statut-borne.dto';
import { BornesService } from './bornes.service';
import { StatutBorne } from './enums/statut-borne.enum';

@Controller('bornes')
@ApiTags('Bornes')
@ApiBearerAuth('JWT-auth')
export class BornesController {
  constructor(private readonly bornesService: BornesService) {}

  @Post()
  @Roles(Role.ADMINISTRATEUR)
  @ApiOperation({ summary: 'Créer une borne de recharge' })
  @ApiResponse({ status: 201, description: 'Borne créée' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  create(@Body() dto: CreateBorneDto) {
    return this.bornesService.create(dto);
  }

  @Patch(':id/statut')
  @Roles(Role.ADMINISTRATEUR)
  @ApiOperation({ summary: 'Modifier le statut d’une borne' })
  @ApiResponse({ status: 200, description: 'Statut mis à jour' })
  @ApiResponse({ status: 404, description: 'Borne introuvable' })
  updateStatut(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateStatutBorneDto,
  ) {
    return this.bornesService.updateStatut(id, dto);
  }

  @Get('status')
  @Roles(Role.ADMINISTRATEUR)
  @ApiOperation({ summary: 'Obtenir la synthèse des statuts des bornes' })
  @ApiResponse({ status: 200, description: 'Synthèse des statuts' })
  getStatusOverview() {
    return this.bornesService.getStatusOverview();
  }

  @Get(':id/qrcode')
  @ApiOperation({ summary: 'Télécharger le QR code d’une borne' })
  @ApiResponse({ status: 200, description: 'Image PNG du QR code' })
  @ApiResponse({ status: 404, description: 'QR code introuvable' })
  async getQrCode(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Res() response: Response,
  ) {
    const borne = await this.bornesService.findOne(id);
    if (!borne.qrCodeUrl) {
      throw new NotFoundException('QR code introuvable pour cette borne');
    }

    const filePath = join(
      process.cwd(),
      'uploads',
      'qrcodes',
      basename(borne.qrCodeUrl),
    );
    try {
      const image = await readFile(filePath);
      response.type('png').send(image);
    } catch {
      throw new NotFoundException('Fichier QR code introuvable');
    }
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Lister les bornes' })
  @ApiResponse({ status: 200, description: 'Bornes accessibles' })
  findAll(
    @Query('siteId') siteId?: string,
    @Query('statut') statut?: string,
  ) {
    return this.bornesService.findAll(siteId, statut as StatutBorne);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Consulter une borne' })
  @ApiResponse({ status: 200, description: 'Borne trouvée' })
  @ApiResponse({ status: 404, description: 'Borne introuvable' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.bornesService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMINISTRATEUR)
  @ApiOperation({ summary: 'Modifier une borne' })
  @ApiResponse({ status: 200, description: 'Borne mise à jour' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateBorneDto,
  ) {
    return this.bornesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMINISTRATEUR)
  @ApiOperation({ summary: 'Supprimer une borne' })
  @ApiResponse({ status: 204, description: 'Borne supprimée' })
  @ApiResponse({ status: 404, description: 'Borne introuvable' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.bornesService.remove(id);
  }
}
