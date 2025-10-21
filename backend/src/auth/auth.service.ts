import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, username, password } = registerDto;

    // Vérifier si l'email existe déjà
    const existingUserByEmail = await this.usersService.findByEmail(email);
    if (existingUserByEmail) {
      throw new ConflictException('Un utilisateur avec cet email existe déjà');
    }

    // Vérifier si le username existe déjà
    const existingUserByUsername = await this.usersService.findByUsername(username);
    if (existingUserByUsername) {
      throw new ConflictException('Ce nom d\'utilisateur est déjà pris');
    }

    // Hasher le mot de passe avec bcrypt (plus sécurisé que SHA-256)
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Créer l'utilisateur
    const user = await this.usersService.create({
      email,
      username,
      password: hashedPassword,
    });

    // Générer le token JWT - J'ai découvert que c'est super pratique !
    const token = this.generateToken(user.id, user.email);

    // Logger l'inscription réussie
    this.logger.log(`Nouvel utilisateur inscrit: ${email} (${username})`);

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        credits: user.credits,
      },
      token,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Trouver l'utilisateur par email
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    // Vérifier le mot de passe avec bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      // Logger la tentative de connexion échouée
      this.logger.warn(`Tentative de connexion échouée pour l'email: ${email}`);
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    // Générer le token JWT
    const token = this.generateToken(user.id, user.email);

    // Logger la connexion réussie
    this.logger.log(`Connexion réussie pour l'utilisateur: ${user.username} (${email})`);

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        credits: user.credits,
      },
      token,
    };
  }

  private generateToken(userId: string, email: string): string {
    const payload = { sub: userId, email };
    return this.jwtService.sign(payload);
  }
}
