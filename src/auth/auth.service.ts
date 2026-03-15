import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; 
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { RegisterDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService 
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.users.findUnique({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(dto.password, salt);

    const newUser = await this.prisma.users.create({
      data: {
        email: dto.email,
        name: dto.name,
        password_hash: hashedPassword,
      },
    });

    const { password_hash, ...result } = newUser;
    return result;
  }

  async login(email: string, pass: string) {
    const user = await this.prisma.users.findUnique({
      where: { email },
    });
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials'); 
    }

    const isMatch = await bcrypt.compare(pass, user.password_hash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        major: user.major,
        edu_level: user.education_level,
        strengths: user.strengths,
        needs_help_with: user.needs_help_with,
        description: user.description,
        token_balance: user.token_balance,
        created_at: user.created_at,
        profile_image_url: user.profile_image_url,
      }
    };
  }
}