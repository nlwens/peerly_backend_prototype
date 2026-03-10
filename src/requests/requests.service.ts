import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RequestsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    const requests = await this.prisma.requests.findMany({
      where: {
        OR: [
          { requester_id: userId },
          { receiver_id: userId }
        ]
      },
      include: {
        users_requests_requester_idTousers: { select: { name: true, profile_image_url: true } },
        users_requests_receiver_idTousers: { select: { name: true, profile_image_url: true } },
      }
    });
  
    return requests.map(req => {
      const isRequester = req.requester_id === userId;
      const otherUser = isRequester 
        ? req.users_requests_receiver_idTousers 
        : req.users_requests_requester_idTousers;
  
      return {
        ...req,
        other_user_name: otherUser?.name || 'Unknown User',
        other_user_avatar: otherUser?.profile_image_url || null,
      };
    });
  }

  async findOne(id: string) {
    return this.prisma.requests.findUnique({ where: { id } });
  }

  async create(requesterId: string, data: {
    receiver_id: string;
    subject: string;
    type: 'REQUEST' | 'OFFER';
    scheduled_datetime?: string;
  }) {
    return this.prisma.requests.create({
      data: {
        requester_id: requesterId,
        receiver_id: data.receiver_id,
        subject: data.subject,
        type: data.type as any,
        scheduled_datetime: data.scheduled_datetime ? new Date(data.scheduled_datetime) : null,
        status: 'PENDING',
      },
    });
  }

  async updateStatus(id: string, status: 'ACCEPTED' | 'DECLINED' | 'CANCELED' | 'COMPLETED') {
    const request = await this.prisma.requests.findUnique({ where: { id } });
    if (!request) throw new BadRequestException('Request not found');

    const updated = await this.prisma.requests.update({
      where: { id },
      data: { status: status as any },
    });

    if (status === 'ACCEPTED') {
      const existing = await this.prisma.study_sessions.findUnique({ where: { request_id: id } });
      if (!existing) {
        await this.prisma.study_sessions.create({
          data: {
            request_id: id,
            scheduled_datetime: request.scheduled_datetime,
          },
        });
      }
    }

    if (status === 'CANCELED') {
      await this.prisma.study_sessions.deleteMany({ where: { request_id: id } });
    }

    return updated;
  }

  async remove(id: string) {
    const request = await this.prisma.requests.findUnique({ where: { id } });
    if (!request) throw new BadRequestException('Request not found');

    const deletableStatuses = ['PENDING', 'DECLINED', 'CANCELED'];
    if (!deletableStatuses.includes(request.status as string)) {
      throw new BadRequestException(`Cannot delete a request with status ${request.status}`);
    }

    return this.prisma.requests.delete({ where: { id } });
  }
}