import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            findByUsername: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      // Arrange
      const registerDto = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
      };

      const mockUser = {
        id: 'user1',
        email: 'test@example.com',
        username: 'testuser',
        credits: 100,
        password: 'hashedpassword',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockToken = 'jwt-token';

      (usersService.findByEmail as jest.Mock).mockResolvedValue(null);
      (usersService.findByUsername as jest.Mock).mockResolvedValue(null);
      (usersService.create as jest.Mock).mockResolvedValue(mockUser);
      (jwtService.sign as jest.Mock).mockReturnValue(mockToken);

      // Act
      const result = await service.register(registerDto);

      // Assert
      expect(result.user).toEqual({
        id: 'user1',
        email: 'test@example.com',
        username: 'testuser',
        credits: 100,
      });
      expect(result.token).toBe(mockToken);
      expect(usersService.create).toHaveBeenCalledWith({
        email: 'test@example.com',
        username: 'testuser',
        password: expect.any(String), // Hashed password
      });
    });

    it('should throw ConflictException when email already exists', async () => {
      // Arrange
      const registerDto = {
        email: 'existing@example.com',
        username: 'testuser',
        password: 'password123',
      };

      (usersService.findByEmail as jest.Mock).mockResolvedValue({ id: 'existing' });

      // Act & Assert
      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException when username already exists', async () => {
      // Arrange
      const registerDto = {
        email: 'test@example.com',
        username: 'existinguser',
        password: 'password123',
      };

      (usersService.findByEmail as jest.Mock).mockResolvedValue(null);
      (usersService.findByUsername as jest.Mock).mockResolvedValue({ id: 'existing' });

      // Act & Assert
      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should login successfully with correct credentials', async () => {
      // Arrange
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const hashedPassword = crypto.createHash('sha256').update('password123').digest('hex');
      const mockUser = {
        id: 'user1',
        email: 'test@example.com',
        username: 'testuser',
        credits: 100,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockToken = 'jwt-token';

      (usersService.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (jwtService.sign as jest.Mock).mockReturnValue(mockToken);

      // Act
      const result = await service.login(loginDto);

      // Assert
      expect(result.user).toEqual({
        id: 'user1',
        email: 'test@example.com',
        username: 'testuser',
        credits: 100,
      });
      expect(result.token).toBe(mockToken);
    });

    it('should throw UnauthorizedException when user not found', async () => {
      // Arrange
      const loginDto = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      (usersService.findByEmail as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when password is incorrect', async () => {
      // Arrange
      const loginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const hashedPassword = crypto.createHash('sha256').update('password123').digest('hex');
      const mockUser = {
        id: 'user1',
        email: 'test@example.com',
        username: 'testuser',
        credits: 100,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (usersService.findByEmail as jest.Mock).mockResolvedValue(mockUser);

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });
});
