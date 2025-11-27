import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
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

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;

    // Trouver l'utilisateur par email
    const user = await this.usersService.findByEmail(email);
    
    // Pour la sécurité, on ne révèle pas si l'email existe ou non
    if (!user) {
      this.logger.warn(`Tentative de réinitialisation pour email inexistant: ${email}`);
      // Retourner un succès même si l'email n'existe pas (sécurité)
      return {
        message: 'Si cet email existe, un lien de réinitialisation a été envoyé',
      };
    }

    // Générer un token sécurisé
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Expire dans 1 heure

    // Supprimer les anciens tokens non utilisés pour cet utilisateur
    await this.prisma.passwordResetToken.deleteMany({
      where: {
        userId: user.id,
        used: false,
        expiresAt: { lt: new Date() },
      },
    });

    // Créer le nouveau token
    await this.prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    });

    // TODO: Envoyer l'email avec le lien de réinitialisation
    // Pour l'instant, on log le token (à remplacer par un vrai service email)
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/reset-password?token=${token}`;
    this.logger.log(`Token de réinitialisation généré pour ${email}: ${resetLink}`);
    
    // En production, envoyer l'email ici
    // await this.emailService.sendPasswordResetEmail(user.email, resetLink);

    return {
      message: 'Si cet email existe, un lien de réinitialisation a été envoyé',
      // En développement seulement - à retirer en production
      ...(process.env.NODE_ENV === 'development' && { resetLink }),
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, newPassword } = resetPasswordDto;

    // Trouver le token
    const resetToken = await this.prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetToken) {
      throw new BadRequestException('Token de réinitialisation invalide');
    }

    // Vérifier si le token a été utilisé
    if (resetToken.used) {
      throw new BadRequestException('Ce token a déjà été utilisé');
    }

    // Vérifier si le token a expiré
    if (resetToken.expiresAt < new Date()) {
      throw new BadRequestException('Ce token a expiré. Veuillez demander un nouveau lien');
    }

    // Hasher le nouveau mot de passe
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Mettre à jour le mot de passe et marquer le token comme utilisé
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: resetToken.userId },
        data: { password: hashedPassword },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { used: true },
      }),
    ]);

    this.logger.log(`Mot de passe réinitialisé pour l'utilisateur: ${resetToken.user.email}`);

    return {
      message: 'Mot de passe réinitialisé avec succès',
    };
  }

  private generateToken(userId: string, email: string): string {
    const payload = { sub: userId, email };
    return this.jwtService.sign(payload);
  }
}
