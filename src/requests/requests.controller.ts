import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { RequestsService } from './requests.service';

@Controller('users/:userId/requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  // GET /users/:userId/requests
  @Get()
  findAll(@Param('userId') userId: string) {
    return this.requestsService.findAll(userId);
  }

  // GET /users/:userId/requests/:id
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.requestsService.findOne(id);
  }

  // POST /users/:userId/requests
  @Post()
  create(@Param('userId') userId: string, @Body() body: {
    receiver_id: string;
    subject: string;
    type: 'REQUEST' | 'OFFER';
    scheduled_datetime?: string;
  }) {
    return this.requestsService.create(userId, body);
  }

  // PUT /users/:userId/requests/:id — update status
  @Put(':id')
  updateStatus(@Param('id') id: string, @Body() body: {
    status: 'ACCEPTED' | 'DECLINED' | 'CANCELED' | 'COMPLETED';
  }) {
    return this.requestsService.updateStatus(id, body.status);
  }

  // DELETE /users/:userId/requests/:id — only if PENDING, DECLINED, or CANCELED
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.requestsService.remove(id);
  }
}