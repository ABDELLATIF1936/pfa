import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Administrateur } from '../users/entities/administrateur.entity';
import { Personne } from '../users/entities/personne.entity';
import { comparePassword, hashPassword } from '../../common/utils/hash.util';
import { RegisterDto } from './dto/register.dto';
import { UsersService } from '../users/users.service';

type UserRole = 'administrateur' | 'client';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(dto.email);

    if (existingUser) {
      throw new ConflictException('Cette adresse email est déjà utilisée');
    }

    const client = this.usersService.createClient({
      ...dto,
      motDePasse: await hashPassword(dto.motDePasse),
    });

    const savedClient = await this.usersService.save(client);
    return this.login(savedClient);
  }

  async validateUser(email: string, motDePasse: string): Promise<Personne> {
    const user = await this.usersService.findByEmail(email);

    // Même message pour un email inconnu ou un mot de passe incorrect.
    if (!user || !(await comparePassword(motDePasse, user.motDePasse))) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    return user;
  }

  async login(user: Personne) {
    const role = this.getRole(user);
    const payload = { sub: user.id, email: user.email, role };
    const accessToken = await this.jwtService.signAsync(payload);

    return {
      access_token: accessToken,
      user,
    };
  }

  private getRole(user: Personne): UserRole {
    return user instanceof Administrateur ? 'administrateur' : 'client';
  }
}
