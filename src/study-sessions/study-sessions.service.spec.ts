import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { StudySessionsService } from './study-sessions.service';
import { PrismaService } from '../prisma/prisma.service';

describe('StudySessionsService', () => {
  let service: StudySessionsService;
  let prisma: {
    study_sessions: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
    requests: {
      findUnique: jest.Mock;
      update: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      study_sessions: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      requests: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudySessionsService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<StudySessionsService>(StudySessionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return sessions for user (requester or receiver)', async () => {
      const sessions = [
        {
          id: 'session-1',
          request_id: 'req-1',
          requests: { requester_id: 'user-1', receiver_id: 'user-2' },
        },
      ];
      prisma.study_sessions.findMany.mockResolvedValue(sessions);

      const result = await service.findAll('user-1');

      expect(prisma.study_sessions.findMany).toHaveBeenCalledWith({
        where: {
          requests: {
            OR: [{ requester_id: 'user-1' }, { receiver_id: 'user-1' }],
          },
        },
        include: { requests: true },
      });
      expect(result).toEqual(sessions);
    });
  });

  describe('findOne', () => {
    it('should return a session by id with request', async () => {
      const session = {
        id: 'session-1',
        request_id: 'req-1',
        requests: { subject: 'Math' },
      };
      prisma.study_sessions.findUnique.mockResolvedValue(session);

      const result = await service.findOne('session-1');

      expect(prisma.study_sessions.findUnique).toHaveBeenCalledWith({
        where: { id: 'session-1' },
        include: { requests: true },
      });
      expect(result).toEqual(session);
    });
  });

  describe('create', () => {
    it('should throw BadRequestException when request not found', async () => {
      prisma.requests.findUnique.mockResolvedValue(null);

      await expect(
        service.create({ request_id: 'req-1' }),
      ).rejects.toThrow(BadRequestException);
      await expect(service.create({ request_id: 'req-1' })).rejects.toThrow('Request not found');
      expect(prisma.study_sessions.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when session already exists for request', async () => {
      prisma.requests.findUnique.mockResolvedValue({ id: 'req-1' });
      prisma.study_sessions.findUnique.mockResolvedValue({ id: 'session-1' });

      await expect(
        service.create({ request_id: 'req-1' }),
      ).rejects.toThrow(BadRequestException);
      await expect(service.create({ request_id: 'req-1' })).rejects.toThrow(
        'Study session already exists for this request',
      );
      expect(prisma.study_sessions.create).not.toHaveBeenCalled();
    });

    it('should create session with request scheduled_datetime when not provided', async () => {
      const request = {
        id: 'req-1',
        scheduled_datetime: new Date('2025-03-10T14:00:00Z'),
      };
      const created = { id: 'session-1', request_id: 'req-1', scheduled_datetime: request.scheduled_datetime };
      prisma.requests.findUnique.mockResolvedValue(request);
      prisma.study_sessions.findUnique.mockResolvedValue(null);
      prisma.study_sessions.create.mockResolvedValue(created);

      const result = await service.create({ request_id: 'req-1' });

      expect(prisma.study_sessions.create).toHaveBeenCalledWith({
        data: {
          request_id: 'req-1',
          scheduled_datetime: request.scheduled_datetime,
        },
      });
      expect(result).toEqual(created);
    });

    it('should use provided scheduled_datetime when given', async () => {
      const request = { id: 'req-1', scheduled_datetime: null };
      const dateStr = '2025-03-15T10:00:00Z';
      const created = { id: 'session-1', request_id: 'req-1', scheduled_datetime: new Date(dateStr) };
      prisma.requests.findUnique.mockResolvedValue(request);
      prisma.study_sessions.findUnique.mockResolvedValue(null);
      prisma.study_sessions.create.mockResolvedValue(created);

      await service.create({ request_id: 'req-1', scheduled_datetime: dateStr });

      expect(prisma.study_sessions.create).toHaveBeenCalledWith({
        data: {
          request_id: 'req-1',
          scheduled_datetime: new Date(dateStr),
        },
      });
    });
  });

  describe('updateDatetime', () => {
    it('should throw BadRequestException when session not found', async () => {
      prisma.study_sessions.findUnique.mockResolvedValue(null);

      await expect(
        service.updateDatetime('session-1', '2025-03-10T14:00:00Z'),
      ).rejects.toThrow(BadRequestException);
      await expect(service.updateDatetime('session-1', '2025-03-10T14:00:00Z')).rejects.toThrow(
        'Study session not found',
      );
    });

    it('should update both session and linked request datetime', async () => {
      const session = { id: 'session-1', request_id: 'req-1', scheduled_datetime: new Date() };
      const newDatetime = '2025-03-12T16:00:00Z';
      const updated = { ...session, scheduled_datetime: new Date(newDatetime) };
      prisma.study_sessions.findUnique.mockResolvedValue(session);
      prisma.requests.update.mockResolvedValue({});
      prisma.study_sessions.update.mockResolvedValue(updated);

      const result = await service.updateDatetime('session-1', newDatetime);

      expect(prisma.requests.update).toHaveBeenCalledWith({
        where: { id: 'req-1' },
        data: { scheduled_datetime: new Date(newDatetime) },
      });
      expect(prisma.study_sessions.update).toHaveBeenCalledWith({
        where: { id: 'session-1' },
        data: { scheduled_datetime: new Date(newDatetime) },
      });
      expect(result).toEqual(updated);
    });
  });

  describe('remove', () => {
    it('should throw BadRequestException when session not found', async () => {
      prisma.study_sessions.findUnique.mockResolvedValue(null);

      await expect(service.remove('session-1')).rejects.toThrow(BadRequestException);
      await expect(service.remove('session-1')).rejects.toThrow('Study session not found');
      expect(prisma.study_sessions.delete).not.toHaveBeenCalled();
    });

    it('should delete session', async () => {
      const session = { id: 'session-1', request_id: 'req-1' };
      prisma.study_sessions.findUnique.mockResolvedValue(session);
      prisma.study_sessions.delete.mockResolvedValue(session);

      const result = await service.remove('session-1');

      expect(prisma.study_sessions.delete).toHaveBeenCalledWith({ where: { id: 'session-1' } });
      expect(result).toEqual(session);
    });
  });
});
