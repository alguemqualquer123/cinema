/* eslint-disable prettier/prettier */
import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from '../services/auth.service';
import {
  CreateUserDto,
  LoginDto,
  SocialLoginDto,
  UpdateProfileDto,
} from '../dto/user.dto';
import { GoogleAuthGuard } from '../strategies/google-auth.guard';
import { Public } from '../../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../strategies/jwt-auth.guard';

interface GoogleUser {
  email: string;
  name: string;
  providerId: string;
}

@Controller('auth')
export class AuthController {
  // eslint-disable-next-line prettier/prettier
  constructor(private readonly authService: AuthService) { }

  @Public()
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('social')
  async socialLogin(@Body() socialDto: SocialLoginDto) {
    return this.authService.socialLogin(socialDto);
  }

  @Public()
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async googleAuth() { }

  @Public()
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(
    @Request() req: { user: GoogleUser },
    @Res() res: Response,
  ) {
    const { email, name, providerId } = req.user;
    const result = await this.authService.socialLogin({
      provider: 'google',
      email,
      name,
      providerId,
    });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const userEncoded = encodeURIComponent(JSON.stringify(result.user));
    res.redirect(
      `${frontendUrl}/auth/callback?token=${result.access_token}&user=${userEncoded}`,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Request() req: { user: { id: string } }) {
    return this.authService.findById(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('profile')
  async updateProfile(
    @Request() req: { user: { id: string } },
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.authService.updateProfile(req.user.id, updateProfileDto);
  }
}
