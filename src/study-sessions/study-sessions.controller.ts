import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { StudySessionsService } from './study-sessions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users/:userId/sessions')
@UseGuards(JwtAuthGuard)
export class StudySessionsController {
  constructor(private readonly studySessionsService: StudySessionsService) {}

  // GET /users/:userId/sessions
  @Get()
  findAll(@Param('userId') userId: string) {
    return this.studySessionsService.findAll(userId);
  }

  // GET /users/:userId/sessions/:id
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.studySessionsService.findOne(id);
  }

  // POST /users/:userId/sessions — create session from request_id
  @Post()
  create(@Body() body: { request_id: string; scheduled_datetime?: string }) {
    return this.studySessionsService.create(body);
  }

  // PUT /users/:userId/sessions/:id — update datetime (also updates request)
  @Put(':id')
  update(@Param('id') id: string, @Body() body: { scheduled_datetime: string }) {
    return this.studySessionsService.updateDatetime(id, body.scheduled_datetime);
  }

  // DELETE /users/:userId/sessions/:id
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.studySessionsService.remove(id);
  }
}