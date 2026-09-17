import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Role } from '../../common/enums/role.enum';
import { CreateSiteDto } from './dto/create-site.dto';
import { UpdateSiteDto } from './dto/update-site.dto';
import { SitesService } from './sites.service';

@Controller('sites')
@ApiTags('Sites')
@ApiBearerAuth('JWT-auth')
export class SitesController {
  constructor(private readonly sitesService: SitesService) {}

  // Les clients doivent consulter les sites disponibles, mais seuls les admins les administrent.
  @Post()
  @Roles(Role.ADMINISTRATEUR)
  @ApiOperation({ summary: 'Créer un site de recharge' })
  @ApiResponse({ status: 201, description: 'Site créé' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  create(@Body() dto: CreateSiteDto) {
    return this.sitesService.create(dto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Lister les sites de recharge' })
  @ApiResponse({ status: 200, description: 'Sites disponibles' })
  findAll(@Query('ville') ville?: string) {
    return this.sitesService.findAll(ville);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Consulter un site' })
  @ApiResponse({ status: 200, description: 'Site trouvé' })
  @ApiResponse({ status: 404, description: 'Site introuvable' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.sitesService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMINISTRATEUR)
  @ApiOperation({ summary: 'Modifier un site' })
  @ApiResponse({ status: 200, description: 'Site mis à jour' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateSiteDto,
  ) {
    return this.sitesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMINISTRATEUR)
  @ApiOperation({ summary: 'Supprimer un site' })
  @ApiResponse({ status: 204, description: 'Site supprimé' })
  @ApiResponse({ status: 404, description: 'Site introuvable' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.sitesService.remove(id);
  }
}
