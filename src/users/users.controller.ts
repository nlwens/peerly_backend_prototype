import { Controller, Get, Post, Put, Delete, Param, Body, HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // GET /users
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  // GET /users/:id
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  // PUT /users/:id
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() body: {
    description?: string;
    major?: string;
    strengths?: string;
    needs_help_with?: string;
    profile_image_url?: string;
    education_level?: string;
  }) {
    try {
      return await this.usersService.update(id, body);
    } catch (error) {
      // P2025 means the record doesn't exist
      if (error.code === 'P2025') {
        throw new HttpException('User not found, update failed', HttpStatus.NOT_FOUND);
      }
      throw new HttpException('Internal server error during update', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // PUT /users/:id/token (update token balance)
  @Put(':id/token')
  @UseGuards(JwtAuthGuard)
  updateToken(@Param('id') id: string, @Body() body: { token_balance: number }) {
    return this.usersService.updateToken(id, body.token_balance);
  }

  // DELETE /users/:id
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}