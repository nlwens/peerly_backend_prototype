import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StudySessionsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.study_sessions.findMany({
      where: {
        requests: {
          OR: [
            { requester_id: userId },
            { receiver_id: userId },
          ],
        },
      },
      include: { requests: true },
    });
  }

  async findOne(id: string) {
    return this.prisma.study_sessions.findUnique({
      where: { id },
      include: { requests: true },
    });
  }

  async create(data: { request_id: string; scheduled_datetime?: string }) {
    const request = await this.prisma.requests.findUnique({ where: { id: data.request_id } });
    if (!request) throw new BadRequestException('Request not found');

    const existing = await this.prisma.study_sessions.findUnique({ where: { request_id: data.request_id } });
    if (existing) throw new BadRequestException('Study session already exists for this request');

    return this.prisma.study_sessions.create({
      data: {
        request_id: data.request_id,
        scheduled_datetime: data.scheduled_datetime
          ? new Date(data.scheduled_datetime)
          : request.scheduled_datetime,
      },
    });
  }

  async updateDatetime(id: string, scheduled_datetime: string) {
    const session = await this.prisma.study_sessions.findUnique({ where: { id } });
    if (!session) throw new BadRequestException('Study session not found');

    const newDatetime = new Date(scheduled_datetime);

    // Update both study session and its linked request
    await this.prisma.requests.update({
      where: { id: session.request_id },
      data: { scheduled_datetime: newDatetime },
    });

    return this.prisma.study_sessions.update({
      where: { id },
      data: { scheduled_datetime: newDatetime },
    });
  }

  async remove(id: string) {
    const session = await this.prisma.study_sessions.findUnique({ where: { id } });
    if (!session) throw new BadRequestException('Study session not found');

    return this.prisma.study_sessions.delete({ where: { id } });
  }
}