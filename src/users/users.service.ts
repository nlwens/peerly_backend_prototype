import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.users.findMany();
  }

  async findOne(id: string) {
    return this.prisma.users.findUnique({ where: { id } });
  }

  async create(data: any) {
    const existing = await this.prisma.users.findUnique({
      where: { email: data.email },
    });
  
    if (existing) {
      throw new HttpException('Email already registered', HttpStatus.BAD_REQUEST);
    }
  
    return this.prisma.users.create({ data });
  }

  async update(id: string, data: any) {
    return await this.prisma.users.update({
      where: { id },
      data: data,
    });
  }

  async updateToken(id: string, token_balance: number) {
    return this.prisma.users.update({
      where: { id },
      data: { token_balance },
    });
  }

  async remove(id: string) {
    return this.prisma.users.delete({ where: { id } });
  }

  async loginByName(name: string) {
    return this.prisma.users.findFirst({
      where: {
        name: name,
      },
    });
  }
}