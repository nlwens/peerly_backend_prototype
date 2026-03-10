import { Controller, Get, Post, Put, Delete, Param, Body, HttpException, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';

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
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  // POST /users
  @Post()
  create(@Body() body: {
    name: string;
    email: string;
    password_hash: string;
    major?: string;
    education_level?: string;
    strengths?: string;
    needs_help_with?: string;
    description?: string;
    token_balance?: number;
    profile_image_url?: string;
  }) {
    return this.usersService.create(body);
  }

// PUT /users/:id
@Put(':id')
async update(@Param('id') id: string, @Body() body: {
  description?: string;
  major?: string;
  strengths?: string;
  needs_help_with?: string;
  profile_image_url?: string;
  education_level?: string; // 别忘了这个字段，编辑页通常也会改它
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
  updateToken(@Param('id') id: string, @Body() body: { token_balance: number }) {
    return this.usersService.updateToken(id, body.token_balance);
  }

  // DELETE /users/:id
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Post('login-by-name')
  async loginByName(@Body() body: { name: string; password?: string }) {
    const user = await this.usersService.loginByName(body.name);
  
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
  
    return user; 
  }
}