import { Body, Controller, Post, UseInterceptors } from '@nestjs/common';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Public } from '../../common/decorators/public.decorator';

@Controller('auth')
@ApiTags('Auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Public()
  @ApiOperation({ summary: 'Créer un compte client et retourner un JWT' })
  @ApiResponse({ status: 201, description: 'Compte créé' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 409, description: 'Email déjà utilisé' })
  // 3 inscriptions par minute et par client pour limiter les créations automatisées.
  @Throttle({ default: { limit: 3, ttl: 60 } })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @Public()
  @ApiOperation({ summary: 'Authentifier un utilisateur' })
  @ApiResponse({ status: 201, description: 'Authentification réussie' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 401, description: 'Identifiants invalides' })
  // 5 tentatives par minute et par client pour réduire le risque de brute-force.
  @Throttle({ default: { limit: 5, ttl: 60 } })
  async login(@Body() dto: LoginDto) {
    const user = await this.authService.validateUser(dto.email, dto.motDePasse);
    return this.authService.login(user);
  }
}
