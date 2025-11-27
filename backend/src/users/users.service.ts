import { Injectable, ConflictException, NotFoundException, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    return this.prisma.user.create({
      data: createUserDto,
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        credits: true,
        createdAt: true,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        credits: true,
        createdAt: true,
      },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findByUsername(username: string) {
    return this.prisma.user.findUnique({
      where: { username },
    });
  }

  async updateCredits(id: string, credits: number) {
    return this.prisma.user.update({
      where: { id },
      data: { credits },
    });
  }

  async findMyTransactions(userId: string) {
    return this.prisma.creditTransaction.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId },
        ],
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        receiver: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    // Vérifier que l'utilisateur existe
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    if (updateProfileDto.email && updateProfileDto.email !== user.email) {
      const existingUser = await this.findByEmail(updateProfileDto.email);
      if (existingUser) {
        throw new ConflictException('Cet email est déjà utilisé par un autre compte');
      }
    }

    // Vérifier si le username est déjà utilisé par un autre utilisateur
    if (updateProfileDto.username && updateProfileDto.username !== user.username) {
      const existingUser = await this.findByUsername(updateProfileDto.username);
      if (existingUser) {
        throw new ConflictException('Ce nom d\'utilisateur est déjà pris');
      }
    }

    // Préparer les données de mise à jour
    const updateData: any = {};

    if (updateProfileDto.email) {
      updateData.email = updateProfileDto.email;
    }

    if (updateProfileDto.username) {
      updateData.username = updateProfileDto.username;
    }

    // Hasher le nouveau mot de passe si fourni
    if (updateProfileDto.password) {
      const saltRounds = 12;
      updateData.password = await bcrypt.hash(updateProfileDto.password, saltRounds);
    }

    // Mettre à jour l'utilisateur
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        username: true,
        credits: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    this.logger.log(`Profil mis à jour pour l'utilisateur: ${updatedUser.username} (${updatedUser.email})`);

    return updatedUser;
  }
}
