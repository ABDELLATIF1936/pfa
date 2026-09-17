import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Express } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { profilePhotoMulterOptions } from './config/multer.config';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UsersService } from './users.service';

interface AuthenticatedUser {
  sub: string;
}

@Controller('users')
@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Consulter le profil connecté' })
  @ApiResponse({ status: 200, description: 'Profil utilisateur' })
  @ApiResponse({ status: 401, description: 'Authentification requise' })
  getMe(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.findByIdOrFail(user.sub);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Modifier le profil connecté' })
  @ApiResponse({ status: 200, description: 'Profil mis à jour' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  updateMe(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateProfileDto,
  ) {
    // ValidationPipe rejette les champs non déclarés, notamment email et motDePasse.
    return this.usersService.updateProfile(user.sub, dto);
  }

  @Post('me/photo')
  @ApiOperation({ summary: 'Téléverser la photo de profil' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Photo enregistrée' })
  @ApiResponse({ status: 400, description: 'Photo manquante ou invalide' })
  @UseInterceptors(FileInterceptor('photo', profilePhotoMulterOptions))
  async uploadPhoto(
    @CurrentUser() user: AuthenticatedUser,
    @UploadedFile() photo: Express.Multer.File,
  ) {
    if (!photo) {
      throw new BadRequestException('Une photo est obligatoire');
    }

    const photoUrl = `/uploads/profile-photos/${photo.filename}`;
    return this.usersService.updatePhoto(user.sub, photoUrl);
  }
}
