import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { AuthService } from './auth.service';
import { User, UserRole } from '../entities/user.entity';
import { UnauthorizedException, ConflictException } from '@nestjs/common';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
  compare: jest.fn().mockResolvedValue(true),
}));

describe('AuthService', () => {
  let service: AuthService;
  let repository: Repository<User>;
  let jwtService: JwtService;

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn().mockResolvedValue('mock-token'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);

    jest.clearAllMocks();
  });

  describe('register', () => {
    const createUserDto = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    };

    it('should throw ConflictException if email already exists', async () => {
      mockUserRepository.findOne.mockResolvedValue({ id: '1', email: 'test@example.com' });

      await expect(service.register(createUserDto)).rejects.toThrow(ConflictException);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
    });

    it('should create a new user successfully', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue({ ...createUserDto, id: '1', password: 'hashed' });
      mockUserRepository.save.mockResolvedValue({ ...createUserDto, id: '1' });

      const result = await service.register(createUserDto);

      expect(mockUserRepository.create).toHaveBeenCalled();
      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('user');
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should throw UnauthorizedException if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user is inactive', async () => {
      mockUserRepository.findOne.mockResolvedValue({ email: 'test@example.com', isActive: false });

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should return token and user on successful login', async () => {
      const user = { id: '1', email: 'test@example.com', password: 'hashed', isActive: true, name: 'Test', role: UserRole.USER };
      mockUserRepository.findOne.mockResolvedValue(user);

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('user');
    });
  });

  describe('validateUser', () => {
    it('should throw UnauthorizedException if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.validateUser('1')).rejects.toThrow(UnauthorizedException);
    });

    it('should return user if found and active', async () => {
      const user = { id: '1', email: 'test@example.com', isActive: true };
      mockUserRepository.findOne.mockResolvedValue(user);

      const result = await service.validateUser('1');

      expect(result).toEqual(user);
    });
  });

  describe('findById', () => {
    it('should return user by id', async () => {
      const user = { id: '1', email: 'test@example.com' };
      mockUserRepository.findOne.mockResolvedValue(user);

      const result = await service.findById('1');

      expect(result).toEqual(user);
    });

    it('should return null if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await service.findById('999');

      expect(result).toBeNull();
    });
  });

  describe('socialLogin', () => {
    const socialDto = {
      email: 'test@example.com',
      name: 'Test User',
      providerId: 'google-123',
      provider: 'google',
    };

    it('should create new user if not exists', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue({ ...socialDto, id: '1', isActive: true });
      mockUserRepository.save.mockResolvedValue({ ...socialDto, id: '1', isActive: true });

      const result = await service.socialLogin(socialDto);

      expect(mockUserRepository.create).toHaveBeenCalled();
      expect(result).toHaveProperty('access_token');
    });

    it('should return existing user if already registered', async () => {
      const existingUser = { id: '1', email: 'test@example.com', isActive: true };
      mockUserRepository.findOne.mockResolvedValue(existingUser);

      const result = await service.socialLogin(socialDto);

      expect(mockUserRepository.create).not.toHaveBeenCalled();
      expect(result).toHaveProperty('access_token');
    });
  });

  describe('updateProfile', () => {
    it('should throw UnauthorizedException if userId is undefined', async () => {
      await expect(service.updateProfile(undefined as any, { name: 'New Name' })).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.updateProfile('1', { name: 'New Name' })).rejects.toThrow(UnauthorizedException);
    });

    it('should update user profile successfully', async () => {
      const user = { id: '1', name: 'Old Name', email: 'test@example.com', phone: null, cpf: null, birthDate: null, role: UserRole.USER };
      mockUserRepository.findOne.mockResolvedValue(user);
      mockUserRepository.save.mockResolvedValue({ ...user, name: 'New Name' });

      const result = await service.updateProfile('1', { name: 'New Name' });

      expect(result).toHaveProperty('access_token');
    });
  });
});
