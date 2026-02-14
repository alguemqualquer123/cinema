/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../entities/user.entity';
import {
  CreateUserDto,
  LoginDto,
  SocialLoginDto,
  UpdateProfileDto,
} from '../dto/user.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) { }

  async register(createUserDto: CreateUserDto) {
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    await this.userRepository.save(user);
    return await this.generateToken(user);
  }

  async login(loginDto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return await this.generateToken(user);
  }

  async validateUser(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }
    return user;
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async socialLogin(socialDto: SocialLoginDto) {
    let user = await this.userRepository.findOne({
      where: { email: socialDto.email },
    });

    if (!user) {
      user = this.userRepository.create({
        email: socialDto.email,
        name: socialDto.name,

        password: await bcrypt.hash(`social_${socialDto.providerId}`, 10),
        role: UserRole.USER,
      });
      await this.userRepository.save(user);
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is disabled');
    }

    return await this.generateToken(user);
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {

    if (!userId) {
      throw new UnauthorizedException('userId not defined');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (updateProfileDto.name) user.name = updateProfileDto.name;
    if (updateProfileDto.phone) user.phone = updateProfileDto.phone;
    if (updateProfileDto.cpf) user.cpf = updateProfileDto.cpf;
    if (updateProfileDto.birthDate)
      user.birthDate = new Date(updateProfileDto.birthDate);

    await this.userRepository.save(user);

    const token = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        cpf: user.cpf,
        birthDate: user.birthDate,
        role: user.role,
      },
    };
  }

  private async generateToken(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    const access_token = await this.jwtService.signAsync(payload);
    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }
}
